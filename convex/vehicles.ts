import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// -----------------------------------------------------------------------------
// STORAGE: GENERATE UPLOAD URL FOR IMAGES
// -----------------------------------------------------------------------------
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// -----------------------------------------------------------------------------
// HELPER: Resolve a vehicle's storage IDs → public URLs, attach seller info
// -----------------------------------------------------------------------------
async function enrichVehicle(ctx: any, vehicle: any) {
    const user = await ctx.db.get(vehicle.userId);

    // Resolve every image: Convex storage IDs become signed HTTPS URLs
    const resolvedImages: string[] = [];
    for (const img of (vehicle.images || [])) {
        if (typeof img === "string" && img.startsWith("http")) {
            resolvedImages.push(img);
        } else if (typeof img === "string" && img.length > 0) {
            const url = await ctx.storage.getUrl(img as any);
            if (url) resolvedImages.push(url);
        }
    }

    // Resolve thumbnail the same way
    let thumbnailUrl: string | null = vehicle.thumbnailUrl ?? null;
    if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
        thumbnailUrl = (await ctx.storage.getUrl(thumbnailUrl as any)) ?? null;
    }
    if (!thumbnailUrl && resolvedImages.length > 0) {
        thumbnailUrl = resolvedImages[0];
    }

    return {
        ...vehicle,
        images: resolvedImages,
        imageUrls: resolvedImages,
        thumbnailUrl: thumbnailUrl ?? undefined,
        seller: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                imageUrl: user.imageUrl,
            }
            : null,
    };
}

// -----------------------------------------------------------------------------
// LIST ALL VEHICLES
// -----------------------------------------------------------------------------
export const list = query({
    args: {
        category: v.optional(v.string()),
        status: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let vehicles = await ctx.db.query("vehicles").order("desc").collect();

        if (args.category && args.category !== "all") {
            vehicles = vehicles.filter((v) => v.category === args.category);
        }

        if (args.status && args.status !== "all") {
            vehicles = vehicles.filter((v) => v.status === args.status);
        }

        if (args.search) {
            const q = args.search.toLowerCase();
            vehicles = vehicles.filter(
                (v) =>
                    v.title.toLowerCase().includes(q) ||
                    v.make.toLowerCase().includes(q) ||
                    v.model.toLowerCase().includes(q) ||
                    (v.city && v.city.toLowerCase().includes(q)) ||
                    (v.registrationNumber && v.registrationNumber.toLowerCase().includes(q))
            );
        }

        return await Promise.all(vehicles.map((v) => enrichVehicle(ctx, v)));
    },
});


// -----------------------------------------------------------------------------
// GET VEHICLE BY ID
// -----------------------------------------------------------------------------
export const getById = query({
    args: { id: v.id("vehicles") },
    handler: async (ctx, args) => {
        const vehicle = await ctx.db.get(args.id);
        if (!vehicle) return null;
        return await enrichVehicle(ctx, vehicle);
    },
});

// -----------------------------------------------------------------------------
// REPAIR VEHICLE THUMBNAILS (Sets missing thumbnailUrl from first image only)
// -----------------------------------------------------------------------------
export const repairVehicleThumbnails = mutation({
    args: {},
    handler: async (ctx) => {
        const vehicles = await ctx.db.query("vehicles").collect();
        let repaired = 0;
        for (const veh of vehicles) {
            // Set thumbnailUrl from first image if missing
            if (!veh.thumbnailUrl && veh.images && veh.images.length > 0) {
                await ctx.db.patch(veh._id, {
                    thumbnailUrl: veh.images[0],
                    updatedAt: Date.now(),
                });
                repaired++;
            }
            // Also ensure thumbnailUrl is the first image even if it exists
            else if (veh.images && veh.images.length > 0 && veh.thumbnailUrl !== veh.images[0]) {
                await ctx.db.patch(veh._id, {
                    thumbnailUrl: veh.images[0],
                    updatedAt: Date.now(),
                });
                repaired++;
            }
        }
        return { success: true, count: repaired };
    },
});



// -----------------------------------------------------------------------------
// SEARCH & FILTER VEHICLES (Advanced Multi-faceted Search)
// -----------------------------------------------------------------------------
export const searchCars = query({
    args: {
        search: v.optional(v.string()),
        category: v.optional(v.string()),
        categories: v.optional(v.array(v.string())),
        makes: v.optional(v.array(v.string())),
        models: v.optional(v.array(v.string())),
        minPrice: v.optional(v.number()),
        maxPrice: v.optional(v.number()),
        minYear: v.optional(v.number()),
        maxYear: v.optional(v.number()),
        conditions: v.optional(v.array(v.string())),
        fuelTypes: v.optional(v.array(v.string())),
        transmissions: v.optional(v.array(v.string())),
        bodyTypes: v.optional(v.array(v.string())),
        cities: v.optional(v.array(v.string())),
        features: v.optional(v.array(v.string())),
        listingType: v.optional(v.string()),
        status: v.optional(v.string()),
        sortBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let vehicles = await ctx.db.query("vehicles").order("desc").collect();

        // Filter by status (default to active for public search unless specified)
        if (args.status && args.status !== "all") {
            vehicles = vehicles.filter((v) => v.status === args.status);
        } else if (!args.status) {
            // Default: show active vehicles
            const activeVehicles = vehicles.filter((v) => v.status === "active");
            if (activeVehicles.length > 0) {
                vehicles = activeVehicles;
            }
        }

        // Search text filter
        if (args.search && args.search.trim() !== "") {
            const terms = args.search.toLowerCase().trim().split(/\s+/);
            vehicles = vehicles.filter((v) => {
                const combined = [
                    v.title,
                    v.make,
                    v.model,
                    v.category,
                    v.trim || "",
                    v.bodyType || "",
                    v.city,
                    v.year.toString(),
                    v.transmission,
                    v.fuelType,
                    v.description || "",
                    ...(v.features || []),
                ]
                    .join(" ")
                    .toLowerCase();

                return terms.every((term) => combined.includes(term));
            });
        }

        // Single Category filter
        if (args.category && args.category !== "all") {
            vehicles = vehicles.filter((v) => v.category === args.category);
        }

        // Multi-category filter
        if (args.categories && args.categories.length > 0) {
            vehicles = vehicles.filter((v) => args.categories!.includes(v.category));
        }

        // Makes filter
        if (args.makes && args.makes.length > 0) {
            const lowerMakes = args.makes.map((m) => m.toLowerCase());
            vehicles = vehicles.filter((v) => lowerMakes.includes(v.make.toLowerCase()));
        }

        // Models filter
        if (args.models && args.models.length > 0) {
            const lowerModels = args.models.map((m) => m.toLowerCase());
            vehicles = vehicles.filter((v) => lowerModels.includes(v.model.toLowerCase()));
        }

        // Price range
        if (args.minPrice !== undefined && args.minPrice > 0) {
            vehicles = vehicles.filter((v) => v.price >= args.minPrice!);
        }
        if (args.maxPrice !== undefined && args.maxPrice > 0) {
            vehicles = vehicles.filter((v) => v.price <= args.maxPrice!);
        }

        // Year range
        if (args.minYear !== undefined && args.minYear > 0) {
            vehicles = vehicles.filter((v) => v.year >= args.minYear!);
        }
        if (args.maxYear !== undefined && args.maxYear > 0) {
            vehicles = vehicles.filter((v) => v.year <= args.maxYear!);
        }

        // Condition filter
        if (args.conditions && args.conditions.length > 0) {
            vehicles = vehicles.filter((v) => args.conditions!.includes(v.condition));
        }

        // Fuel Type filter
        if (args.fuelTypes && args.fuelTypes.length > 0) {
            vehicles = vehicles.filter((v) => args.fuelTypes!.includes(v.fuelType));
        }

        // Transmission filter
        if (args.transmissions && args.transmissions.length > 0) {
            vehicles = vehicles.filter((v) => args.transmissions!.includes(v.transmission));
        }

        // Body types
        if (args.bodyTypes && args.bodyTypes.length > 0) {
            vehicles = vehicles.filter((v) => v.bodyType && args.bodyTypes!.includes(v.bodyType));
        }

        // Cities filter
        if (args.cities && args.cities.length > 0) {
            const lowerCities = args.cities.map((c) => c.toLowerCase());
            vehicles = vehicles.filter((v) => lowerCities.includes(v.city.toLowerCase()));
        }

        // Features filter (all required features match)
        if (args.features && args.features.length > 0) {
            vehicles = vehicles.filter((v) =>
                args.features!.every((f) =>
                    (v.features || []).some((vf) => vf.toLowerCase() === f.toLowerCase())
                )
            );
        }

        // Listing Type filter
        if (args.listingType && args.listingType !== "all") {
            vehicles = vehicles.filter((v) => v.listingType === args.listingType);
        }

        // Sorting
        const sortBy = args.sortBy || "newest";
        vehicles.sort((a, b) => {
            if (sortBy === "price_asc") return a.price - b.price;
            if (sortBy === "price_desc") return b.price - a.price;
            if (sortBy === "year_desc") return b.year - a.year;
            if (sortBy === "year_asc") return a.year - b.year;
            if (sortBy === "mileage_asc") return a.mileage - b.mileage;
            if (sortBy === "featured") {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.createdAt - a.createdAt;
            }
            // default newest
            return b.createdAt - a.createdAt;
        });

        // Enrich the results
        const enriched = await Promise.all(vehicles.map((v) => enrichVehicle(ctx, v)));
        return enriched;
    },
});

// -----------------------------------------------------------------------------
// GET VEHICLE BY SLUG OR ID
// -----------------------------------------------------------------------------
export const getBySlugOrId = query({
    args: { slugOrId: v.string() },
    handler: async (ctx, args) => {
        let vehicle: any = null;

        // Try getting by Convex ID
        try {
            vehicle = await ctx.db.get(args.slugOrId as any);
        } catch {
            // Not a direct ID, ignore error and search by slug
        }

        if (!vehicle) {
            const allVehicles = await ctx.db.query("vehicles").collect();
            const target = args.slugOrId.toLowerCase().trim();

            vehicle = allVehicles.find((v) => {
                if (v.slug && v.slug.toLowerCase() === target) return true;
                if (v._id === target) return true;
                const autoSlug = `${v.year}-${v.make}-${v.model}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                if (autoSlug === target) return true;

                const titleSlug = v.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                return titleSlug === target;
            });
        }

        if (!vehicle) return null;

        return await enrichVehicle(ctx, vehicle);
    },
});

// -----------------------------------------------------------------------------
// GET SIMILAR CARS
// -----------------------------------------------------------------------------
export const getSimilarCars = query({
    args: {
        vehicleId: v.id("vehicles"),
        category: v.optional(v.string()),
        make: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 4;
        let vehicles = await ctx.db
            .query("vehicles")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        // Exclude current vehicle
        vehicles = vehicles.filter((v) => v._id !== args.vehicleId);

        // Sort by similarity: same category & make first, then same category, then same make
        vehicles.sort((a, b) => {
            const scoreA =
                (args.category && a.category === args.category ? 2 : 0) +
                (args.make && a.make.toLowerCase() === args.make.toLowerCase() ? 2 : 0);
            const scoreB =
                (args.category && b.category === args.category ? 2 : 0) +
                (args.make && b.make.toLowerCase() === args.make.toLowerCase() ? 2 : 0);
            return scoreB - scoreA;
        });

        const selected = vehicles.slice(0, limit);
        return await Promise.all(selected.map((v) => enrichVehicle(ctx, v)));
    },
});

// -----------------------------------------------------------------------------
// GET FILTER FACETS (Unique values and counts for filter UI)
// -----------------------------------------------------------------------------
export const getFilterFacets = query({
    args: {},
    handler: async (ctx) => {
        const vehicles = await ctx.db.query("vehicles").collect();

        const makesMap: Record<string, number> = {};
        const categoriesMap: Record<string, number> = {};
        const fuelTypesMap: Record<string, number> = {};
        const conditionsMap: Record<string, number> = {};
        const transmissionsMap: Record<string, number> = {};
        const citiesMap: Record<string, number> = {};
        const featuresMap: Record<string, number> = {};

        let minPrice = Infinity;
        let maxPrice = 0;
        let minYear = Infinity;
        let maxYear = 0;

        for (const v of vehicles) {
            if (v.status !== "active" && v.status !== "pending_approval") continue;

            if (v.make) makesMap[v.make] = (makesMap[v.make] || 0) + 1;
            if (v.category) categoriesMap[v.category] = (categoriesMap[v.category] || 0) + 1;
            if (v.fuelType) fuelTypesMap[v.fuelType] = (fuelTypesMap[v.fuelType] || 0) + 1;
            if (v.condition) conditionsMap[v.condition] = (conditionsMap[v.condition] || 0) + 1;
            if (v.transmission) transmissionsMap[v.transmission] = (transmissionsMap[v.transmission] || 0) + 1;
            if (v.city) citiesMap[v.city] = (citiesMap[v.city] || 0) + 1;

            if (v.features && Array.isArray(v.features)) {
                for (const f of v.features) {
                    featuresMap[f] = (featuresMap[f] || 0) + 1;
                }
            }

            if (v.price < minPrice) minPrice = v.price;
            if (v.price > maxPrice) maxPrice = v.price;
            if (v.year < minYear) minYear = v.year;
            if (v.year > maxYear) maxYear = v.year;
        }

        return {
            totalCount: vehicles.length,
            makes: Object.entries(makesMap).map(([name, count]) => ({ name, count })),
            categories: Object.entries(categoriesMap).map(([name, count]) => ({ name, count })),
            fuelTypes: Object.entries(fuelTypesMap).map(([name, count]) => ({ name, count })),
            conditions: Object.entries(conditionsMap).map(([name, count]) => ({ name, count })),
            transmissions: Object.entries(transmissionsMap).map(([name, count]) => ({ name, count })),
            cities: Object.entries(citiesMap).map(([name, count]) => ({ name, count })),
            features: Object.entries(featuresMap).map(([name, count]) => ({ name, count })),
            priceRange: {
                min: minPrice === Infinity ? 0 : minPrice,
                max: maxPrice === 0 ? 25000000 : maxPrice,
            },
            yearRange: {
                min: minYear === Infinity ? 2012 : minYear,
                max: maxYear === 0 ? new Date().getFullYear() : maxYear,
            },
        };
    },
});

// -----------------------------------------------------------------------------
// SEED INITIAL VEHICLES (If marketplace is empty, populates realistic listings)
// -----------------------------------------------------------------------------
export const seedSampleCars = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("vehicles").take(1);
        if (existing.length > 0) {
            return { seeded: false, message: "Vehicles already exist in database" };
        }

        // Find or create a demo user
        let user = await ctx.db.query("users").first();
        if (!user) {
            const userId = await ctx.db.insert("users", {
                name: "RidePoa Verified Motors",
                email: "motors@ridepoa.co.ke",
                phone: "+254 712 345 678",
                role: "dealer",
                isDealer: true,
                dealershipName: "RidePoa Verified Motors",
                dealerRating: 4.9,
                location: "Westlands, Nairobi",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            user = await ctx.db.get(userId);
        }

        if (!user) throw new Error("Could not create user for seeding");

        const sampleCars = [
            {
                userId: user._id,
                title: "2023 Toyota Land Cruiser Prado TX-L",
                slug: "2023-toyota-land-cruiser-prado-txl",
                category: "suv" as const,
                make: "Toyota",
                model: "Land Cruiser Prado",
                year: 2023,
                trim: "TX-L Package 4WD",
                bodyType: "SUV",
                registrationNumber: "KDF 123X",
                vinOrChassisNumber: "TRJ150-0192837",
                price: 8900000,
                currency: "KES",
                negotiable: true,
                listingType: "sell" as const,
                status: "active" as const,
                featured: true,
                urgent: false,
                condition: "foreign_used" as const,
                mileage: 18500,
                mileageUnit: "km" as const,
                locallyDriven: false,
                femaleOwned: false,
                accidentFree: true,
                repainted: false,
                originalPaint: true,
                serviceHistory: "full" as const,
                dutyPaid: true,
                logbookAvailable: true,
                fuelType: "diesel" as const,
                transmission: "automatic" as const,
                drivetrain: "4wd" as const,
                engineSizeCc: 2800,
                horsepower: 201,
                fuelConsumption: "12.5 km/L",
                exteriorColor: "Pearl White",
                interiorColor: "Beige Leather",
                interiorMaterial: "leather" as const,
                doorsCount: 5,
                seatingCapacity: 7,
                city: "Nairobi",
                stateOrCounty: "Nairobi County",
                country: "Kenya",
                address: "Westlands Commercial Centre, Ring Road",
                features: [
                    "Sunroof",
                    "360-Degree Camera",
                    "Leather Seats",
                    "Heated Front Seats",
                    "Apple CarPlay & Android Auto",
                    "Lane Departure Alert",
                    "Adaptive Cruise Control",
                    "Keyless Entry & Push Start",
                    "Multi-terrain Select",
                    "Diff Lock",
                    "Power Tailgate",
                ],
                images: [
                    "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
                ],
                description:
                    "Pristine condition 2023 Toyota Land Cruiser Prado TX-L 2.8L Turbo Diesel. Just cleared from Japan with verified auction sheet (Grade 4.5B). Genuine low mileage, immaculate beige leather upholstery, sunroof, Modellista styling kit, 360-degree cameras, and brand-new all-terrain tyres. Ready for immediate ownership transfer.",
                sellerContactPhone: "+254 712 345 678",
                sellerContactWhatsApp: "+254 712 345 678",
                allowWhatsAppChat: true,
            },
            {
                userId: user._id,
                title: "2021 Mercedes-Benz C200 AMG Line",
                slug: "2021-mercedes-benz-c200-amg-line",
                category: "sedan" as const,
                make: "Mercedes-Benz",
                model: "C-Class",
                year: 2021,
                trim: "C200 AMG Line Mild-Hybrid",
                bodyType: "Sedan",
                registrationNumber: "KDE 889Y",
                vinOrChassisNumber: "WDD2050802R81923",
                price: 6450000,
                currency: "KES",
                negotiable: true,
                listingType: "sell" as const,
                status: "active" as const,
                featured: true,
                urgent: false,
                condition: "foreign_used" as const,
                mileage: 32000,
                mileageUnit: "km" as const,
                locallyDriven: false,
                femaleOwned: false,
                accidentFree: true,
                repainted: false,
                originalPaint: true,
                serviceHistory: "full" as const,
                dutyPaid: true,
                logbookAvailable: true,
                fuelType: "petrol" as const,
                transmission: "automatic" as const,
                drivetrain: "rwd" as const,
                engineSizeCc: 1500,
                horsepower: 197,
                fuelConsumption: "15.8 km/L",
                exteriorColor: "Obsidian Black Metallic",
                interiorColor: "Black Artico Leather",
                interiorMaterial: "leather" as const,
                doorsCount: 4,
                seatingCapacity: 5,
                city: "Nairobi",
                country: "Kenya",
                features: [
                    "AMG Body Styling",
                    "Panoramic Glass Sunroof",
                    "Burmester Surround Sound",
                    "Ambient Lighting 64 Colors",
                    "Digital Instrument Cluster",
                    "Active Parking Assist",
                    "Wireless Phone Charging",
                    "Blind Spot Assist",
                ],
                images: [
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
                ],
                description:
                    "Executive 2021 Mercedes-Benz C200 AMG Line in immaculate Obsidian Black. Featuring the latest EQ Boost mild-hybrid powertrain for exceptional fuel economy and responsive power. Comes loaded with Burmester audio, panoramic glass roof, 64-color ambient cabin lighting, and diamond radiator grille.",
                sellerContactPhone: "+254 722 990 011",
                sellerContactWhatsApp: "+254 722 990 011",
                allowWhatsAppChat: true,
            },
            {
                userId: user._id,
                title: "2020 Mazda CX-5 2.2D XD L-Package",
                slug: "2020-mazda-cx-5-xd-l-package",
                category: "suv" as const,
                make: "Mazda",
                model: "CX-5",
                year: 2020,
                trim: "XD L-Package AWD",
                bodyType: "SUV",
                registrationNumber: "KDD 456L",
                price: 3850000,
                currency: "KES",
                negotiable: true,
                listingType: "sell" as const,
                status: "active" as const,
                featured: false,
                urgent: true,
                condition: "foreign_used" as const,
                mileage: 46000,
                mileageUnit: "km" as const,
                locallyDriven: false,
                femaleOwned: false,
                accidentFree: true,
                repainted: false,
                originalPaint: true,
                serviceHistory: "full" as const,
                dutyPaid: true,
                logbookAvailable: true,
                fuelType: "diesel" as const,
                transmission: "automatic" as const,
                drivetrain: "awd" as const,
                engineSizeCc: 2200,
                horsepower: 190,
                fuelConsumption: "16.2 km/L",
                exteriorColor: "Soul Red Crystal",
                interiorColor: "Pure White Leather",
                interiorMaterial: "leather" as const,
                doorsCount: 5,
                seatingCapacity: 5,
                city: "Mombasa",
                country: "Kenya",
                features: [
                    "Bose 10-Speaker Audio",
                    "Head-Up Display (HUD)",
                    "Heated & Ventilated Seats",
                    "Adaptive LED Headlights",
                    "Sunroof",
                    "Power Liftgate",
                    "Smart City Brake Support",
                ],
                images: [
                    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
                ],
                description:
                    "Stunning Soul Red Crystal Mazda CX-5 XD L-Package. Twin-turbo diesel torque with incredible highway cruising efficiency. Features flagship white nappa leather, Bose sound, heads-up display, and 19-inch high-gloss alloy wheels.",
                sellerContactPhone: "+254 733 112 233",
                sellerContactWhatsApp: "+254 733 112 233",
                allowWhatsAppChat: true,
            },
            {
                userId: user._id,
                title: "2022 Tesla Model Y Long Range AWD",
                slug: "2022-tesla-model-y-long-range",
                category: "ev" as const,
                make: "Tesla",
                model: "Model Y",
                year: 2022,
                trim: "Long Range Dual Motor AWD",
                bodyType: "SUV",
                registrationNumber: "KDF 778Z",
                price: 7800000,
                currency: "KES",
                negotiable: true,
                listingType: "sell" as const,
                status: "active" as const,
                featured: true,
                urgent: false,
                condition: "foreign_used" as const,
                mileage: 24000,
                mileageUnit: "km" as const,
                locallyDriven: false,
                femaleOwned: false,
                accidentFree: true,
                repainted: false,
                originalPaint: true,
                dutyPaid: true,
                logbookAvailable: true,
                fuelType: "electric" as const,
                transmission: "automatic" as const,
                drivetrain: "awd" as const,
                batteryCapacityKwh: 78,
                electricRangeKm: 510,
                horsepower: 384,
                exteriorColor: "Solid Black",
                interiorColor: "All Black Premium",
                interiorMaterial: "synthetic" as const,
                doorsCount: 5,
                seatingCapacity: 5,
                city: "Nairobi",
                country: "Kenya",
                features: [
                    "Full Self-Driving Computer",
                    "15-Inch Touchscreen Display",
                    "All-Glass Panoramic Roof",
                    "Over-the-Air Software Updates",
                    "Sentry Mode Security",
                    "Premium Audio 14 Speakers",
                    "Type 2 / CCS Charging Port",
                ],
                images: [
                    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1200&q=80",
                ],
                description:
                    "Step into zero emissions luxury with this 2022 Tesla Model Y Long Range AWD. 510km real-world range, supercharger compatible with CCS2 combo adapter. Includes wall charger for home charging in Kenya. Blistering 0-100 km/h in 4.8 seconds.",
                sellerContactPhone: "+254 712 345 678",
                sellerContactWhatsApp: "+254 712 345 678",
                allowWhatsAppChat: true,
            },
            {
                userId: user._id,
                title: "2021 Isuzu D-Max 3.0 V-Cross 4x4",
                slug: "2021-isuzu-dmax-30-vcross-4x4",
                category: "pickup" as const,
                make: "Isuzu",
                model: "D-Max",
                year: 2021,
                trim: "V-Cross 3.0L Double Cab",
                bodyType: "Pickup",
                registrationNumber: "KDC 321M",
                price: 4950000,
                currency: "KES",
                negotiable: true,
                listingType: "sell" as const,
                status: "active" as const,
                featured: false,
                urgent: false,
                condition: "locally_used" as const,
                mileage: 58000,
                mileageUnit: "km" as const,
                locallyDriven: true,
                femaleOwned: false,
                accidentFree: true,
                repainted: false,
                originalPaint: true,
                serviceHistory: "full" as const,
                dutyPaid: true,
                logbookAvailable: true,
                fuelType: "diesel" as const,
                transmission: "automatic" as const,
                drivetrain: "4wd" as const,
                engineSizeCc: 3000,
                horsepower: 190,
                payloadCapacityKg: 1050,
                towingCapacityKg: 3500,
                exteriorColor: "Valencia Orange Metallic",
                interiorColor: "Dark Grey Fabric",
                interiorMaterial: "fabric" as const,
                doorsCount: 4,
                seatingCapacity: 5,
                city: "Nakuru",
                country: "Kenya",
                features: [
                    "Canopy / Tonneau Cover",
                    "Heavy-Duty Tow Bar",
                    "Differential Lock",
                    "Touchscreen with Apple CarPlay",
                    "Hill Descent Control",
                    "Side Steps",
                    "Reverse Camera",
                ],
                images: [
                    "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
                ],
                description:
                    "Unstoppable workhorse and leisure double cab. 2021 Isuzu D-Max V-Cross 3.0L 4WD. Single owner since new, serviced strictly at Isuzu Kenya with complete receipts. Robust 4JJ3 powertrain capable of towing 3.5 tonnes with ease.",
                sellerContactPhone: "+254 720 445 566",
                sellerContactWhatsApp: "+254 720 445 566",
                allowWhatsAppChat: true,
            },
            {
                userId: user._id,
                title: "2019 Subaru Outback 2.5i Limited",
                slug: "2019-subaru-outback-25i-limited",
                category: "station_wagon" as const,
                make: "Subaru",
                model: "Outback",
                year: 2019,
                trim: "2.5i Limited Eyesight",
                bodyType: "Station Wagon",
                registrationNumber: "KDB 910P",
                price: 3250000,
                currency: "KES",
                negotiable: true,
                listingType: "sell" as const,
                status: "active" as const,
                featured: false,
                urgent: false,
                condition: "foreign_used" as const,
                mileage: 51000,
                mileageUnit: "km" as const,
                locallyDriven: false,
                femaleOwned: false,
                accidentFree: true,
                repainted: false,
                originalPaint: true,
                dutyPaid: true,
                logbookAvailable: true,
                fuelType: "petrol" as const,
                transmission: "automatic" as const,
                drivetrain: "awd" as const,
                engineSizeCc: 2500,
                horsepower: 175,
                exteriorColor: "Tungsten Metallic",
                interiorColor: "Black Leather",
                interiorMaterial: "leather" as const,
                doorsCount: 5,
                seatingCapacity: 5,
                city: "Eldoret",
                country: "Kenya",
                features: [
                    "EyeSight Driver Assist",
                    "Harman Kardon Audio",
                    "X-Mode with Hill Descent",
                    "Heated Front & Rear Seats",
                    "Power Sunroof",
                    "Roof Rails with Integrated Crossbars",
                ],
                images: [
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
                ],
                description:
                    "The ultimate all-weather Kenyan road tripper. 2019 Subaru Outback 2.5i Limited with legendary Symmetrical All-Wheel Drive and 8.7 inches of ground clearance. Sourced directly from Tokyo with verified Grade 4 inspection.",
                sellerContactPhone: "+254 722 789 012",
                sellerContactWhatsApp: "+254 722 789 012",
                allowWhatsAppChat: true,
            },
        ];

        const insertedIds = [];
        const now = Date.now();
        for (const car of sampleCars) {
            const id = await ctx.db.insert("vehicles", {
                ...car,
                thumbnailUrl: car.images[0],
                viewsCount: Math.floor(Math.random() * 450) + 50,
                savesCount: Math.floor(Math.random() * 40) + 5,
                inquiriesCount: Math.floor(Math.random() * 15) + 1,
                publishedAt: now,
                createdAt: now - Math.floor(Math.random() * 10000000),
                updatedAt: now,
            });
            insertedIds.push(id);
        }

        return { seeded: true, count: insertedIds.length };
    },
});


// -----------------------------------------------------------------------------
// GET USERS FOR SELLER SELECTION
// -----------------------------------------------------------------------------
export const getUsersForSelect = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.map((u) => ({
            _id: u._id,
            name: u.name,
            email: u.email || "",
            phone: u.phone || "",
            role: u.role || "user",
        }));
    },
});

// -----------------------------------------------------------------------------
// CREATE VEHICLE
// -----------------------------------------------------------------------------
export const create = mutation({
    args: {
        userId: v.id("users"),
        sellerClerkId: v.optional(v.string()),

        // 1. Basic Identification
        title: v.string(),
        slug: v.optional(v.string()),
        category: v.union(
            v.literal("sedan"),
            v.literal("suv"),
            v.literal("lorry"),
            v.literal("pickup"),
            v.literal("ev"),
            v.literal("bike"),
            v.literal("farm_equipment"),
            v.literal("bus"),
            v.literal("minibus"),
            v.literal("van"),
            v.literal("station_wagon"),
            v.literal("hatchback"),
            v.literal("coupe"),
            v.literal("convertible"),
            v.literal("heavy_machinery"),
            v.literal("other")
        ),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        trim: v.optional(v.string()),
        bodyType: v.optional(v.string()),
        vinOrChassisNumber: v.optional(v.string()),
        registrationNumber: v.optional(v.string()),

        // 2. Pricing & Listing Modality
        price: v.number(),
        currency: v.string(),
        negotiable: v.boolean(),
        listingType: v.union(
            v.literal("sell"),
            v.literal("rent"),
            v.literal("lease"),
            v.literal("auction")
        ),
        status: v.union(
            v.literal("draft"),
            v.literal("pending_approval"),
            v.literal("active"),
            v.literal("reserved"),
            v.literal("sold"),
            v.literal("archived")
        ),
        featured: v.optional(v.boolean()),
        urgent: v.optional(v.boolean()),

        // 3. Condition, History & Badges
        condition: v.union(
            v.literal("brand_new"),
            v.literal("foreign_used"),
            v.literal("locally_used")
        ),
        mileage: v.number(),
        mileageUnit: v.union(v.literal("km"), v.literal("miles")),
        locallyDriven: v.boolean(),
        femaleOwned: v.boolean(),
        accidentFree: v.boolean(),
        repainted: v.boolean(),
        originalPaint: v.optional(v.boolean()),
        numberOfPreviousOwners: v.optional(v.number()),
        serviceHistory: v.optional(
            v.union(v.literal("full"), v.literal("partial"), v.literal("none"))
        ),
        dutyPaid: v.optional(v.boolean()),
        logbookAvailable: v.optional(v.boolean()),
        warrantyRemainingMonths: v.optional(v.number()),

        // 4. Engine, Powertrain & Performance
        fuelType: v.union(
            v.literal("petrol"),
            v.literal("diesel"),
            v.literal("electric"),
            v.literal("hybrid"),
            v.literal("plug_in_hybrid"),
            v.literal("cng_lpg"),
            v.literal("other")
        ),
        transmission: v.union(
            v.literal("automatic"),
            v.literal("manual"),
            v.literal("cvt"),
            v.literal("dual_clutch"),
            v.literal("semi_automatic")
        ),
        drivetrain: v.optional(
            v.union(
                v.literal("fwd"),
                v.literal("rwd"),
                v.literal("4wd"),
                v.literal("awd")
            )
        ),
        engineSizeCc: v.optional(v.number()),
        horsepower: v.optional(v.number()),
        fuelConsumption: v.optional(v.string()),

        // 5. Category-Specific Attributes
        batteryCapacityKwh: v.optional(v.number()),
        electricRangeKm: v.optional(v.number()),
        chargingTimeHours: v.optional(v.number()),
        seatingCapacity: v.optional(v.number()),
        payloadCapacityKg: v.optional(v.number()),
        towingCapacityKg: v.optional(v.number()),
        operatingHours: v.optional(v.number()),
        ptoHorsepower: v.optional(v.number()),

        // 6. Cosmetics
        exteriorColor: v.string(),
        interiorColor: v.optional(v.string()),
        interiorMaterial: v.optional(
            v.union(
                v.literal("leather"),
                v.literal("fabric"),
                v.literal("synthetic"),
                v.literal("alcantara"),
                v.literal("other")
            )
        ),
        doorsCount: v.optional(v.number()),

        // 7. Equipment & Features
        features: v.array(v.string()),

        // 8. Location
        city: v.string(),
        stateOrCounty: v.optional(v.string()),
        country: v.string(),
        address: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),

        // 9. Media (Array of Convex storage IDs or URLs)
        images: v.array(v.string()),
        thumbnailUrl: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        inspectionReportUrl: v.optional(v.string()),

        // 10. Narrative & Contacts
        description: v.string(),
        sellerContactPhone: v.optional(v.string()),
        sellerContactWhatsApp: v.optional(v.string()),
        allowWhatsAppChat: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const vehicleId = await ctx.db.insert("vehicles", {
            ...args,
            thumbnailUrl: args.thumbnailUrl || (args.images.length > 0 ? args.images[0] : undefined),
            viewsCount: 0,
            savesCount: 0,
            inquiriesCount: 0,
            publishedAt: args.status === "active" ? now : undefined,
            createdAt: now,
            updatedAt: now,
        });
        return vehicleId;
    },
});

// -----------------------------------------------------------------------------
// UPDATE VEHICLE
// -----------------------------------------------------------------------------
export const update = mutation({
    args: {
        id: v.id("vehicles"),
        userId: v.optional(v.id("users")),
        sellerClerkId: v.optional(v.string()),

        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        category: v.optional(
            v.union(
                v.literal("sedan"),
                v.literal("suv"),
                v.literal("lorry"),
                v.literal("pickup"),
                v.literal("ev"),
                v.literal("bike"),
                v.literal("farm_equipment"),
                v.literal("bus"),
                v.literal("minibus"),
                v.literal("van"),
                v.literal("station_wagon"),
                v.literal("hatchback"),
                v.literal("coupe"),
                v.literal("convertible"),
                v.literal("heavy_machinery"),
                v.literal("other")
            )
        ),
        make: v.optional(v.string()),
        model: v.optional(v.string()),
        year: v.optional(v.number()),
        trim: v.optional(v.string()),
        bodyType: v.optional(v.string()),
        vinOrChassisNumber: v.optional(v.string()),
        registrationNumber: v.optional(v.string()),

        price: v.optional(v.number()),
        currency: v.optional(v.string()),
        negotiable: v.optional(v.boolean()),
        listingType: v.optional(
            v.union(
                v.literal("sell"),
                v.literal("rent"),
                v.literal("lease"),
                v.literal("auction")
            )
        ),
        status: v.optional(
            v.union(
                v.literal("draft"),
                v.literal("pending_approval"),
                v.literal("active"),
                v.literal("reserved"),
                v.literal("sold"),
                v.literal("archived")
            )
        ),
        featured: v.optional(v.boolean()),
        urgent: v.optional(v.boolean()),

        condition: v.optional(
            v.union(
                v.literal("brand_new"),
                v.literal("foreign_used"),
                v.literal("locally_used")
            )
        ),
        mileage: v.optional(v.number()),
        mileageUnit: v.optional(v.union(v.literal("km"), v.literal("miles"))),
        locallyDriven: v.optional(v.boolean()),
        femaleOwned: v.optional(v.boolean()),
        accidentFree: v.optional(v.boolean()),
        repainted: v.optional(v.boolean()),
        originalPaint: v.optional(v.boolean()),
        numberOfPreviousOwners: v.optional(v.number()),
        serviceHistory: v.optional(
            v.union(v.literal("full"), v.literal("partial"), v.literal("none"))
        ),
        dutyPaid: v.optional(v.boolean()),
        logbookAvailable: v.optional(v.boolean()),
        warrantyRemainingMonths: v.optional(v.number()),

        fuelType: v.optional(
            v.union(
                v.literal("petrol"),
                v.literal("diesel"),
                v.literal("electric"),
                v.literal("hybrid"),
                v.literal("plug_in_hybrid"),
                v.literal("cng_lpg"),
                v.literal("other")
            )
        ),
        transmission: v.optional(
            v.union(
                v.literal("automatic"),
                v.literal("manual"),
                v.literal("cvt"),
                v.literal("dual_clutch"),
                v.literal("semi_automatic")
            )
        ),
        drivetrain: v.optional(
            v.union(
                v.literal("fwd"),
                v.literal("rwd"),
                v.literal("4wd"),
                v.literal("awd")
            )
        ),
        engineSizeCc: v.optional(v.number()),
        horsepower: v.optional(v.number()),
        fuelConsumption: v.optional(v.string()),

        batteryCapacityKwh: v.optional(v.number()),
        electricRangeKm: v.optional(v.number()),
        chargingTimeHours: v.optional(v.number()),
        seatingCapacity: v.optional(v.number()),
        payloadCapacityKg: v.optional(v.number()),
        towingCapacityKg: v.optional(v.number()),
        operatingHours: v.optional(v.number()),
        ptoHorsepower: v.optional(v.number()),

        exteriorColor: v.optional(v.string()),
        interiorColor: v.optional(v.string()),
        interiorMaterial: v.optional(
            v.union(
                v.literal("leather"),
                v.literal("fabric"),
                v.literal("synthetic"),
                v.literal("alcantara"),
                v.literal("other")
            )
        ),
        doorsCount: v.optional(v.number()),

        features: v.optional(v.array(v.string())),

        city: v.optional(v.string()),
        stateOrCounty: v.optional(v.string()),
        country: v.optional(v.string()),
        address: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),

        images: v.optional(v.array(v.string())),
        thumbnailUrl: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        inspectionReportUrl: v.optional(v.string()),

        description: v.optional(v.string()),
        sellerContactPhone: v.optional(v.string()),
        sellerContactWhatsApp: v.optional(v.string()),
        allowWhatsAppChat: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        const existing = await ctx.db.get(id);
        if (!existing) {
            throw new Error(`Vehicle with id ${id} not found`);
        }

        const updates: Record<string, any> = {
            ...fields,
            updatedAt: Date.now(),
        };

        if (fields.images && fields.images.length > 0 && !fields.thumbnailUrl) {
            updates.thumbnailUrl = fields.images[0];
        }

        if (fields.status === "active" && !existing.publishedAt) {
            updates.publishedAt = Date.now();
        }

        await ctx.db.patch(id, updates);
        return id;
    },
});

// -----------------------------------------------------------------------------
// UPDATE VEHICLE STATUS
// -----------------------------------------------------------------------------
export const updateStatus = mutation({
    args: {
        id: v.id("vehicles"),
        status: v.union(
            v.literal("draft"),
            v.literal("pending_approval"),
            v.literal("active"),
            v.literal("reserved"),
            v.literal("sold"),
            v.literal("archived")
        ),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Vehicle not found");

        await ctx.db.patch(args.id, {
            status: args.status,
            publishedAt: args.status === "active" ? (existing.publishedAt || Date.now()) : existing.publishedAt,
            updatedAt: Date.now(),
        });
        return args.id;
    },
});

// -----------------------------------------------------------------------------
// TOGGLE FEATURED
// -----------------------------------------------------------------------------
export const toggleFeatured = mutation({
    args: {
        id: v.id("vehicles"),
        featured: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            featured: args.featured,
            updatedAt: Date.now(),
        });
        return args.id;
    },
});

// -----------------------------------------------------------------------------
// REMOVE VEHICLE & CLEAN UP ASSOCIATED STORAGE
// -----------------------------------------------------------------------------
export const remove = mutation({
    args: { id: v.id("vehicles") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Vehicle not found");

        // Clean up stored images from Convex storage
        if (existing.images && existing.images.length > 0) {
            for (const img of existing.images) {
                if (!img.startsWith("http")) {
                    try {
                        await ctx.storage.delete(img as any);
                    } catch (e) {
                        // ignore if file already removed
                    }
                }
            }
        }

        // Delete associated favorites
        const favorites = await ctx.db
            .query("favorites")
            .withIndex("byVehicle", (q) => q.eq("vehicleId", args.id))
            .collect();
        for (const fav of favorites) {
            await ctx.db.delete(fav._id);
        }

        // Delete associated inquiries
        const inquiries = await ctx.db
            .query("inquiries")
            .withIndex("byVehicle", (q) => q.eq("vehicleId", args.id))
            .collect();
        for (const inq of inquiries) {
            await ctx.db.delete(inq._id);
        }

        // Delete associated inspections
        const inspections = await ctx.db
            .query("inspections")
            .withIndex("byVehicle", (q) => q.eq("vehicleId", args.id))
            .collect();
        for (const insp of inspections) {
            await ctx.db.delete(insp._id);
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});
