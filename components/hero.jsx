"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CarHero() {
  const [brand, setBrand] = useState("all");
  const [model, setModel] = useState("all");
  const [budget, setBudget] = useState("all");
  const [year, setYear] = useState("all");
  const [searched, setSearched] = useState(false);

  return (
    <section className="relative w-full bg-background text-foreground py-6 px-4 sm:px-6  font-sans transition-colors flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-3.5">
        {/* Bento Grid: Main Card (fills 80% on mobile) + 3 Desktop Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-[68vh] lg:h-[62vh]">
          {/* Card 1: Dominant Toyota Prado (Fills 80% mobile space, 7 cols on desktop) */}
          <div className="lg:col-span-7 bg-card border border-border rounded-2xl relative overflow-hidden shadow-md group flex flex-col justify-between p-6 sm:p-8 h-[68vh] lg:h-full">
            {/* Dominant Car Image - 100% photo opacity, vivid, no white overlay */}
            <img
              src="https://global.toyota/pages/news/images/2024/04/18/1330/003.jpg"
              alt="Toyota Prado TX-L"
              className="absolute inset-0 w-full  h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle bottom-only text scrim strictly behind text, leaving car dominant */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />

            {/* Top Empty Space */}
            <div className="relative z-20" />

            {/* Title & Featured Vehicle Info at Bottom of Card 1 */}
            <div className="relative z-20 space-y-2 max-w-xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                Buy or Sell <br />
                Cars in Kenya
              </h1>

            </div>
          </div>

          {/* Right Column: 3 Car Cards (HIDDEN ON MOBILE, visible on lg desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-3.5 h-full">
            {/* Card 2: Dominant Toyota Hilux 4x4 (Top Half) */}
            <div className="bg-card border border-border rounded-2xl relative overflow-hidden shadow-md group flex flex-col justify-end p-5 flex-1 min-h-[160px]">
              <img
                src="https://images.unsplash.com/photo-1630265928002-f77575fb279e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10 pointer-events-none" />

              <div className="relative z-20 flex items-end justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white drop-shadow-sm">
                    Toyota Hilux Double Cab
                  </h3>
                </div>
                <div className="text-right">

                </div>
              </div>
            </div>

            {/* Bottom Row: 2 Dominant Split Cards (Card 3 & Card 4) */}
            <div className="grid grid-cols-2 gap-3.5 flex-1">
              {/* Card 3: Dominant Honda CR-V */}
              <div className="bg-card border border-border rounded-2xl relative overflow-hidden shadow-md group flex flex-col justify-end p-4 min-h-[150px]">
                <img
                  src="https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2027/CR-V/VLP/Feature-Blades/Performance/Performance_01_L.jpg?sc_lang=en"
                  alt="Honda CR-V"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10 pointer-events-none" />

                <div className="relative z-20 space-y-0.5">
                  <h3 className="text-base font-bold text-white drop-shadow-sm">
                    Honda CR-V AWD
                  </h3>
                  <p className="text-[11px] text-white/80">1.5L Turbo • 18 km/L</p>

                </div>
              </div>

              {/* Card 4: Dominant Toyota Harrier Hybrid */}
              <div className="bg-card border border-border rounded-2xl relative overflow-hidden shadow-md group flex flex-col justify-end p-4 min-h-[150px]">
                <img
                  src="https://global.toyota/pages/news/images/2020/06/17/1330/001.jpg"
                  alt="Toyota Harrier"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10 pointer-events-none" />

                <div className="relative z-20 space-y-0.5">
                  <h3 className="text-base font-bold text-white drop-shadow-sm">
                    Toyota Harrier
                  </h3>
                  <p className="text-[11px] text-white/80">2.5L Hybrid • Leather</p>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar Beneath Bento */}
        <div className="w-full bg-card border border-border rounded-2xl shadow-md overflow-hidden mt-4">
          <div className="grid grid-cols-2 md:flex md:flex-row items-stretch">

            {/* Brand Filter */}
            <div className="col-span-1 flex-1 flex flex-col gap-1 px-3.5 py-2.5 sm:px-4 sm:py-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Brand
              </label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger
                  className="cursor-pointer w-full border-none bg-transparent shadow-none px-0 h-auto text-xs sm:text-sm font-semibold text-foreground focus-visible:ring-0 focus-visible:border-transparent gap-1.5 sm:gap-2"
                >
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="subaru">Subaru</SelectItem>
                  <SelectItem value="nissan">Nissan</SelectItem>
                  <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                  <SelectItem value="bmw">BMW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Filter */}
            <div className="col-span-1 flex-1 flex flex-col gap-1 px-3.5 py-2.5 sm:px-4 sm:py-3 border-l border-border">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Model
              </label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger
                  className="cursor-pointer w-full border-none bg-transparent shadow-none px-0 h-auto text-xs sm:text-sm font-semibold text-foreground focus-visible:ring-0 focus-visible:border-transparent gap-1.5 sm:gap-2"
                >
                  <SelectValue placeholder="All Models" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="prado">Prado TX-L</SelectItem>
                  <SelectItem value="hilux">Hilux Double Cab</SelectItem>
                  <SelectItem value="crv">Honda CR-V</SelectItem>
                  <SelectItem value="harrier">Toyota Harrier</SelectItem>
                  <SelectItem value="fortuner">Toyota Fortuner</SelectItem>
                  <SelectItem value="c300">Mercedes C300</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Filter */}
            <div className="col-span-1 flex-1 flex flex-col gap-1 px-3.5 py-2.5 sm:px-4 sm:py-3 border-t md:border-t-0 md:border-l border-border">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Budget
              </label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger
                  className="cursor-pointer w-full border-none bg-transparent shadow-none px-0 h-auto text-xs sm:text-sm font-semibold text-foreground focus-visible:ring-0 focus-visible:border-transparent gap-1.5 sm:gap-2"
                >
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="under2m">Under KSh 2M</SelectItem>
                  <SelectItem value="under4m">Under KSh 4M</SelectItem>
                  <SelectItem value="4m-8m">KSh 4M – 8M</SelectItem>
                  <SelectItem value="8m-15m">KSh 8M – 15M</SelectItem>
                  <SelectItem value="above15m">Above KSh 15M</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="col-span-1 flex-1 flex flex-col gap-1 px-3.5 py-2.5 sm:px-4 sm:py-3 border-t border-l md:border-t-0 md:border-l border-border">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Year
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger
                  className="cursor-pointer w-full border-none bg-transparent shadow-none px-0 h-auto text-xs sm:text-sm font-semibold text-foreground focus-visible:ring-0 focus-visible:border-transparent gap-1.5 sm:gap-2"
                >
                  <SelectValue placeholder="Any Year" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">Any Year</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                  <SelectItem value="2019">2019</SelectItem>
                  <SelectItem value="2018">2018</SelectItem>
                  <SelectItem value="2017">2017</SelectItem>
                  <SelectItem value="2016">2016</SelectItem>
                  <SelectItem value="2015">2015</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="col-span-2 md:col-span-1 flex items-center p-2.5 sm:p-3 md:py-0 md:px-3 border-t md:border-t-0 md:border-l border-border">
              <button
                type="button"
                onClick={() => setSearched(true)}
                className="w-full md:w-auto h-11 px-6 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Search Cars</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
