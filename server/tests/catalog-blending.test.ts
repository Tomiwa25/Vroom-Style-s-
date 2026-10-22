import { describe, it, expect } from "vitest";
import {
  sanitizeAndDeduplicateImages,
  categorizeApparel,
} from "../src/services/external/platzi.service.js";
import { searchEditorialFashionImages } from "../src/services/external/unsplash.service.js";
import { catalogSeedData } from "../src/scripts/seed.js";

describe("Catalog Blending & Image Deduplication Pipeline", () => {
  it("deduplicates images and strips malformed brackets and quotes", () => {
    const raw = [
      '["https://i.imgur.com/example1.jpeg"]',
      "https://i.imgur.com/example1.jpeg",
      "https://i.imgur.com/example2.jpeg",
      "https://placehold.co/600x400",
      "not-a-url",
    ];

    const result = sanitizeAndDeduplicateImages(raw);
    expect(result).toHaveLength(2);
    expect(result).toContain("https://i.imgur.com/example1.jpeg");
    expect(result).toContain("https://i.imgur.com/example2.jpeg");
    expect(result).not.toContain("https://placehold.co/600x400");
  });

  it("accurately categorizes apparel based on title and description", () => {
    expect(categorizeApparel("Silk Evening Dress", "A flowing silk gown")).toBe("Women");
    expect(categorizeApparel("Oversized Wool Trench Coat", "Warm tailored outerwear")).toBe("Outerwear");
    expect(categorizeApparel("Ribbed Cashmere Cardigan", "Soft knit sweater")).toBe("Knitwear");
    expect(categorizeApparel("Leather Tote Bag", "Italian leather accessory")).toBe("Accessories");
  });

  it("contains exactly 12 signature atelier pieces with unique lookbook images", () => {
    expect(catalogSeedData).toHaveLength(12);

    const externalIds = catalogSeedData.map((p) => p.externalId);
    expect(new Set(externalIds).size).toBe(12);
    expect(externalIds).toEqual([101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112]);

    // Verify all primary product images are unique
    const primaryImages = catalogSeedData.map((p) => p.image);
    expect(new Set(primaryImages).size).toBe(12);

    // Verify all gallery images across all products have no cross-product duplicates
    const allGalleryUrls: string[] = [];
    catalogSeedData.forEach((p) => {
      // Each product's internal gallery must be deduplicated
      const uniqueInternal = new Set(p.images);
      expect(uniqueInternal.size).toBe(p.images.length);
      allGalleryUrls.push(...p.images);
    });

    // Check that gallery URLs are distinct across products
    const uniqueGalleryUrls = new Set(allGalleryUrls);
    expect(uniqueGalleryUrls.size).toBe(allGalleryUrls.length);
  });

  it("enforces Nigerian Naira (NGN) pricing rule on atelier seed data", () => {
    catalogSeedData.forEach((product) => {
      expect(product.price).toBeGreaterThanOrEqual(20000);
      expect(product.price % 1000).toBe(0); // Clean thousand multiples in Naira
    });
  });

  it("falls back gracefully to curated lookbook CDN when UNSPLASH_ACCESS_KEY is absent", async () => {
    const images = await searchEditorialFashionImages("dress", 2);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].url).toContain("images.unsplash.com");
    expect(images[0].photographer).toBeDefined();
  });
});
