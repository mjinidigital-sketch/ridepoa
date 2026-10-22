"use client";

import * as React from "react";
import { useState, useTransition, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, Car, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCarListings, CarFilterParams, EnrichedCar } from "@/app/cars/actions";

export interface CarFilterProps {
    initialCars?: EnrichedCar[];
    initialSearch?: string;
    initialCategory?: string;
    initialMake?: string;
    isHome?: boolean;
}

export const MAKES = [
    "All", "Toyota", "Mercedes", "BMW", "Audi", "Honda", "Ford",
    "Volkswagen", "Nissan", "Hyundai", "Kia", "Mazda", "Subaru", "Tesla", "Lexus",
];

export const CATEGORIES = [
    "All", "SUV", "Sedan", "Pickup", "Wagon", "Electric", "Hatchback", "Coupe", "Van",
];

export const CONDITIONS = ["All", "Foreign Used", "Locally Used", "Brand New"];

export const FUEL_TYPES = ["All", "Petrol", "Diesel", "Electric", "Hybrid"];

export const TRANSMISSIONS = ["All", "Automatic", "Manual"];

export const CITIES = ["All", "Nairobi", "Mombasa", "Nakuru", "Eldoret", "Kisumu", "Thika"];

const ITEMS_PER_PAGE = 24;

export function formatPrice(price: number, currency: string = "KES"): string {
    return `${currency} ${price.toLocaleString()}`;
}

export function formatMileage(km: number, unit: string = "km"): string {
    return `${km.toLocaleString()} ${unit}`;
}

export default function CarFilter({
    initialCars = [],
    initialSearch = "",
    initialCategory = "",
    initialMake = "",
    isHome = false,
}: CarFilterProps) {
    const [isPending, startTransition] = useTransition();
    const [allCars, setAllCars] = useState<EnrichedCar[]>(initialCars);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [savedCarIds, setSavedCarIds] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedMake, setSelectedMake] = useState(initialMake || "All");
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All");
    const [selectedCondition, setSelectedCondition] = useState("All");
    const [selectedFuel, setSelectedFuel] = useState("All");
    const [selectedTransmission, setSelectedTransmission] = useState("All");
    const [selectedCity, setSelectedCity] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (initialCars.length === 0) {
            startTransition(async () => {
                const results = await getCarListings({
                    search: searchQuery || undefined,
                    makes: selectedMake !== "All" ? [selectedMake] : undefined,
                    categories: selectedCategory !== "All" ? [selectedCategory] : undefined,
                });
                setAllCars(results);
            });
        }
    }, []);

    const performSearch = useCallback(
        () => {
            const params: CarFilterParams = {
                search: searchQuery.trim() || undefined,
                makes: selectedMake !== "All" ? [selectedMake] : undefined,
                categories: selectedCategory !== "All" ? [selectedCategory] : undefined,
                conditions: selectedCondition !== "All" ? [selectedCondition.toLowerCase().replace(" ", "_")] : undefined,
                fuelTypes: selectedFuel !== "All" ? [selectedFuel.toLowerCase()] : undefined,
                transmissions: selectedTransmission !== "All" ? [selectedTransmission.toLowerCase()] : undefined,
                cities: selectedCity !== "All" ? [selectedCity] : undefined,
                sortBy: sortBy,
            };

            startTransition(async () => {
                const results = await getCarListings(params);
                setAllCars(results);
                setCurrentPage(1);
            });
        },
        [searchQuery, selectedMake, selectedCategory, selectedCondition, selectedFuel, selectedTransmission, selectedCity, sortBy]
    );

    useEffect(() => {
        performSearch();
    }, [selectedMake, selectedCategory, selectedCondition, selectedFuel, selectedTransmission, selectedCity, sortBy]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch();
    };

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedCarIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Pagination logic
    const totalPages = Math.ceil(allCars.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const displayedCars = allCars.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    };

    return (
        <div className="w-full bg-background text-foreground">
            {/* Filter Bar */}
            <div className="border-b border-border bg-card sticky top-16 z-30 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search cars..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>

                        {/* Filter Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Make</label>
                                <select
                                    value={selectedMake}
                                    onChange={(e) => setSelectedMake(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                >
                                    {MAKES.map((make) => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Condition</label>
                                <select
                                    value={selectedCondition}
                                    onChange={(e) => setSelectedCondition(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                >
                                    {CONDITIONS.map((cond) => (
                                        <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Fuel Type</label>
                                <select
                                    value={selectedFuel}
                                    onChange={(e) => setSelectedFuel(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                >
                                    {FUEL_TYPES.map((fuel) => (
                                        <option key={fuel} value={fuel}>{fuel}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Transmission</label>
                                <select
                                    value={selectedTransmission}
                                    onChange={(e) => setSelectedTransmission(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                >
                                    {TRANSMISSIONS.map((trans) => (
                                        <option key={trans} value={trans}>{trans}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Location</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                                >
                                    {CITIES.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-4">
                            <Button type="submit" className="h-9">
                                Search
                            </Button>

                            <div className="flex items-center gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="h-10 px-3 rounded-lg border bg-background text-sm"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="year_desc">Year: Newest</option>
                                    </select>
                                </div>

                                <div className="hidden sm:flex border rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("grid")}
                                        className={cn("p-2", viewMode === "grid" ? "bg-muted" : "")}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("list")}
                                        className={cn("p-2", viewMode === "list" ? "bg-muted" : "")}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {allCars.length} cars found
                    </p>
                    {isHome && allCars.length > ITEMS_PER_PAGE && (
                        <Link
                            href="/cars"
                            className="text-sm text-primary hover:underline"
                        >
                            View All Cars
                        </Link>
                    )}
                </div>

                {isPending && allCars.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                        Loading...
                    </div>
                ) : allCars.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No cars found</p>
                    </div>
                ) : (
                    <>
                        <div
                            className={cn(
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                                    : "flex flex-col gap-4"
                            )}
                        >
                            {displayedCars.map((car) => (
                                <CarCard
                                    key={car._id}
                                    car={car}
                                    viewMode={viewMode}
                                    isSaved={savedCarIds.includes(car._id)}
                                    onToggleFavorite={(e) => toggleFavorite(car._id, e)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className="h-9 px-4"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={cn(
                                                "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                                                currentPage === page
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-background hover:bg-muted"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="h-9 px-4"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="mt-4 text-center text-xs text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, allCars.length)} of {allCars.length} cars
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

interface CarCardProps {
    car: EnrichedCar;
    viewMode?: "grid" | "list";
    isSaved?: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
}

export function CarCard({ car, viewMode = "grid", isSaved = false, onToggleFavorite }: CarCardProps) {
    const carSlug = car.slug || car._id;
    const detailHref = `/cars/${encodeURIComponent(carSlug)}`;

    const allImages: string[] = [
        car.thumbnailUrl,
        ...(car.imageUrls ?? []),
        ...(car.images ?? []),
    ].filter((url): url is string => typeof url === "string" && url.length > 0);

    const uniqueImages = [...new Set(allImages)];
    const thumbnail = uniqueImages[0] ?? null;

    const isList = viewMode === "list";

    return (
        <div className="group">
            <div
                className={cn(
                    "border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow",
                    isList ? "flex" : ""
                )}
            >
                {/* Image */}
                <div
                    className={cn(
                        "relative bg-muted cursor-pointer",
                        isList ? "w-64 h-48 shrink-0" : "aspect-[16/10]"
                    )}
                >
                    <Link href={detailHref} className="block w-full h-full">
                        {thumbnail ? (
                            <img
                                src={thumbnail}
                                alt={car.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    const failed = img.getAttribute("data-failed-src") || img.src;
                                    img.setAttribute("data-failed-src", failed);
                                    const next = uniqueImages.find((u) => u !== failed && u !== img.src);
                                    if (next) {
                                        img.src = next;
                                    } else {
                                        img.style.display = "none";
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Car className="h-8 w-8 opacity-50" />
                            </div>
                        )}
                    </Link>

                    <button
                        type="button"
                        onClick={onToggleFavorite}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background z-10"
                    >
                        <Heart
                            className={cn("h-4 w-4", isSaved ? "fill-red-500 text-red-500" : "")}
                        />
                    </button>
                </div>

                {/* Content */}
                <div className={cn("p-4 flex flex-col", isList ? "flex-1" : "")}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{car.year}</span>
                        <span>{car.city}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {car.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                        {car.mileage.toLocaleString()} km • {car.transmission} • {car.fuelType}
                    </p>
                    <div className="text-sm font-semibold mb-3 pb-3 border-b border-border">
                        {formatPrice(car.price, car.currency)}
                    </div>
                    <div className="flex gap-2 pt-3">
                        <Link
                            href={detailHref}
                            className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                            View Car
                        </Link>
                        <a
                            href={`tel:${car.sellerContactPhone || "+254712345678"}`}
                            className="flex-1 h-9 rounded-lg border border-border text-xs font-medium flex items-center justify-center hover:bg-muted transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Contact Owner
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
