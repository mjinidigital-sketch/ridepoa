"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function getConvexClient() {
    if (!convexUrl) {
        throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
    }
    return new ConvexHttpClient(convexUrl);
}

export interface CarFilterParams {
    search?: string;
    category?: string;
    categories?: string[];
    makes?: string[];
    models?: string[];
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    conditions?: string[];
    fuelTypes?: string[];
    transmissions?: string[];
    bodyTypes?: string[];
    cities?: string[];
    features?: string[];
    listingType?: string;
    status?: string;
    sortBy?: string;
}

export interface EnrichedCar {
    _id: Id<"vehicles">;
    _creationTime: number;
    userId: Id<"users">;
    sellerClerkId?: string;
    title: string;
    slug?: string;
    category: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    bodyType?: string;
    vinOrChassisNumber?: string;
    registrationNumber?: string;
    price: number;
    currency: string;
    negotiable: boolean;
    listingType: "sell" | "rent" | "lease" | "auction";
    status: "draft" | "pending_approval" | "active" | "reserved" | "sold" | "archived";
    featured?: boolean;
    urgent?: boolean;
    condition: "brand_new" | "foreign_used" | "locally_used";
    mileage: number;
    mileageUnit: "km" | "miles";
    locallyDriven: boolean;
    femaleOwned: boolean;
    accidentFree: boolean;
    repainted: boolean;
    originalPaint?: boolean;
    numberOfPreviousOwners?: number;
    serviceHistory?: "full" | "partial" | "none";
    dutyPaid?: boolean;
    logbookAvailable?: boolean;
    warrantyRemainingMonths?: number;
    fuelType: string;
    transmission: string;
    drivetrain?: string;
    engineSizeCc?: number;
    horsepower?: number;
    fuelConsumption?: string;
    batteryCapacityKwh?: number;
    electricRangeKm?: number;
    chargingTimeHours?: number;
    seatingCapacity?: number;
    payloadCapacityKg?: number;
    towingCapacityKg?: number;
    operatingHours?: number;
    exteriorColor: string;
    interiorColor?: string;
    interiorMaterial?: string;
    doorsCount?: number;
    features: string[];
    city: string;
    stateOrCounty?: string;
    country: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    images: string[];
    imageUrls?: string[];
    thumbnailUrl?: string;
    videoUrl?: string;
    inspectionReportUrl?: string;
    description: string;
    sellerContactPhone?: string;
    sellerContactWhatsApp?: string;
    allowWhatsAppChat?: boolean;
    seller?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        role?: string;
        imageUrl?: string;
    } | null;
    viewsCount?: number;
    savesCount?: number;
    inquiriesCount?: number;
    publishedAt?: number;
    createdAt: number;
    updatedAt: number;
}

/**
 * Server Action: Fetch vehicles matching multi-faceted filters
 */
export async function getCarListings(params: CarFilterParams = {}): Promise<EnrichedCar[]> {
    const client = getConvexClient();

    try {
        const cars = (await client.query(api.vehicles.searchCars, params)) as EnrichedCar[];
        return cars ?? [];
    } catch (error) {
        console.error("Error fetching cars in server action:", error);
        return [];
    }
}

/**
 * Server Action: Fetch car details by slug or convex ID
 */
export async function getCarBySlug(slugOrId: string): Promise<EnrichedCar | null> {
    const client = getConvexClient();

    try {
        const car = (await client.query(api.vehicles.getBySlugOrId, {
            slugOrId,
        })) as EnrichedCar | null;

        return car ?? null;
    } catch (error) {
        console.error("Error fetching car by slug in server action:", error);
        return null;
    }
}

/**
 * Server Action: Fetch similar cars for recommendations
 */
export async function getSimilarCars(
    vehicleId: string,
    category?: string,
    make?: string,
    limit: number = 4
): Promise<EnrichedCar[]> {
    const client = getConvexClient();

    try {
        const similar = (await client.query(api.vehicles.getSimilarCars, {
            vehicleId: vehicleId as Id<"vehicles">,
            category,
            make,
            limit,
        })) as EnrichedCar[];

        return similar || [];
    } catch (error) {
        console.error("Error fetching similar cars in server action:", error);
        return [];
    }
}

/**
 * Server Action: Fetch dynamic filter facets (counts, options, bounds)
 */
export async function getFilterFacets() {
    const client = getConvexClient();

    try {
        return await client.query(api.vehicles.getFilterFacets, {});
    } catch (error) {
        console.error("Error fetching filter facets in server action:", error);
        return {
            totalCount: 0,
            makes: [],
            categories: [],
            fuelTypes: [],
            conditions: [],
            transmissions: [],
            cities: [],
            features: [],
            priceRange: { min: 0, max: 25000000 },
            yearRange: { min: 2012, max: new Date().getFullYear() },
        };
    }
}
