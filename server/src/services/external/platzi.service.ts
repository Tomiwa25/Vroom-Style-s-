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
 * Cleans, sanitizes, and deduplicates image URLs returned by Platzi API.
 * Strips out mock/placeholder domains (placehold.co, placeimg.com) and bracket formatting.
 */
export const sanitizeAndDeduplicateImages = (rawImages: string[]): string[] => {
  if (!Array.isArray(rawImages)) return [];

  const cleaned: string[] = [];

  for (const item of rawImages) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();

    // Sometimes Platzi sandbox contains stringified JSON arrays like '["https://..."]'
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

  // Deduplicate array
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

  if (text.includes("cap") || text.includes("hat") || text.includes("bag") || text.includes("tote") || text.includes("belt") || text.includes("shoe") || text.includes("sneaker")) {
    return "Accessories";
  }
  if (text.includes("knit") || text.includes("sweater") || text.includes("cardigan") || text.includes("cashmere")) {
    return "Knitwear";
  }
  if (text.includes("jacket") || text.includes("coat") || text.includes("hoodie") || text.includes("sweatshirt") || text.includes("blazer") || text.includes("overshirt")) {
    return "Outerwear";
  }
  return "Women";
};

/**
 * Fetches real apparel items from Platzi's fashion categories, sanitizes titles,
 * cleans image duplicates, and converts USD prices to Nigerian Naira (NGN).
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
      if (cleanImages.length === 0) {
        continue; // Skip products with no valid photographs
      }

      // Convert USD to Naira ($1 USD ≈ ₦1,500 NGN) rounded to nearest thousand
      const priceInNaira = Math.max(25000, Math.round((item.price * 1500) / 1000) * 1000);
      const category = categorizeApparel(item.title, item.description);

      normalized.push({
        externalId: 2000 + item.id, // Offset to prevent colliding with signature pieces (101-112)
        name: item.title,
        description: item.description,
        price: priceInNaira,
        image: cleanImages[0],
        images: cleanImages,
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
