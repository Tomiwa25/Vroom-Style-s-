export interface LookbookHotspot {
  id: string;
  name: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
  fabric: string;
  gsm?: string;
  origin: string;
  fit: string;
  sizes: string[];
  image: string;
  description: string;
  inStockCount: number;
}

export interface LookbookLook {
  id: string;
  lookNumber: string;
  title: string;
  subtitle: string;
  location: string;
  editorialImage: string;
  macroTextureImage: string;
  textureCaption: string;
  quote: string;
  hotspots: LookbookHotspot[];
}

export interface TextileStudy {
  name: string;
  gsm: string;
  weave: string;
  origin: string;
  certification: string;
  description: string;
  macroImage: string;
}

export const TEXTILE_ARCHIVE: TextileStudy[] = [
  {
    name: "Organic Mulberry Silk",
    gsm: "22 Momme (85 GSM)",
    weave: "Sandwashed Charmeuse",
    origin: "Como, Italy",
    certification: "OEKO-TEX Standard 100",
    description: "Spun from continuous silk filament threads, sandwashed for a velvety matte sheen and gentle drape against bare skin.",
    macroImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Double-Faced Wool Melton",
    gsm: "480 GSM",
    weave: "Hand-Split Double Weave",
    origin: "Biella, Italy",
    certification: "Responsible Wool Standard (RWS)",
    description: "Two micro-layers of virgin wool woven together with invisible binder yarns, allowing raw-edged unlined seams with supreme wind resistance.",
    macroImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Hand-Burnished Box Calfskin",
    gsm: "1.4mm Full-Grain",
    weave: "Vegetable-Tanned Aniline",
    origin: "Santa Croce sull'Arno, Tuscany",
    certification: "Leather Working Group (LWG Gold)",
    description: "Slowly drum-dyed with chestnut and mimosa tannins, developing a deep, golden patina with age and gentle handling.",
    macroImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",
  },
];

export const LOOKBOOK_LOOKS: LookbookLook[] = [
  {
    id: "look-01",
    lookNumber: "01",
    title: "The Architectural Silhouette",
    subtitle: "Double-faced Como wool trench, fluid silk wide trousers, and Tuscan calfskin derbies.",
    location: "Studio Lagos • Dusk Light",
    editorialImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    macroTextureImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
    textureCaption: "480 GSM Biella virgin wool melton grain with hand-split basting seams.",
    quote: "A coat cut with sufficient volume to encompass movement, yet disciplined by a removable self-fabric sash.",
    hotspots: [
      {
        id: "garment-01",
        name: "Double-Faced Wool Belted Trench",
        category: "Outerwear",
        priceNGN: 245000,
        priceUSD: 185,
        x: 48,
        y: 38,
        fabric: "100% Virgin Biella Wool",
        gsm: "480 GSM",
        origin: "Biella, Italy",
        fit: "Relaxed tailored fit, drop shoulder",
        sizes: ["XS", "S", "M", "L"],
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85",
        description: "Handcrafted from double-faced Italian wool with raw unlined lapels, storm flap, and horn cuff buttons.",
        inStockCount: 4,
      },
      {
        id: "garment-02",
        name: "Fluid Silk Wide-Leg Pleated Trousers",
        category: "Women",
        priceNGN: 115000,
        priceUSD: 88,
        x: 52,
        y: 72,
        fabric: "100% Mulberry Silk",
        gsm: "22 Momme",
        origin: "Como, Italy",
        fit: "High-waisted, fluid drape",
        sizes: ["XS", "S", "M", "L"],
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85",
        description: "Tailored deep front knife pleats with slant pockets and a relaxed wide leg that pools gently over footwear.",
        inStockCount: 7,
      },
      {
        id: "garment-03",
        name: "Hand-Burnished Box Calfskin Bag",
        category: "Accessories",
        priceNGN: 165000,
        priceUSD: 125,
        x: 28,
        y: 58,
        fabric: "Vegetable-Tanned Tuscan Calfskin",
        origin: "Florence, Italy",
        fit: "Structured everyday satchel",
        sizes: ["ONE SIZE"],
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
        description: "Brushed brass turnlock closure with raw suede interior lining and reinforced edge paint.",
        inStockCount: 3,
      },
    ],
  },
  {
    id: "look-02",
    lookNumber: "02",
    title: "Mulberry Silk & Fluid Drape",
    subtitle: "Sandwashed bias-cut silk slip layered under an oversized chunky ribbed merino cardigan.",
    location: "Milan Atelier • Morning Study",
    editorialImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    macroTextureImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
    textureCaption: "Sandwashed silk charmeuse showing liquid drape and matte finish.",
    quote: "The contrast between heavy gauge carded yarn and featherweight sandwashed silk creates effortless seasonal balance.",
    hotspots: [
      {
        id: "garment-04",
        name: "Bias-Cut Raw Silk Slip Dress",
        category: "Women",
        priceNGN: 145000,
        priceUSD: 110,
        x: 50,
        y: 52,
        fabric: "100% Mulberry Silk Charmeuse",
        gsm: "22 Momme",
        origin: "Como, Italy",
        fit: "Bias-cut, contours to the body",
        sizes: ["XS", "S", "M", "L"],
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85",
        description: "Cut on the 45-degree grain for natural elasticity without elastane. Delicate micro-straps and clean roll-hem.",
        inStockCount: 6,
      },
      {
        id: "garment-05",
        name: "Extra-Fine Merino Cardigan",
        category: "Knitwear",
        priceNGN: 135000,
        priceUSD: 98,
        x: 42,
        y: 35,
        fabric: "100% Extrafine Australian Merino",
        gsm: "360 GSM",
        origin: "Biella, Italy",
        fit: "Relaxed slouchy silhouette",
        sizes: ["S", "M", "L"],
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85",
        description: "Heavy shaker knit with ribbed placket and natural corozo nut buttons in matte espresso.",
        inStockCount: 5,
      },
    ],
  },
  {
    id: "look-03",
    lookNumber: "03",
    title: "Sartorial Structure & Horn Accents",
    subtitle: "Tailored wool jacket with suppressed waist and architectural shoulder construction.",
    location: "Studio Lagos • High Noon",
    editorialImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
    macroTextureImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=85",
    textureCaption: "Worsted wool hopsack weave paired with hand-stitched pick lapels.",
    quote: "Structured canvassing through the chest that softens with body heat, yielding a personalized fit.",
    hotspots: [
      {
        id: "garment-06",
        name: "Double-Breasted Sculptural Blazer",
        category: "Atelier",
        priceNGN: 195000,
        priceUSD: 148,
        x: 48,
        y: 40,
        fabric: "100% Super 120s Worsted Wool",
        gsm: "320 GSM",
        origin: "Biella, Italy",
        fit: "Architectural structured shoulder",
        sizes: ["XS", "S", "M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85",
        description: "Half-canvas horsehair chest piece, surgeon cuffs with functioning buttonholes, and cupro lining.",
        inStockCount: 5,
      },
      {
        id: "garment-07",
        name: "Goodyear-Welted Derby Shoes",
        category: "Footwear",
        priceNGN: 135000,
        priceUSD: 98,
        x: 52,
        y: 88,
        fabric: "Full-Grain Italian Calfskin",
        origin: "Civitanova Marche, Italy",
        fit: "True to size (D width)",
        sizes: ["40", "41", "42", "43", "44", "45"],
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85",
        description: "Traditional 360-degree storm welt, double leather sole, and blind eyelets hand-burnished with natural carnauba wax.",
        inStockCount: 8,
      },
    ],
  },
  {
    id: "look-04",
    lookNumber: "04",
    title: "Grade-A Cashmere Study",
    subtitle: "Heavyweight 4-ply Mongolian cashmere sweater with sculpted raglan sleeves.",
    location: "Milan Atelier • Dusk Study",
    editorialImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85",
    macroTextureImage: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=85",
    textureCaption: "Carded cashmere yarn spun to 15.5 micron fineness for pillow softness.",
    quote: "Knitted from white cashmere fibres combed from the underbelly of Capra hircus goats in the Inner Mongolian plateau.",
    hotspots: [
      {
        id: "garment-08",
        name: "Ribbed Cashmere Turtleneck Knit",
        category: "Knitwear",
        priceNGN: 180000,
        priceUSD: 135,
        x: 50,
        y: 35,
        fabric: "100% Grade-A Mongolian Cashmere",
        gsm: "380 GSM (4-Ply)",
        origin: "Inner Mongolia / Spun in Scotland",
        fit: "Relaxed high collar, easy drape",
        sizes: ["XS", "S", "M", "L"],
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85",
        description: "Seamless whole-garment 3D knitting technology eliminating bulky armhole seams for pure comfort.",
        inStockCount: 4,
      },
    ],
  },
  {
    id: "look-05",
    lookNumber: "05",
    title: "The Raw Indigo Selvedge Ensemble",
    subtitle: "Boxy Japanese denim jacket paired with relaxed front-creased trousers.",
    location: "Studio Lagos • Morning Sun",
    editorialImage: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=85",
    macroTextureImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
    textureCaption: "13.5 oz red-line selvedge denim shuttle-loomed in Kojima, Okayama.",
    quote: "Woven on vintage Toyoda shuttle looms with low tension, creating a slubby, irregular hand that fades uniquely to each wearer.",
    hotspots: [
      {
        id: "garment-09",
        name: "Boxy Selvedge Denim Overshirt",
        category: "Outerwear",
        priceNGN: 125000,
        priceUSD: 95,
        x: 48,
        y: 38,
        fabric: "100% Organic Cotton Selvedge",
        gsm: "13.5 oz",
        origin: "Kojima, Japan",
        fit: "Boxy cropped silhouette",
        sizes: ["S", "M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=85",
        description: "Pure plant indigo dyed rope yarns with antiqued copper rivets and selvedge ID on the interior placket.",
        inStockCount: 6,
      },
      {
        id: "garment-10",
        name: "Italian Calfskin Penny Loafers",
        category: "Footwear",
        priceNGN: 125000,
        priceUSD: 95,
        x: 52,
        y: 86,
        fabric: "100% French Calfskin Leather",
        origin: "Florence, Italy",
        fit: "True to size, comfortable flex",
        sizes: ["40", "41", "42", "43", "44", "45"],
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85",
        description: "Blake-stitched construction allows resoleability with immediate broken-in flexibility.",
        inStockCount: 5,
      },
    ],
  },
  {
    id: "look-06",
    lookNumber: "06",
    title: "Tuscan Leathercraft & Urban Travel",
    subtitle: "Architectural structured tote bag crafted from vegetable-tanned French calfskin.",
    location: "Milan Atelier • Afternoon Departure",
    editorialImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
    macroTextureImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",
    textureCaption: "Hand-burnished saddle-stitched edges with matte brass hardware.",
    quote: "Form following daily intention: large enough to store travel portfolios, reinforced at stress points with copper rivets.",
    hotspots: [
      {
        id: "garment-11",
        name: "Structured Minimalist Calfskin Tote",
        category: "Accessories",
        priceNGN: 175000,
        priceUSD: 132,
        x: 62,
        y: 60,
        fabric: "Vegetable-Tanned Italian Box Calf",
        origin: "Florence, Italy",
        fit: "Structured silhouette with shoulder drop",
        sizes: ["ONE SIZE"],
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
        description: "Seamless magnetic closure with an interior zip pouch and hand-finished beeswax edge paint.",
        inStockCount: 4,
      },
      {
        id: "garment-12",
        name: "Silk-Cotton Relaxed Studio Blouse",
        category: "Women",
        priceNGN: 75000,
        priceUSD: 58,
        x: 48,
        y: 42,
        fabric: "70% Organic Cotton / 30% Mulberry Silk",
        gsm: "110 GSM",
        origin: "Como, Italy",
        fit: "Easy relaxed drape with band collar",
        sizes: ["XS", "S", "M", "L"],
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85",
        description: "Concealed mother-of-pearl button placket with vented side seams and pleated cuffs.",
        inStockCount: 9,
      },
    ],
  },
];
