import { faker } from "@faker-js/faker";

export interface CategoryTemplate {
  name: string;
  code: string;
  subcategories: string[];
  brands: string[];
  priceRange: [number, number]; // in NGN
  weightRange: [number, number]; // in kg
  generateSpecs: (brand: string, subcategory: string) => Record<string, string>;
  generateVariations: () => { sizes: string[]; colors: { name: string; hex: string }[]; material?: string; fitGuide?: string };
}

const COLOR_PALETTES = [
  { name: "Space Grey", hex: "#4B4846" },
  { name: "Midnight Black", hex: "#111111" },
  { name: "Silver Frost", hex: "#E0E0E0" },
  { name: "Alpine White", hex: "#FFFFFF" },
  { name: "Deep Navy", hex: "#0F172A" },
  { name: "Champagne Gold", hex: "#D4AF37" },
  { name: "Rose Blush", hex: "#E29578" },
  { name: "Emerald Green", hex: "#064E3B" },
  { name: "Burgundy Wine", hex: "#581845" },
  { name: "Terracotta Earth", hex: "#C86D51" },
];

export const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  "Electronics": {
    name: "Electronics",
    code: "ELEC",
    subcategories: ["Wireless Headphones", "Bluetooth Speakers", "Action Cameras", "Smart Wearables", "Home Audio Receivers"],
    brands: ["Sony", "Bose", "JBL", "Anker Soundcore", "Sennheiser", "Marshall", "Audio-Technica"],
    priceRange: [18000, 450000],
    weightRange: [0.2, 5.0],
    generateSpecs: (brand, sub) => ({
      "Type": sub,
      "Connectivity": faker.helpers.arrayElement(["Bluetooth 5.3", "Wi-Fi & Bluetooth", "Lossless 2.4GHz"]),
      "Battery Life": faker.helpers.arrayElement(["24 Hours", "36 Hours", "50 Hours", "All-Day Listening"]),
      "Noise Cancellation": faker.helpers.arrayElement(["Active Noise Cancelling (ANC)", "Hybrid ANC", "Passive Isolation"]),
      "Warranty": "1-Year Official Warranty",
    }),
    generateVariations: () => ({
      sizes: ["Standard"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
    }),
  },

  "Phones and Tablets": {
    name: "Phones and Tablets",
    code: "PHON",
    subcategories: ["Flagship Smartphones", "Pro Tablets", "Fast Wireless Chargers", "Magnetic Power Banks", "Stylus Pens"],
    brands: ["Apple", "Samsung", "Google", "Xiaomi", "OnePlus", "Infinix", "Tecno"],
    priceRange: [75000, 1850000],
    weightRange: [0.18, 0.8],
    generateSpecs: (brand, sub) => ({
      "Display": faker.helpers.arrayElement(["6.1-inch Super Retina XDR", "6.7-inch Dynamic AMOLED 2X 120Hz", "11-inch Liquid Retina Display", "6.5-inch FHD+ 90Hz"]),
      "Storage": faker.helpers.arrayElement(["128GB NVMe", "256GB UFS 4.0", "512GB", "1TB"]),
      "RAM": faker.helpers.arrayElement(["8GB LPDDR5X", "12GB", "16GB", "6GB Unified Memory"]),
      "Network": "5G Sub-6GHz & Wi-Fi 6E / 7",
      "Camera": faker.helpers.arrayElement(["48MP Triple Pro Camera", "200MP Quad Zoom System", "50MP Dual Camera with OIS"]),
    }),
    generateVariations: () => ({
      sizes: ["128GB", "256GB", "512GB"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
    }),
  },

  "Computers and Accessories": {
    name: "Computers and Accessories",
    code: "COMP",
    subcategories: ["Ultrabooks", "Workstation Laptops", "Mechanical Keyboards", "Curved Studio Monitors", "Docking Stations"],
    brands: ["Apple", "Dell", "Lenovo", "HP", "ASUS ROG", "Logitech", "LG UltraFine"],
    priceRange: [180000, 3800000],
    weightRange: [1.2, 8.5],
    generateSpecs: (brand, sub) => ({
      "Processor": faker.helpers.arrayElement(["Apple M3 Pro 12-Core", "Intel Core i9-14900HX", "AMD Ryzen 9 7940HS", "Intel Core i7-13700H"]),
      "Memory": faker.helpers.arrayElement(["16GB Unified", "32GB DDR5 5600MHz", "64GB DDR5"]),
      "Internal Storage": faker.helpers.arrayElement(["512GB PCIe 4.0 NVMe", "1TB M.2 SSD", "2TB High-Speed SSD"]),
      "Graphics": faker.helpers.arrayElement(["NVIDIA GeForce RTX 4080 12GB", "Apple 18-Core GPU", "Intel Iris Xe Graphics"]),
      "Display Resolution": faker.helpers.arrayElement(["14.2-inch Liquid Retina XDR", "16-inch 4K OLED", "27-inch 4K Studio 144Hz"]),
    }),
    generateVariations: () => ({
      sizes: ["16GB RAM / 512GB SSD", "32GB RAM / 1TB SSD"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 3 }),
    }),
  },

  "Fashion": {
    name: "Fashion",
    code: "FASH",
    subcategories: ["Mulberry Silk Dresses", "Virgin Wool Blazers", "Organic Cotton Shirts", "Cashmere Sweaters", "Relaxed Chinos"],
    brands: ["Vroom Atelier", "Zara Studio", "Massimo Dutti", "Loro Piana", "Hugo Boss", "Mango", "COS"],
    priceRange: [22000, 240000],
    weightRange: [0.3, 1.5],
    generateSpecs: (brand, sub) => ({
      "Fabric Composition": faker.helpers.arrayElement(["100% Organic Mulberry Silk", "100% Biella Virgin Wool", "100% Extra-Fine Mongolian Cashmere", "100% Normandy Flax Linen"]),
      "Tailoring": faker.helpers.arrayElement(["Double-Breasted Half-Canvas", "Seamless 3D Knit", "Hand-Rolled French Seams", "Relaxed Silhouette"]),
      "Care Instructions": "Dry Clean Only or Hand Wash Cold with Silk Detergent",
      "Origin": faker.helpers.arrayElement(["Made in Italy", "Made in Portugal", "Crafted in Lagos Atelier", "Imported French Textiles"]),
    }),
    generateVariations: () => ({
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 3, max: 5 }),
      material: faker.helpers.arrayElement(["Mulberry Silk", "Cashmere Blend", "Pure Linen", "Super 130s Wool"]),
      fitGuide: faker.helpers.arrayElement(["True to Size", "Relaxed Drape", "Tailored Slim Fit"]),
    }),
  },

  "Shoes and Bags": {
    name: "Shoes and Bags",
    code: "SHOE",
    subcategories: ["Italian Calfskin Loafers", "Structured Leather Totes", "Minimalist White Sneakers", "Crossbody Satchels", "Oxford Dress Shoes"],
    brands: ["Vroom Leather Goods", "Tod's", "Common Projects", "Ferragamo", "Coach", "Michael Kors", "Clarks"],
    priceRange: [28000, 320000],
    weightRange: [0.6, 2.8],
    generateSpecs: (brand, sub) => ({
      "Upper Material": faker.helpers.arrayElement(["100% Full-Grain Vegetable-Tanned Italian Calfskin", "Hand-Burnished Box Calf", "Nappa Lambskin Leather"]),
      "Sole Construction": faker.helpers.arrayElement(["Goodyear Welted Leather Sole", "Vibram Rubber Outsole", "Reinforced Margom Cup Sole"]),
      "Hardware": faker.helpers.arrayElement(["Brushed Solid Brass Feet & Buckles", "Palladium Finished Zippers", "Gunmetal Hardware"]),
    }),
    generateVariations: () => ({
      sizes: ["40", "41", "42", "43", "44", "45"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
      material: "Full-Grain Italian Calfskin Leather",
      fitGuide: faker.helpers.arrayElement(["True to Size", "Runs Slightly Large", "Italian D-Width Fit"]),
    }),
  },

  "Beauty and Personal Care": {
    name: "Beauty and Personal Care",
    code: "BEAU",
    subcategories: ["Extrait de Parfum", "Botanical Squalane Oils", "Gentle Cleansing Balms", "Restorative Hair Masks", "Vitamin C Serums"],
    brands: ["Vroom Parfums", "Le Labo", "Byredo", "Aesop", "The Ordinary", "Maison Francis Kurkdjian", "Drunk Elephant"],
    priceRange: [14000, 185000],
    weightRange: [0.1, 0.6],
    generateSpecs: (brand, sub) => ({
      "Concentration": faker.helpers.arrayElement(["Extrait de Parfum (30% Oil)", "Eau de Parfum (20% Oil)", "Cold-Pressed Active Botanical Serum"]),
      "Formulation": "Clean Formula • Paraben & Cruelty-Free • Non-Comedogenic",
      "Volume": faker.helpers.arrayElement(["50ml / 1.7 fl oz", "100ml / 3.4 fl oz", "30ml Dropper Flacon"]),
      "Key Ingredients": faker.helpers.arrayElement(["Damascus Rose & Rosehip Squalane", "Santalum Album & Haitian Vetiver", "Hyaluronic Acid 2% & Niacinamide"]),
    }),
    generateVariations: () => ({
      sizes: ["30ml", "50ml", "100ml"],
      colors: [{ name: "Amber Glass", hex: "#B45309" }, { name: "Clear Glass", hex: "#E2E8F0" }],
    }),
  },

  "Home and Kitchen": {
    name: "Home and Kitchen",
    code: "KICH",
    subcategories: ["Enameled Cast Iron Dutch Ovens", "Japanese Chef Knife Sets", "Non-Stick Ceramic Skillets", "Espresso Machines", "Air Fryer Ovens"],
    brands: ["Le Creuset", "Staub", "Shun Cutlery", "Ninja", "Breville", "Philips", "Tefal"],
    priceRange: [15000, 380000],
    weightRange: [1.0, 7.5],
    generateSpecs: (brand, sub) => ({
      "Core Material": faker.helpers.arrayElement(["Heavy-Duty Enameled Cast Iron", "VG-MAX Japanese Damascus Steel", "5-Ply Stainless Steel Core"]),
      "Cooktop Compatibility": "Gas, Induction, Electric, Ceramic & Oven Safe up to 260°C",
      "Coating": faker.helpers.arrayElement(["100% PFOA-Free Mineral Ceramic", "Sand Enamel Interior", "Scratch-Resistant Nitride Finish"]),
    }),
    generateVariations: () => ({
      sizes: ["24cm / 4.2L", "28cm / 6.7L"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
    }),
  },

  "Furniture": {
    name: "Furniture",
    code: "FURN",
    subcategories: ["Architectural Velvet Sofas", "Solid Oak Dining Tables", "Ergonomic Mesh Task Chairs", "Lowline TV Media Consoles", "Platform Bed Frames"],
    brands: ["Herman Miller", "Muuto", "BoConcept", "West Elm", "Poltrona Frau", "Hay Denmark", "Vitra"],
    priceRange: [85000, 2400000],
    weightRange: [12.0, 65.0],
    generateSpecs: (brand, sub) => ({
      "Frame Construction": faker.helpers.arrayElement(["FSC-Certified Solid European Oak", "Kiln-Dried Hardwood Frame with Reinforced Mortise & Tenon", "Polished Aluminum Alloy Casting"]),
      "Upholstery": faker.helpers.arrayElement(["High-Resilience Bouclé Fabric (100,000 Martindale)", "Full-Grain Italian Semi-Aniline Leather", "Breathable Pellicle 8Z Mesh"]),
      "Dimensions": faker.helpers.arrayElement(["W: 220cm x D: 95cm x H: 78cm", "W: 180cm x D: 90cm x H: 75cm", "W: 68cm x D: 68cm x H: 104-118cm"]),
    }),
    generateVariations: () => ({
      sizes: ["2-Seater (180cm)", "3-Seater (220cm)", "Standard"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
      material: faker.helpers.arrayElement(["Solid White Oak", "Italian Leather", "Bouclé Fabric"]),
    }),
  },

  "Sports and Fitness": {
    name: "Sports and Fitness",
    code: "SPOR",
    subcategories: ["Adjustable Dumbbell Sets", "Commercial Treadmills", "Smart Spin Exercise Bikes", "High-Density Yoga Mats", "GPS Multisport Watches"],
    brands: ["Bowflex", "NordicTrack", "Peloton", "Lululemon", "Garmin", "Nike Pro", "Under Armour"],
    priceRange: [12000, 1650000],
    weightRange: [1.5, 80.0],
    generateSpecs: (brand, sub) => ({
      "Resistance System": faker.helpers.arrayElement(["Silent Magnetic Resistance (SMR)", "Rapid Weight Selector (2.5kg - 24kg)", "Hydraulic Dampening"]),
      "Connectivity": faker.helpers.arrayElement(["Bluetooth FTMS & ANT+ Heart Rate", "Integrated 1080p HD Touchscreen", "Garmin Connect Sync"]),
      "Max User Capacity": "150 kg (330 lbs) Heavy-Duty Construction",
    }),
    generateVariations: () => ({
      sizes: ["Standard", "Adjustable 24kg Pair", "Adjustable 40kg Pair"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 3 }),
    }),
  },

  "Automotive": {
    name: "Automotive",
    code: "AUTO",
    subcategories: ["Luxury Sports Coupes", "Executive SUVs", "4K Dash Cameras", "Portable Jump Starters", "Ceramic Coating Detail Kits"],
    brands: ["Porsche Approved", "Mercedes-Benz Direct", "BMW Certified", "Range Rover", "Toyota Motors", "70mai", "NOCO Genius"],
    priceRange: [25000, 115000000],
    weightRange: [1.5, 2200.0],
    generateSpecs: (brand, sub) => ({
      "Powertrain / Engine": faker.helpers.arrayElement(["3.0L Twin-Turbo Boxer 6 (473 HP)", "4.0L Biturbo V8 (577 HP)", "Dual-Motor Electric AWD (670 HP)", "12V 2000A Lithium UltraSafe"]),
      "Transmission": faker.helpers.arrayElement(["8-Speed Dual-Clutch PDK", "AMG SPEEDSHIFT 9G-TRONIC", "Single-Speed Direct Drive"]),
      "Acceleration / Specs": faker.helpers.arrayElement(["0-100 km/h in 3.3s", "0-100 km/h in 3.6s", "4K Sony STARVIS 2 Night Vision Sensor"]),
    }),
    generateVariations: () => ({
      sizes: ["Standard Showroom Specification"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
    }),
  },

  "Gaming": {
    name: "Gaming",
    code: "GAME",
    subcategories: ["Next-Gen Game Consoles", "Wireless Pro Controllers", "Gaming Headsets with Spatial Audio", "Ergonomic Gaming Chairs", "Fast NVMe Console SSDs"],
    brands: ["Sony PlayStation", "Microsoft Xbox", "Nintendo", "Razer", "SteelSeries", "Corsair", "Secretlab"],
    priceRange: [25000, 920000],
    weightRange: [0.35, 24.0],
    generateSpecs: (brand, sub) => ({
      "Target Resolution": faker.helpers.arrayElement(["4K UHD up to 120 FPS", "Custom AMD RDNA 2 GPU 10.28 TFLOPs", "Low-Latency 2.4GHz Wireless"]),
      "Audio / Feedback": faker.helpers.arrayElement(["Tempest 3D AudioTech & Haptic Triggers", "Dolby Atmos & DTS Headphone:X", "Sub-1ms Wireless Connectivity"]),
    }),
    generateVariations: () => ({
      sizes: ["1TB Edition", "2TB High-Speed Edition"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 3 }),
    }),
  },

  "Books and Stationery": {
    name: "Books and Stationery",
    code: "BOOK",
    subcategories: ["Business & Economics Bestsellers", "Architectural Design Monographs", "Leatherbound Hardcover Journals", "Precision Fountain Pens", "Desk Organizers"],
    brands: ["Penguin Random House", "Taschen", "Moleskine", "Montblanc", "Lamy", "Rhodia", "Midori"],
    priceRange: [4500, 85000],
    weightRange: [0.3, 3.5],
    generateSpecs: (brand, sub) => ({
      "Format": faker.helpers.arrayElement(["Hardcover Clothbound with Ribbon Marker", "Sewn Lay-Flat Smyth Bound Journal", "Extra-Large Art Monograph 380 Pages"]),
      "Paper Quality": faker.helpers.arrayElement(["100 g/m² Acid-Free Ivory Paper (Fountain Pen Friendly)", "Archival Semi-Gloss Art Paper", "Munken Pure FSC Certified"]),
    }),
    generateVariations: () => ({
      sizes: ["A5 Hardcover", "A4 Hardcover", "Pocket Format"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
    }),
  },

  "Baby Products": {
    name: "Baby Products",
    code: "BABY",
    subcategories: ["Modular Stroller Systems", "Convertible Car Seats", "Ergonomic Baby Carriers", "Smart Audio Video Baby Monitors", "Organic Cotton Sleepers"],
    brands: ["Cybex Platinum", "Bugaboo", "Nuna", "BabyBjörn", "Chicco", "Nanit", "Stokke"],
    priceRange: [18000, 680000],
    weightRange: [0.5, 14.0],
    generateSpecs: (brand, sub) => ({
      "Safety Certifications": "ECE R129 / i-Size Approved • OEKO-TEX Standard 100",
      "Age / Weight Suitability": faker.helpers.arrayElement(["From Birth up to 22 kg (approx. 4 years)", "0 to 18 Months (40-87 cm)", "3.2 kg to 15 kg"]),
      "Materials": faker.helpers.arrayElement(["100% Breathable Organic Cotton", "Aircraft-Grade Aluminum Stroller Chassis", "Machine Washable Fabric Liners"]),
    }),
    generateVariations: () => ({
      sizes: ["Newborn", "0-6 Months", "6-12 Months", "Standard"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 3 }),
    }),
  },

  "Toys": {
    name: "Toys",
    code: "TOYS",
    subcategories: ["Mechanical Building Sets", "Remote Control Speed Drones", "Educational STEM Robotics Kits", "Classic Wooden Strategy Games", "Action Figures"],
    brands: ["LEGO Icons", "DJI", "Sphero", "Hasbro", "Mattel", "Brio Sweden", "Ravensburger"],
    priceRange: [8500, 420000],
    weightRange: [0.4, 6.0],
    generateSpecs: (brand, sub) => ({
      "Piece Count / Specs": faker.helpers.arrayElement(["2,480 Authentic Interlocking Elements", "4K Stabilized Drone Camera with 31-Min Flight Time", "Programmable Microcontroller with Python & Scratch Support"]),
      "Recommended Age": faker.helpers.arrayElement(["18+ Collector Series", "Ages 8-14 Years", "Ages 6 and Above"]),
    }),
    generateVariations: () => ({
      sizes: ["Collector Edition", "Standard Kit"],
      colors: [{ name: "Classic Multi-Color", hex: "#EF4444" }, { name: "Monochrome Black", hex: "#111111" }],
    }),
  },

  "Health and Wellness": {
    name: "Health and Wellness",
    code: "WELL",
    subcategories: ["Smart Blood Pressure Monitors", "Deep-Tissue Percussion Massage Guns", "Digital Pulse Oximeters", "Medical Grade Infrared Thermometers", "Air Purifiers with HEPA"],
    brands: ["Omron Healthcare", "Theragun (Therabody)", "Withings", "Philips Respironics", "Dyson", "Levoit"],
    priceRange: [14000, 420000],
    weightRange: [0.3, 7.0],
    generateSpecs: (brand, sub) => ({
      "Clinical Accuracy": "FDA Cleared & European Society of Hypertension (ESH) Validated",
      "Motor / Amplitude": faker.helpers.arrayElement(["16mm Amplitude 40 lbs Stall Force", "Intellisense Automatic Inflation Technology", "True HEPA H13 Filtration (99.97% Particles)"]),
      "Connectivity": faker.helpers.arrayElement(["Bluetooth Sync to Apple Health & Google Fit", "Standalone LED Display", "Wi-Fi Cloud Sync"]),
    }),
    generateVariations: () => ({
      sizes: ["Standard Adult Cuff (22-42cm)", "Compact Travel Edition", "Pro Edition"],
      colors: [{ name: "Medical White", hex: "#F8FAFC" }, { name: "Matte Black", hex: "#0F172A" }],
    }),
  },

  "Groceries": {
    name: "Groceries",
    code: "GROC",
    subcategories: ["Single-Estate Roasted Coffee Beans", "Extra Virgin Cold-Pressed Olive Oil", "Pure Wildflower Honey", "Artisanal Whole Wheat Pasta", "Organic Herbal Teas"],
    brands: ["Illy Caffe", "Laudemio Tuscany", "Twinings London", "De Cecco", "Kewpie", "Maille France", "Nature's Bounty"],
    priceRange: [2500, 45000],
    weightRange: [0.25, 5.0],
    generateSpecs: (brand, sub) => ({
      "Net Weight / Volume": faker.helpers.arrayElement(["1 kg Whole Beans in Tin", "500ml Dark Glass Bottle", "100 Sachets Foil-Sealed", "500g Bronze-Die Cut"]),
      "Origin": faker.helpers.arrayElement(["Highlands of Ethiopia & Colombia", "Tuscany, Italy (First Cold Pressing)", "Pure Himalayan Floral Nectar"]),
      "Storage": "Store in a cool, dry place away from direct sunlight",
    }),
    generateVariations: () => ({
      sizes: ["500g Pack", "1kg Pack", "Pack of 3"],
      colors: [{ name: "Original Packaging", hex: "#78350F" }],
    }),
  },

  "Home Appliances": {
    name: "Home Appliances",
    code: "APPL",
    subcategories: ["Multi-Door Inverter Refrigerators", "Smart Inverter Microwave Ovens", "Front-Load Steam Washing Machines", "Dual-Inverter Air Conditioners", "Vertical Chest Freezers"],
    brands: ["Samsung", "LG Electronics", "Bosch Germany", "Panasonic", "Miele", "Whirlpool", "Hisense"],
    priceRange: [65000, 2900000],
    weightRange: [15.0, 95.0],
    generateSpecs: (brand, sub) => ({
      "Cooling / Inverter Tech": faker.helpers.arrayElement(["Digital Inverter Compressor with 10-Year Warranty", "Dual Inverter Eco-Sensor System", "AI Direct Drive Steam Cycle"]),
      "Energy Efficiency Rating": "A+++ 5-Star Energy Saver (Up to 40% Electricity Savings)",
      "Capacity": faker.helpers.arrayElement(["647 Liters 4-Door French Door", "34 Liters Ceramic Interior Chamber", "10.5 kg Wash / 7 kg Dry"]),
    }),
    generateVariations: () => ({
      sizes: ["Standard Capacity", "High-Capacity XL"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 3 }),
    }),
  },

  "Office Equipment": {
    name: "Office Equipment",
    code: "OFFC",
    subcategories: ["High-Volume Multi-Function Laser Printers", "Cross-Cut Micro Security Shredders", "Interactive Laser Office Projectors", "Thermal Label Printers", "Automated Laminating Machines"],
    brands: ["HP LaserJet", "Canon imageCLASS", "Epson EcoTank", "Brother Workhorse", "Fellowes", "Xerox", "Fellowes Powershred"],
    priceRange: [45000, 1150000],
    weightRange: [4.5, 28.0],
    generateSpecs: (brand, sub) => ({
      "Print / Processing Speed": faker.helpers.arrayElement(["Up to 42 Pages per Minute (Duplex Auto)", "P-5 Micro-Cut 12 Sheets per Pass", "4,500 ANSI Lumens WUXGA Laser"]),
      "Connectivity": "Ethernet Gigabit, Dual-Band Wi-Fi, Apple AirPrint, NFC Touch-to-Print",
      "Duty Cycle": "Recommended Monthly Volume: Up to 50,000 pages",
    }),
    generateVariations: () => ({
      sizes: ["Standard Office Unit", "Unit with Extra 500-Sheet Paper Tray"],
      colors: [{ name: "Office Matte Grey", hex: "#475569" }, { name: "Clean White", hex: "#F8FAFC" }],
    }),
  },

  "Jewelry and Watches": {
    name: "Jewelry and Watches",
    code: "JEWL",
    subcategories: ["Automatic Chronograph Watches", "18K Gold Plated Minimalist Cuffs", "Polarized Titanium Sunglasses", "Diamond Pavé Huggie Earrings", "Ceramic Diver Watches"],
    brands: ["Seiko Prospex", "Tissot Swiss", "TAG Heuer", "Mejuri", "Ray-Ban", "Persol", "Hamilton"],
    priceRange: [28000, 1450000],
    weightRange: [0.05, 0.45],
    generateSpecs: (brand, sub) => ({
      "Movement / Core": faker.helpers.arrayElement(["Swiss Powermatic 80 Automatic Movement (80-Hour Reserve)", "Japanese Seiko 6R35 Calibre 24 Jewels", "Precision Swiss Quartz Chronograph"]),
      "Case & Crystal": faker.helpers.arrayElement(["316L Surgical Stainless Steel with Anti-Reflective Sapphire Crystal", "Solid Aerospace Grade 5 Titanium", "High-Tech Zirconia Scratchproof Ceramic"]),
      "Water Resistance": faker.helpers.arrayElement(["200m (20 ATM) ISO Diver Certified", "100m (10 ATM)", "50m (5 ATM) Splashproof"]),
    }),
    generateVariations: () => ({
      sizes: ["39mm Case", "41mm Case", "42mm Case", "One Size"],
      colors: faker.helpers.arrayElements(COLOR_PALETTES, { min: 2, max: 4 }),
      material: "316L Surgical Grade Stainless Steel & Sapphire Crystal",
    }),
  },

  "Tools and Home Improvement": {
    name: "Tools and Home Improvement",
    code: "TOOL",
    subcategories: ["Brushless Cordless Drill & Impact Kits", "Professional Laser Distance Measure", "Heavy-Duty Modular Tool Chests", "Compact Inverter Generators", "Digital Multimeter Testers"],
    brands: ["DeWalt XR", "Bosch Professional", "Makita", "Milwaukee M18", "Fluke", "Knipex Germany", "Stanley FatMax"],
    priceRange: [18000, 780000],
    weightRange: [1.2, 35.0],
    generateSpecs: (brand, sub) => ({
      "Motor / Power Output": faker.helpers.arrayElement(["18V / 20V MAX High-Efficiency Brushless Motor", "True-RMS 1000V CAT IV Safety Rating", "2,200W Pure Sine Wave Gas Inverter Engine"]),
      "Torque / Accuracy": faker.helpers.arrayElement(["95 Nm Heavy-Duty Peak Torque", "±1.5mm Precision Laser Accuracy up to 50m", "Laser-Cut Chrome Vanadium Induction Hardened Jaws"]),
      "Kit Inclusions": "Includes 2x 5.0Ah Li-Ion Batteries, Fast Charger & ToughSystem Case",
    }),
    generateVariations: () => ({
      sizes: ["Bare Tool (No Battery)", "Kit with 2x 5.0Ah Batteries & Charger"],
      colors: [{ name: "Industrial Yellow & Black", hex: "#FACC15" }, { name: "Pro Blue", hex: "#1D4ED8" }],
    }),
  },
};
