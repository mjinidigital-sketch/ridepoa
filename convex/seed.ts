import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Car manufacturers and their reliable image URLs (using Unsplash)
const carManufacturers = {
  Toyota: {
    models: ["Corolla", "Camry", "RAV4", "Land Cruiser", "Prado", "Hilux", "Vitz", "Harrier"],
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    ],
  },
  BMW: {
    models: ["3 Series", "5 Series", "X3", "X5", "7 Series", "M3", "M5"],
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80",
    ],
  },
  Mercedes: {
    models: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "G-Class", "AMG GT"],
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
    ],
  },
  Audi: {
    models: ["A4", "A6", "Q5", "Q7", "A8", "RS6", "R8"],
    images: [
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
      "https://images.unsplash.com/photo-1606152421811-aa6d7f69fc51?w=800&q=80",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
    ],
  },
  Honda: {
    models: ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Fit"],
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
      "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
    ],
  },
  Ford: {
    models: ["Mustang", "F-150", "Explorer", "Escape", "Ranger", "Bronco"],
    images: [
      "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    ],
  },
  Volkswagen: {
    models: ["Golf", "Passat", "Tiguan", "Atlas", "Jetta", "ID.4"],
    images: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
  },
  Nissan: {
    models: ["Altima", "Maxima", "Rogue", "Pathfinder", "Sentra", "370Z"],
    images: [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&q=80",
    ],
  },
  Hyundai: {
    models: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Veloster"],
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
    ],
  },
  Kia: {
    models: ["Sportage", "Sorento", "Telluride", "Seltos", "Forte", "Stinger"],
    images: [
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80",
    ],
  },
  Mazda: {
    models: ["Mazda3", "Mazda6", "CX-5", "CX-9", "MX-5 Miata"],
    images: [
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    ],
  },
  Subaru: {
    models: ["Outback", "Forester", "Impreza", "Legacy", "WRX", "Ascent"],
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&q=80",
    ],
  },
  Tesla: {
    models: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
      "https://images.unsplash.com/photo-1617704548623-340226c91f4a?w=800&q=80",
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
    ],
  },
  Lexus: {
    models: ["ES", "LS", "RX", "NX", "GX", "LC"],
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    ],
  },
  Land_Rover: {
    models: ["Range Rover", "Discovery", "Defender", "Evoque", "Velar"],
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
  },
  Porsche: {
    models: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
    images: [
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
    ],
  },
};

const categories = [
  "sedan",
  "suv",
  "pickup",
  "coupe",
  "convertible",
  "hatchback",
  "station_wagon",
  "ev",
  "van",
  "minibus",
  "bus",
] as const;

const conditions = ["brand_new", "foreign_used", "locally_used"] as const;
const fuelTypes = ["petrol", "diesel", "electric", "hybrid", "plug_in_hybrid"] as const;
const transmissions = ["automatic", "manual", "cvt"] as const;
const drivetrains = ["fwd", "rwd", "4wd", "awd"] as const;
const listingTypes = ["sell", "rent", "lease"] as const;
const statuses = ["active", "sold", "reserved"] as const;
const cities = ["Nairobi", "Mombasa", "Nakuru", "Kisumu", "Eldoret", "Thika", "Malindi", "Kitale"] as const;

const exteriorColors = [
  "Pearl White",
  "Metallic Black",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Brown",
  "Beige",
  "Gold",
  "Green",
];

const interiorColors = ["Black", "Beige", "Gray", "Brown", "White"];
const interiorMaterials = ["leather", "fabric", "synthetic"] as const;

const featuresList = [
  "Sunroof",
  "Panoramic Roof",
  "360 Camera",
  "Backup Camera",
  "Apple CarPlay",
  "Android Auto",
  "Bluetooth",
  "Navigation System",
  "Leather Seats",
  "Heated Seats",
  "Ventilated Seats",
  "Heated Steering Wheel",
  "Cruise Control",
  "Adaptive Cruise Control",
  "Lane Assist",
  "Blind Spot Monitoring",
  "Automatic Emergency Braking",
  "Keyless Entry",
  "Push Button Start",
  "Remote Start",
  "Premium Audio",
  "Wireless Charging",
  "USB Ports",
  "HDMI Input",
  "Automatic Climate Control",
  "Dual Zone Climate",
  "Tri Zone Climate",
  "Power Seats",
  "Memory Seats",
  "Power Windows",
  "Power Locks",
  "Power Mirrors",
  "Folding Mirrors",
  "Auto-Dimming Mirrors",
  "Rain Sensing Wipers",
  "Auto Headlights",
  "LED Headlights",
  "Xenon Headlights",
  "Fog Lights",
  "Daytime Running Lights",
  "Alloy Wheels",
  "Sports Package",
  "Performance Package",
  "Off-Road Package",
  "Towing Package",
  "Roof Rails",
  "Running Boards",
  "Spoiler",
  "Privacy Glass",
  "Tinted Windows",
];

const trimLevels = ["Base", "LE", "SE", "XLE", "Limited", "Sport", "Premium", "Platinum", "Ultimate", "TRD", "AMG", "M Sport", "F Sport"];

// Helper functions for random selection
function randomChoice<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function shuffleArray<T>(arr: readonly T[] | T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRandomFeatures(): string[] {
  const shuffled = shuffleArray(featuresList);
  const count = randomInt(5, 15);
  return shuffled.slice(0, count);
}

function generatePrice(year: number, make: string, model: string, condition: string): number {
  const basePrice = randomInt(2000000, 15000000); // KES 2M to 15M
  
  // Adjust based on year
  const currentYear = new Date().getFullYear();
  const yearMultiplier = 0.5 + (year / currentYear) * 0.5;
  
  // Adjust based on condition
  const multipliers: Record<string, number> = {
    brand_new: 1.2,
    foreign_used: 1.0,
    locally_used: 0.8,
  };
  const conditionMultiplier = multipliers[condition] ?? 1.0;
  
  // Adjust based on luxury brands
  const luxuryBrands = ["BMW", "Mercedes", "Audi", "Lexus", "Land_Rover", "Porsche", "Tesla"];
  const luxuryMultiplier = luxuryBrands.includes(make) ? 1.5 : 1.0;
  
  return Math.round(basePrice * yearMultiplier * conditionMultiplier * luxuryMultiplier);
}

function generateMileage(condition: string): number {
  if (condition === "brand_new") return randomInt(0, 100);
  if (condition === "foreign_used") return randomInt(5000, 50000);
  return randomInt(20000, 150000);
}

function generateDescription(
  make: string,
  model: string,
  year: number,
  condition: string,
  mileage: number,
  features: string[]
): string {
  const conditionText = {
    brand_new: "Brand new",
    foreign_used: "Foreign used",
    locally_used: "Locally used",
  }[condition];
  
  const mileageText = condition === "brand_new" ? "with delivery mileage" : `with ${mileage.toLocaleString()} km`;
  
  const featureHighlights = features.slice(0, 5).join(", ");
  
  return `This ${year} ${make} ${model} is ${conditionText} ${mileageText}. Excellent condition with full service history. Features include ${featureHighlights}. Well maintained and ready for immediate transfer. ${condition === "brand_new" ? "Still under manufacturer warranty." : "All documents available."} Contact us today for a test drive!`;
}

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data to make seeding idempotent
    const existingVehicles = await ctx.db.query("vehicles").collect();
    for (const vehicle of existingVehicles) {
      await ctx.db.delete("vehicles", vehicle._id);
    }
    
    const existingUsers = await ctx.db.query("users").collect();
    for (const user of existingUsers) {
      await ctx.db.delete("users", user._id);
    }
    
    // Create 5 dealer users
    const dealerNames = [
      "Premium Auto Dealers",
      "Nairobi Motors Ltd",
      "Coastal Car Sales",
      "Rift Valley Autos",
      "Urban Wheels Kenya",
    ];
    
    const userIds: string[] = [];
    
    for (const dealerName of dealerNames) {
      const userId = await ctx.db.insert("users", {
        name: dealerName,
        email: `${dealerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        role: "dealer",
        isDealer: true,
        dealershipName: dealerName,
        dealerRating: randomFloat(3.5, 5.0),
        totalListingsCount: 0,
        location: randomChoice(cities),
        verified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      userIds.push(userId);
    }
    
    // Create 200 vehicles
    const manufacturerEntries = Object.entries(carManufacturers);
    
    for (let i = 0; i < 200; i++) {
      const [make, data] = manufacturerEntries[i % manufacturerEntries.length];
      const model = randomChoice(data.models);
      const year = randomInt(2015, 2024);
      const condition = randomChoice(conditions);
      const category = randomChoice(categories);
      const fuelType = randomChoice(fuelTypes);
      const transmission = randomChoice(transmissions);
      const drivetrain = randomChoice(drivetrains);
      const listingType = randomChoice(listingTypes);
      const status = randomChoice(statuses);
      const city = randomChoice(cities);
      const exteriorColor = randomChoice(exteriorColors);
      const interiorColor = randomChoice(interiorColors);
      const interiorMaterial = randomChoice(interiorMaterials);
      const trim = randomChoice(trimLevels);
      const features = generateRandomFeatures();
      const mileage = generateMileage(condition);
      const price = generatePrice(year, make, model, condition);
      const description = generateDescription(make, model, year, condition, mileage, features);
      const images = data.images.slice(0, randomInt(1, 3));
      
      const userId = randomChoice(userIds);
      
      await ctx.db.insert("vehicles", {
        userId: userId as any,
        sellerClerkId: undefined,
        
        // Basic Identification
        title: `${year} ${make} ${model} ${trim}`,
        slug: `${year}-${make}-${model}-${trim}`.toLowerCase().replace(/\s+/g, "-"),
        category,
        make,
        model,
        year,
        trim,
        bodyType: undefined,
        vinOrChassisNumber: undefined,
        registrationNumber: undefined,
        
        // Pricing
        price,
        currency: "KES",
        negotiable: Math.random() > 0.5,
        listingType,
        status,
        featured: Math.random() > 0.8,
        urgent: Math.random() > 0.9,
        
        // Condition
        condition,
        mileage,
        mileageUnit: "km",
        locallyDriven: condition === "locally_used" ? true : false,
        femaleOwned: Math.random() > 0.7,
        accidentFree: Math.random() > 0.3,
        repainted: Math.random() > 0.6,
        originalPaint: Math.random() > 0.5,
        numberOfPreviousOwners: condition === "brand_new" ? 0 : randomInt(1, 3),
        serviceHistory: randomChoice(["full", "partial", "none"] as const),
        dutyPaid: condition === "foreign_used" ? Math.random() > 0.3 : true,
        logbookAvailable: true,
        warrantyRemainingMonths: condition === "brand_new" ? randomInt(12, 60) : undefined,
        
        // Engine
        fuelType,
        transmission,
        drivetrain,
        engineSizeCc: randomInt(1300, 5000),
        horsepower: randomInt(100, 500),
        fuelConsumption: `${randomInt(8, 20)} km/L`,
        
        // EV Specifics
        batteryCapacityKwh: fuelType === "electric" || fuelType === "plug_in_hybrid" ? randomInt(40, 100) : undefined,
        electricRangeKm: fuelType === "electric" || fuelType === "plug_in_hybrid" ? randomInt(200, 600) : undefined,
        chargingTimeHours: fuelType === "electric" || fuelType === "plug_in_hybrid" ? randomFloat(0.5, 8) : undefined,
        
        // Commercial
        seatingCapacity: category === "bus" || category === "minibus" ? randomInt(14, 50) : randomInt(2, 7),
        payloadCapacityKg: (category as string) === "pickup" || (category as string) === "lorry" ? randomInt(500, 3000) : undefined,
        towingCapacityKg: Math.random() > 0.7 ? randomInt(1000, 5000) : undefined,
        
        // Exterior & Interior
        exteriorColor,
        interiorColor,
        interiorMaterial,
        doorsCount: randomInt(2, 5),
        
        // Features
        features,
        
        // Location
        city,
        stateOrCounty: undefined,
        country: "Kenya",
        address: undefined,
        latitude: undefined,
        longitude: undefined,
        
        // Media
        images,
        thumbnailUrl: images[0],
        videoUrl: undefined,
        inspectionReportUrl: undefined,
        
        // Contact
        description,
        sellerContactPhone: `+254${randomInt(700000000, 799999999)}`,
        sellerContactWhatsApp: undefined,
        allowWhatsAppChat: true,
        
        // Metrics
        viewsCount: randomInt(0, 500),
        savesCount: randomInt(0, 50),
        inquiriesCount: randomInt(0, 20),
        publishedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
    }
    
    return { success: true, vehiclesSeeded: 200, usersSeeded: 5 };
  },
});
