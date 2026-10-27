import axios from "axios";

export interface EditorialImageResult {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
}

// Curated high-res lookbook CDN fallback map (active when no API key is provided)
const CURATED_LOOKBOOK_MAP: Record<string, string[]> = {
  dress: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
  ],
  coat: [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
  ],
  blazer: [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
  ],
  knit: [
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
  ],
  bag: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=85",
  ],
  accessory: [
    "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=85",
  ],
};

/**
 * Searches Unsplash API for editorial luxury fashion photography.
 * Falls back to curated high-resolution lookbook CDN urls when UNSPLASH_ACCESS_KEY is absent.
 */
export const searchEditorialFashionImages = async (
  query: string,
  count = 4
): Promise<EditorialImageResult[]> => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (accessKey) {
    try {
      const response = await axios.get("https://api.unsplash.com/search/photos", {
        params: {
          query: `${query} fashion editorial luxury`,
          orientation: "portrait",
          per_page: count,
        },
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        timeout: 5000,
      });

      const results = response.data?.results || [];
      return results.map((photo: any) => ({
        id: photo.id,
        url: `${photo.urls.raw}&auto=format&fit=crop&w=1200&q=85`,
        thumb: photo.urls.small,
        alt: photo.alt_description || query,
        photographer: photo.user?.name || "Unsplash Creator",
      }));
    } catch (err) {
      console.warn("[UnsplashService] API request failed, using curated lookbook fallback:", err);
    }
  }

  // Graceful zero-dependency fallback using curated editorial lookbook dictionary
  const q = query.toLowerCase();
  let matchedUrls: string[] = [];

  for (const [key, urls] of Object.entries(CURATED_LOOKBOOK_MAP)) {
    if (q.includes(key)) {
      matchedUrls = urls;
      break;
    }
  }

  if (matchedUrls.length === 0) {
    matchedUrls = CURATED_LOOKBOOK_MAP.dress;
  }

  return matchedUrls.slice(0, count).map((url, idx) => ({
    id: `curated-${idx + 1}`,
    url,
    thumb: url.replace("w=1200", "w=400"),
    alt: `Vroom Style(s) ${query} lookbook`,
    photographer: "Atelier Curated Collection",
  }));
};
