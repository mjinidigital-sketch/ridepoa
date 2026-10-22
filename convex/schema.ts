import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // -------------------------------------------------------------------------
    // USERS TABLE
    // -------------------------------------------------------------------------
    users: defineTable({
        // Core fields (used by Clerk webhook upsert)
        name: v.string(),
        externalId: v.optional(v.string()),

        // Legacy / extended profile fields
        clerkId: v.optional(v.string()),
        email: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.optional(v.string()), // e.g. "buyer", "seller", "dealer", "admin"
        status: v.optional(v.string()),
        tokenIdentifier: v.optional(v.string()),
        notes: v.optional(v.string()),
        verified: v.optional(v.boolean()),
        ridesCount: v.optional(v.number()),

        // Seller / Dealer specific attributes
        isDealer: v.optional(v.boolean()),
        dealershipName: v.optional(v.string()),
        dealerLicenseNumber: v.optional(v.string()),
        dealerRating: v.optional(v.number()),
        totalListingsCount: v.optional(v.number()),
        location: v.optional(v.string()),

        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    }).index("byExternalId", ["externalId"]),

    // -------------------------------------------------------------------------
    // VEHICLES TABLE (Comprehensive Car & Auto Marketplace Listings)
    // -------------------------------------------------------------------------
    vehicles: defineTable({
        // Seller / Owner linkage
        userId: v.id("users"),
        sellerClerkId: v.optional(v.string()),

        // 1. Basic Identification & Categorization
        title: v.string(), // e.g., "2021 Toyota Land Cruiser Prado TX-L"
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
        make: v.string(), // e.g., "Toyota", "Tesla", "Massey Ferguson", "Isuzu"
        model: v.string(), // e.g., "Prado", "Model Y", "D-Max", "Boxer 150"
        year: v.number(), // Year of manufacture, e.g. 2020
        trim: v.optional(v.string()), // e.g., "TX-L", "V8", "Long Wheelbase"
        bodyType: v.optional(v.string()), // e.g., "Crossover", "Tipper", "Tractor"
        vinOrChassisNumber: v.optional(v.string()),
        registrationNumber: v.optional(v.string()), // Plate number (can be masked in UI)

        // 2. Pricing & Listing Modality
        price: v.number(),
        currency: v.string(), // e.g., "KES", "USD", "EUR"
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

        // 3. Condition, History & Special Badges
        condition: v.union(
            v.literal("brand_new"),
            v.literal("foreign_used"),
            v.literal("locally_used")
        ),
        mileage: v.number(),
        mileageUnit: v.union(v.literal("km"), v.literal("miles")),
        locallyDriven: v.boolean(), // Locally driven flag
        femaleOwned: v.boolean(), // Female owned / carefully driven flag
        accidentFree: v.boolean(), // 100% accident-free flag
        repainted: v.boolean(), // Whether car has undergone repainting
        originalPaint: v.optional(v.boolean()), // Has original factory paint
        numberOfPreviousOwners: v.optional(v.number()),
        serviceHistory: v.optional(
            v.union(v.literal("full"), v.literal("partial"), v.literal("none"))
        ),
        dutyPaid: v.optional(v.boolean()), // Import duty / local tax cleared
        logbookAvailable: v.optional(v.boolean()), // Title deed / logbook ready for transfer
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
        engineSizeCc: v.optional(v.number()), // Displacement in CC (e.g. 2000, 2700)
        horsepower: v.optional(v.number()), // HP / BHP
        fuelConsumption: v.optional(v.string()), // e.g. "14 km/L"

        // 5. Category-Specific Attributes (EVs, Lorries, Farm Equipment, Buses)
        // EV Specifics:
        batteryCapacityKwh: v.optional(v.number()), // e.g. 75 kWh
        electricRangeKm: v.optional(v.number()), // Range on full charge
        chargingTimeHours: v.optional(v.number()),

        // Commercial / Heavy / Farm / Bus Specifics:
        seatingCapacity: v.optional(v.number()), // e.g. 14 for matatu/minibus, 50 for bus
        payloadCapacityKg: v.optional(v.number()), // For lorries, trucks & pickups
        towingCapacityKg: v.optional(v.number()),
        operatingHours: v.optional(v.number()), // For tractors & farm equipment engine hours
        ptoHorsepower: v.optional(v.number()), // Farm machinery Power Take-Off HP

        // 6. Exterior & Interior Cosmetics
        exteriorColor: v.string(), // e.g., "Pearl White", "Metallic Black"
        interiorColor: v.optional(v.string()), // e.g., "Beige", "Black Leather"
        interiorMaterial: v.optional(
            v.union(
                v.literal("leather"),
                v.literal("fabric"),
                v.literal("synthetic"),
                v.literal("alcantara"),
                v.literal("other")
            )
        ),
        doorsCount: v.optional(v.number()), // e.g. 2, 4, 5

        // 7. Equipment, Comfort & Safety Features List
        // e.g. ["Sunroof", "360 Camera", "Apple CarPlay", "Lane Assist", "Leather Seats"]
        features: v.array(v.string()),

        // 8. Location & Geocoding
        city: v.string(), // e.g. "Nairobi", "Mombasa", "Nakuru"
        stateOrCounty: v.optional(v.string()),
        country: v.string(), // e.g. "Kenya"
        address: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),

        // 9. Media Assets & Documents
        images: v.array(v.string()), // URLs or storage IDs
        thumbnailUrl: v.optional(v.string()),
        videoUrl: v.optional(v.string()), // Walkthrough or exhaust sound video
        inspectionReportUrl: v.optional(v.string()), // PDF inspection link

        // 10. Seller Contact & Listing Narrative
        description: v.string(),
        sellerContactPhone: v.optional(v.string()),
        sellerContactWhatsApp: v.optional(v.string()),
        allowWhatsAppChat: v.optional(v.boolean()),

        // 11. Metrics & Timestamps
        viewsCount: v.optional(v.number()),
        savesCount: v.optional(v.number()),
        inquiriesCount: v.optional(v.number()),
        publishedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byUser", ["userId"])
        .index("byCategory", ["category"])
        .index("byStatus", ["status"])
        .index("byCategoryAndStatus", ["category", "status"])
        .index("byMake", ["make"])
        .index("byMakeAndModel", ["make", "model"])
        .index("byPrice", ["price"])
        .index("byYear", ["year"])
        .index("byCity", ["city"])
        .index("byFeatured", ["featured", "status"]),

    // -------------------------------------------------------------------------
    // VEHICLE INQUIRIES & OFFERS TABLE (Buyer-Seller Interaction)
    // -------------------------------------------------------------------------
    inquiries: defineTable({
        vehicleId: v.id("vehicles"),
        buyerId: v.id("users"),
        sellerId: v.id("users"),
        type: v.union(
            v.literal("inquiry"),
            v.literal("offer"),
            v.literal("test_drive_request"),
            v.literal("inspection_request")
        ),
        message: v.string(),
        offeredPrice: v.optional(v.number()),
        preferredTestDriveDate: v.optional(v.number()),
        buyerContactPhone: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("accepted"),
            v.literal("declined"),
            v.literal("countered"),
            v.literal("closed")
        ),
        counterOfferPrice: v.optional(v.number()),
        sellerResponse: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byVehicle", ["vehicleId"])
        .index("byBuyer", ["buyerId"])
        .index("bySeller", ["sellerId"])
        .index("byVehicleAndBuyer", ["vehicleId", "buyerId"]),

    // -------------------------------------------------------------------------
    // SAVED / FAVORITE VEHICLES TABLE (Wishlist for Buyers)
    // -------------------------------------------------------------------------
    favorites: defineTable({
        userId: v.id("users"),
        vehicleId: v.id("vehicles"),
        createdAt: v.number(),
    })
        .index("byUser", ["userId"])
        .index("byVehicle", ["vehicleId"])
        .index("byUserAndVehicle", ["userId", "vehicleId"]),

    // -------------------------------------------------------------------------
    // VEHICLE INSPECTION REPORTS TABLE (Certified Pre-purchase Inspections)
    // -------------------------------------------------------------------------
    inspections: defineTable({
        vehicleId: v.id("vehicles"),
        inspectorId: v.optional(v.id("users")),
        inspectorName: v.string(),
        overallScore: v.number(), // 0 to 100
        engineTransmissionScore: v.optional(v.number()),
        bodyPaintScore: v.optional(v.number()),
        interiorScore: v.optional(v.number()),
        suspensionBrakesScore: v.optional(v.number()),
        tiresScore: v.optional(v.number()),
        electricalsScore: v.optional(v.number()),
        accidentHistoryDetected: v.boolean(),
        repaintedPanelsDetected: v.boolean(),
        originalMileageVerified: v.boolean(),
        notes: v.optional(v.string()),
        reportPdfUrl: v.optional(v.string()),
        inspectionDate: v.number(),
        createdAt: v.number(),
    }).index("byVehicle", ["vehicleId"]),

    // -------------------------------------------------------------------------
    // SELLER REVIEWS & RATINGS TABLE
    // -------------------------------------------------------------------------
    reviews: defineTable({
        sellerId: v.id("users"),
        reviewerId: v.id("users"),
        vehicleId: v.optional(v.id("vehicles")),
        rating: v.number(), // 1 to 5 stars
        comment: v.string(),
        createdAt: v.number(),
    })
        .index("bySeller", ["sellerId"])
        .index("byReviewer", ["reviewerId"]),
});
