
import { Suspense } from "react";
import { Navbar35 } from "@/components/navbar35";
import CarHero from "@/components/hero";
import CarFilter from "@/components/car-filter";

export default function Home() {
  return (
    <>
      <Navbar35 />
      <CarHero />
      <Suspense
        fallback={
          <div className="py-24 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading featured cars...</p>
          </div>
        }
      >
        <CarFilter isHome={true} />
      </Suspense>
    </>
  );
}
