import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar35 } from "@/components/navbar35";
import { Footer2 } from "@/components/footer2";
import CarFilter from "@/components/car-filter";
import { getCarListings, CarFilterParams } from "@/app/cars/actions";
import { ShieldCheck, Award, ThumbsUp, Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "Cars for Sale in Kenya | RidePoa Marketplace",
    description:
        "Discover verified, duty-paid, clean import and locally-used cars for sale in Kenya. Toyota, Mercedes-Benz, Mazda, Subaru, Tesla and more on RidePoa.",
};

export const instant = false;

interface CarsPageProps {
    searchParams?: Promise<{
        search?: string;
        category?: string;
        make?: string;
        minPrice?: string;
        maxPrice?: string;
        condition?: string;
        fuelType?: string;
        transmission?: string;
        city?: string;
        sort?: string;
    }>;
}

async function CarFilterContent({
    search,
    category,
    make,
    minPrice,
    maxPrice,
    condition,
    fuelType,
    transmission,
    city,
    sort,
}: {
    search?: string;
    category?: string;
    make?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    city?: string;
    sort?: string;
}) {
    const filterParams: CarFilterParams = {
        search,
        category,
        makes: make ? [make] : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        conditions: condition ? [condition] : undefined,
        fuelTypes: fuelType ? [fuelType] : undefined,
        transmissions: transmission ? [transmission] : undefined,
        cities: city ? [city] : undefined,
        sortBy: sort || "newest",
    };

    const initialCars = await getCarListings(filterParams);

    return (
        <CarFilter
            initialCars={initialCars}
            initialSearch={search || ""}
            initialCategory={category || ""}
            initialMake={make || ""}
        />
    );
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
    const resolvedParams = searchParams ? await searchParams : {};

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
            {/* Main Navbar */}
            <Navbar35 />

            {/* Main Interactive Filter & Listings Engine */}
            <main className="flex-1">
                <Suspense
                    fallback={
                        <div className="py-24 text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Loading vehicle inventory...</p>
                        </div>
                    }
                >
                    <CarFilterContent
                        search={resolvedParams.search}
                        category={resolvedParams.category}
                        make={resolvedParams.make}
                        minPrice={resolvedParams.minPrice}
                        maxPrice={resolvedParams.maxPrice}
                        condition={resolvedParams.condition}
                        fuelType={resolvedParams.fuelType}
                        transmission={resolvedParams.transmission}
                        city={resolvedParams.city}
                        sort={resolvedParams.sort}
                    />
                </Suspense>
            </main>

            {/* Footer */}
            <Footer2 />
        </div>
    );
}
