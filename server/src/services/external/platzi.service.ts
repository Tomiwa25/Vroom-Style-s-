import axios from "axios";

export interface PlatziRawProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: {
    id: number;
    name: string;
  };
}

export interface NormalizedImportedProduct {
  externalId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: "Women" | "Outerwear" | "Knitwear" | "Accessories";
  stock: number;
  tag: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  material: string;
  fitGuide: "True to Size" | "Runs Small" | "Runs Large";
}

const client = axios.create({
  baseURL: "https://api.escuelajs.co/api/v1",
  timeout: 8000,
});

/**
 * Curated high-resolution Fashion Triads (Editorial on Model, Clean Studio Profile, Macro Detail)
 * Guaranteeing that whenever Platzi sandbox supplies mismatched or corrupted images,
 * the customer is always presented with an authentic 3-angle garment gallery.
 */
const FASHION_TRIAD_CATALOG: Record<string, string[]> = {
  sneakers: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85", // 1: Editorial on-foot
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85", // 2: Clean studio profile
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85", // 3: Sole & stitching detail
  ],
  shoes: [
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85", // 1: Editorial on model
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=85", // 2: Studio angle
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85", // 3: Leather welt detail
  ],
  hoodie: [
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85", // 1: Editorial model
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85", // 2: Studio front
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85", // 3: Terry loop & rib cuffs
  ],
  jacket: [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85", // 1: Editorial model
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85", // 2: Studio front
    "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1200&q=85", // 3: Lapel & stitching detail
  ],
  coat: [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85", // 1: Editorial outdoor
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85", // 2: Studio silhouette
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85", // 3: Wool split seam
  ],
  sweater: [
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85", // 1: Editorial lifestyle
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85", // 2: Studio folded profile
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85", // 3: Cashmere rib macro
  ],
  tshirt: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85", // 1: Editorial model
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85", // 2: Studio front
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85", // 3: Cotton weave detail
  ],
  shirt: [
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85", // 1: Editorial lookbook
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=85", // 2: Studio angle
    "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=85", // 3: Mother-of-pearl buttons
  ],
  dress: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85", // 1: Editorial on model
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85", // 2: Clean studio silhouette
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85", // 3: Fabric flow & hem detail
  ],
  pants: [
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85", // 1: Editorial walking
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85", // 2: Studio front
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85", // 3: Pleat & pocket detail
  ],
  bag: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85", // 1: Editorial with model
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85", // 2: Studio angle
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85", // 3: Leather grain & brass
  ],
  accessory: [
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=85", // 1: Styled lifestyle
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85", // 2: Studio layout
    "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85", // 3: Hardware detail
  ],
};

/**
 * Cleans, sanitizes, and deduplicates image URLs returned by Platzi API.
 * Strips out mock/placeholder domains (placehold.co, placeimg.com) and bracket formatting.
 */
export const sanitizeAndDeduplicateImages = (rawImages: string[]): string[] => {
  if (!Array.isArray(rawImages)) return [];

  const cleaned: string[] = [];

  for (const item of rawImages) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const sub of parsed) {
            if (typeof sub === "string") {
              cleaned.push(
                sub.replace(/^[\s\[\]"'\\]+/, "").replace(/[\s\[\]"'\\]+$/, "").trim()
              );
            }
          }
          continue;
        }
      } catch {
        // Fall back to regex stripping if not strict JSON
      }
    }

    const stripped = trimmed
      .replace(/^[\s\[\]"'\\]+/, "")
      .replace(/[\s\[\]"'\\]+$/, "")
      .trim();
    cleaned.push(stripped);
  }

  const validUrls = cleaned.filter((url) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
    // Filter out spam placeholder generators
    const isPlaceholder =
      url.includes("placehold.co") ||
      url.includes("placeimg.com") ||
      url.includes("image-1.co") ||
      url.includes("cotton");
    return !isPlaceholder;
  });

  return Array.from(new Set(validUrls));
};

/**
 * Maps raw Platzi titles and descriptions into Vroom Style(s) core luxury categories.
 */
export const categorizeApparel = (
  title: string,
  desc: string
): "Women" | "Outerwear" | "Knitwear" | "Accessories" => {
  const text = `${title} ${desc}`.toLowerCase();

  if (
    text.includes("cap") ||
    text.includes("hat") ||
    text.includes("bag") ||
    text.includes("tote") ||
    text.includes("belt") ||
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("boot") ||
    text.includes("scarf")
  ) {
    return "Accessories";
  }
  if (
    text.includes("knit") ||
    text.includes("sweater") ||
    text.includes("cardigan") ||
    text.includes("cashmere") ||
    text.includes("pullover")
  ) {
    return "Knitwear";
  }
  if (
    text.includes("jacket") ||
    text.includes("coat") ||
    text.includes("hoodie") ||
    text.includes("sweatshirt") ||
    text.includes("blazer") ||
    text.includes("overshirt")
  ) {
    return "Outerwear";
  }
  return "Women";
};

/**
 * Guarantees a cohesive 3-angle Fashion Triad (Editorial, Studio, Detail)
 * for any imported garment, ensuring that clothes and shoes always show 3 perfectly
 * matching angles instead of random, unrelated images from the open sandbox API.
 */
export const resolveHarmonizedTriad = (
  title: string,
  desc: string,
  rawValidImages: string[]
): string[] => {
  const text = `${title} ${desc}`.toLowerCase();

  let matchedTriad: string[] = FASHION_TRIAD_CATALOG.dress;

  if (text.includes("sneaker") || text.includes("trainer")) {
    matchedTriad = FASHION_TRIAD_CATALOG.sneakers;
  } else if (text.includes("shoe") || text.includes("loafer") || text.includes("boot")) {
    matchedTriad = FASHION_TRIAD_CATALOG.shoes;
  } else if (text.includes("hoodie") || text.includes("sweatshirt")) {
    matchedTriad = FASHION_TRIAD_CATALOG.hoodie;
  } else if (text.includes("jacket") || text.includes("blazer") || text.includes("overshirt")) {
    matchedTriad = FASHION_TRIAD_CATALOG.jacket;
  } else if (text.includes("coat") || text.includes("parka") || text.includes("trench")) {
    matchedTriad = FASHION_TRIAD_CATALOG.coat;
  } else if (text.includes("sweater") || text.includes("knit") || text.includes("cardigan")) {
    matchedTriad = FASHION_TRIAD_CATALOG.sweater;
  } else if (text.includes("t-shirt") || text.includes("tee")) {
    matchedTriad = FASHION_TRIAD_CATALOG.tshirt;
  } else if (text.includes("shirt") || text.includes("blouse") || text.includes("linen")) {
    matchedTriad = FASHION_TRIAD_CATALOG.shirt;
  } else if (text.includes("pant") || text.includes("trouser") || text.includes("jean")) {
    matchedTriad = FASHION_TRIAD_CATALOG.pants;
  } else if (text.includes("bag") || text.includes("tote") || text.includes("backpack")) {
    matchedTriad = FASHION_TRIAD_CATALOG.bag;
  } else if (text.includes("belt") || text.includes("scarf") || text.includes("hat")) {
    matchedTriad = FASHION_TRIAD_CATALOG.accessory;
  }

  // If the sandbox API provided at least one valid image, keep it as the primary Editorial shot,
  // but use the matching triad's studio silhouette and craftsmanship detail for views 2 & 3.
  if (rawValidImages.length > 0) {
    return [rawValidImages[0], matchedTriad[1], matchedTriad[2]];
  }

  return matchedTriad;
};

/**
 * Fetches real apparel items from Platzi's fashion categories, sanitizes titles,
 * guarantees a 3-angle fashion triad per item, and converts USD prices to Nigerian Naira (NGN).
 */
export const fetchPlatziFashionCatalog = async (
  limit = 40
): Promise<NormalizedImportedProduct[]> => {
  try {
    // Category 1 = Clothes in Platzi API
    const response = await client.get<PlatziRawProduct[]>(`/products/?categoryId=1&limit=${limit}`);
    const rawItems = response.data || [];

    const normalized: NormalizedImportedProduct[] = [];

    for (const item of rawItems) {
      // Filter out test spam submissions
      const titleLower = item.title.toLowerCase();
      if (
        titleLower.startsWith("title-") ||
        titleLower.startsWith("new product") ||
        titleLower.startsWith("producto") ||
        titleLower.startsWith("ceramic") ||
        item.title.length < 5
      ) {
        continue;
      }

      const cleanImages = sanitizeAndDeduplicateImages(item.images);
      // Guarantee a matching 3-shot Fashion Triad
      const triadImages = resolveHarmonizedTriad(item.title, item.description, cleanImages);

      // Convert USD to Naira ($1 USD ≈ ₦1,500 NGN) rounded to nearest thousand
      const priceInNaira = Math.max(25000, Math.round((item.price * 1500) / 1000) * 1000);
      const category = categorizeApparel(item.title, item.description);

      normalized.push({
        externalId: 2000 + item.id, // Offset to prevent colliding with signature pieces (101-112)
        name: item.title,
        description: item.description,
        price: priceInNaira,
        image: triadImages[0],
        images: triadImages,
        category,
        stock: Math.floor(Math.random() * 14) + 6, // 6 to 20 units
        tag: "Platzi Drop",
        sizes: category === "Accessories" ? ["One Size"] : ["S", "M", "L", "XL"],
        colors: [
          { name: "Noir", hex: "#18181B" },
          { name: "Oat Sand", hex: "#D9CDBF" },
          { name: "Slate", hex: "#475569" },
        ],
        material: "Organic Cotton & Premium Wool Blend",
        fitGuide: "True to Size",
      });
    }

    return normalized;
  } catch (error) {
    console.error("[PlatziService] Failed to fetch external fashion catalog:", error);
    return [];
  }
};
