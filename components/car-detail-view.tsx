"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
    Heart,
    Share2,
    MapPin,
    ChevronLeft,
    ChevronRight,
    X,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { formatPrice, formatMileage } from "@/components/car-filter";
import { EnrichedCar } from "@/app/cars/actions";
import { CarCard } from "@/components/car-filter";

interface CarDetailViewProps {
    car: EnrichedCar;
    similarCars?: EnrichedCar[];
}

export default function CarDetailView({ car, similarCars = [] }: CarDetailViewProps) {
    const rawImages = [
        ...(car.imageUrls ?? []),
        ...(car.images ?? []),
        car.thumbnailUrl,
    ].filter((url): url is string => typeof url === "string" && url.length > 0);
    const images = [...new Set(rawImages)];

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const nextImage = () => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!");
        }
    };

    const sellerPhone = car.sellerContactPhone || car.seller?.phone || "+254 712 345 678";
    const whatsAppNumber = (car.sellerContactWhatsApp || sellerPhone).replace(/[^0-9]/g, "");
    const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
        `Hello, I'm interested in the ${car.title} on RidePoa.`
    )}`;

    return (
        <div className="w-full">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-between">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">Home</Link>
                    <span>/</span>
                    <Link href="/cars" className="hover:text-foreground">Cars</Link>
                    <span>/</span>
                    <span className="text-foreground truncate max-w-[200px]">{car.title}</span>
                </nav>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsSaved(!isSaved);
                            toast.success(isSaved ? "Removed from saved" : "Saved!");
                        }}
                        className={isSaved ? "border-red-500 text-red-500" : ""}
                    >
                        <Heart className={cn("h-4 w-4 mr-2", isSaved && "fill-red-500")} />
                        {isSaved ? "Saved" : "Save"}
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Gallery & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Gallery */}
                    <div className="relative aspect-[16/10] bg-muted rounded-lg overflow-hidden border">
                        {images.length > 0 ? (
                            <img
                                src={images[activeImageIndex]}
                                alt={car.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const el = e.currentTarget;
                                    const failed = el.getAttribute("data-failed") || el.src;
                                    el.setAttribute("data-failed", failed);
                                    const next = images.find((u) => u !== failed && u !== el.src);
                                    if (next) { el.src = next; } else { el.style.display = "none"; }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No photos
                            </div>
                        )}

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        {images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                                {activeImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={cn(
                                        "aspect-[4/3] rounded-lg overflow-hidden border-2",
                                        activeImageIndex === idx
                                            ? "border-primary"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Key Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted">
                        <div>
                            <div className="text-xs text-muted-foreground">Mileage</div>
                            <div className="font-semibold">{formatMileage(car.mileage, car.mileageUnit)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Transmission</div>
                            <div className="font-semibold capitalize">{car.transmission}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Fuel</div>
                            <div className="font-semibold capitalize">{car.fuelType}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Engine</div>
                            <div className="font-semibold">{car.engineSizeCc ? `${car.engineSizeCc}cc` : "N/A"}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="border rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Description</h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {car.description}
                        </p>
                    </div>

                    {/* Features */}
                    {car.features && car.features.length > 0 && (
                        <div className="border rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Features</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {car.features.map((feature, i) => (
                                    <div key={i} className="text-sm flex items-center gap-2">
                                        <span className="text-primary">•</span>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Specs */}
                    <div className="border rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Specifications</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Make</span>
                                <span className="font-medium">{car.make}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Model</span>
                                <span className="font-medium">{car.model}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Year</span>
                                <span className="font-medium">{car.year}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Category</span>
                                <span className="font-medium capitalize">{car.category}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Color</span>
                                <span className="font-medium">{car.exteriorColor}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Condition</span>
                                <span className="font-medium capitalize">{car.condition}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Price & Contact */}
                <div className="space-y-6">
                    <div className="border rounded-lg p-6 sticky top-24">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            {car.city}, {car.country || "Kenya"}
                        </div>

                        <h1 className="text-2xl font-bold mb-2">{car.title}</h1>
                        <p className="text-sm text-muted-foreground mb-4">
                            {car.year} • {car.category} • {car.trim}
                        </p>

                        <div className="text-3xl font-bold mb-6">
                            {formatPrice(car.price, car.currency)}
                        </div>

                        <div className="space-y-3">
                            <a
                                href={whatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-12 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2"
                            >
                                Chat on WhatsApp
                            </a>

                            <a
                                href={`tel:${sellerPhone}`}
                                className="w-full h-12 rounded-lg border font-semibold flex items-center justify-center gap-2 hover:bg-muted"
                            >
                                Call Seller
                            </a>
                        </div>

                        {/* Seller Info */}
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="font-semibold mb-3">Seller</h3>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    {car.seller?.name?.charAt(0) || "R"}
                                </div>
                                <div>
                                    <div className="font-medium">{car.seller?.name || "RidePoa Dealer"}</div>
                                    <div className="text-sm text-muted-foreground">{car.city}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Cars */}
            {similarCars.length > 0 && (
                <section className="mt-12 pt-8 border-t">
                    <h2 className="text-xl font-bold mb-6">Similar Cars</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarCars.map((similar) => (
                            <CarCard
                                key={similar._id}
                                car={similar}
                                isSaved={false}
                                onToggleFavorite={(e) => {
                                    e.preventDefault();
                                    toast.success("Saved!");
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between text-white">
                        <span className="text-sm">{car.title}</span>
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="relative flex-1 flex items-center justify-center">
                        <img
                            src={images[activeImageIndex]}
                            alt={car.title}
                            className="max-h-full max-w-full object-contain"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActiveImageIndex(i)}
                                className={cn(
                                    "h-12 w-16 rounded-md overflow-hidden border-2 shrink-0",
                                    activeImageIndex === i ? "border-primary" : "border-transparent opacity-50"
                                )}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
