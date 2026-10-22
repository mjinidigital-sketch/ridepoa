import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar35 } from "@/components/navbar35";
import { Footer2 } from "@/components/footer2";
import CarDetailView from "@/components/car-detail-view";
import { getCarBySlug, getSimilarCars } from "@/app/cars/actions";
import { Car, ArrowLeft } from "lucide-react";

export const instant = false;

interface CarPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
    const { slug } = await params;
    const car = await getCarBySlug(slug);

    if (!car) {
        return {
            title: "Car Not Found | RidePoa",
            description: "The requested vehicle listing could not be found on RidePoa.",
        };
    }

    const title = `${car.year} ${car.make} ${car.model} - RidePoa`;
    const description = `${car.year} ${car.make} ${car.model} in ${car.city}. ${car.fuelType}, ${car.transmission}. Price: KES ${car.price.toLocaleString()}.`;
    const image = car.thumbnailUrl || (car.images && car.images[0]) || "";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: image ? [{ url: image }] : [],
        },
    };
}

async function CarDetailContent({ slug }: { slug: string }) {
    const car = await getCarBySlug(slug);

    if (!car) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-16">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                    <Car className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Vehicle Not Found</h1>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                    The vehicle listing you are looking for may have been sold or removed.
                </p>
                <Link
                    href="/cars"
                    className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Cars
                </Link>
            </div>
        );
    }

    const similarCars = await getSimilarCars(car._id, car.category, car.make, 4);

    return <CarDetailView car={car} similarCars={similarCars} />;
}

export default async function CarDetailPage({ params }: CarPageProps) {
    const { slug } = await params;

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar35 />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Suspense
                    fallback={
                        <div className="py-24 text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Loading vehicle details...</p>
                        </div>
                    }
                >
                    <CarDetailContent slug={slug} />
                </Suspense>
            </main>

            <Footer2 />
        </div>
    );
}
