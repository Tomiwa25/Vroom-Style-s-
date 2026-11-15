export const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";
export const px = (file: string, w: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(CDN + file)}&w=${w}&q=85`;

export const CUTS = [
  "hf_20261108_190717_6580d844-f3b0-4240-8b4a-239355685fc9.png",
  "hf_20261111_034030_a9171bb1-0b34-4468-9a9e-f451d79b8429.png",
  "hf_20261111_034045_5a78f1ff-8dea-4054-85bc-60a28a4cc434.png",
  "hf_20261111_034059_24eecc7c-e8b7-4b9c-b58c-b862b1261e87.png",
  "hf_20261111_034112_5aa3a76f-7e92-48bb-b93d-ec3a35be2494.png",
  "hf_20261111_034123_ce28dc23-bd91-40ba-95e6-7a09442a865f.png",
  "hf_20261111_034137_abed307a-bcb4-4192-82e9-6ec122a80820.png",
  "hf_20261111_034150_fc1776ff-a8d6-4060-a8af-1afedfdfc563.png",
  "hf_20261111_034202_62b7ffb7-14f5-4dfc-87fe-83c6d9ee6134.png",
];

export const SHEETS = [
  "hf_20261108_190756_3f427fdd-ba34-433e-bc55-eb9b03d2e1c6.png",
  "hf_20261108_190758_785127d3-ef7d-4831-976b-14540a7188aa.png",
  "hf_20261108_190800_4db1daba-ebb1-436f-857a-91dfab40f4b7.png",
];

export const CLOTH = ["S", "M", "L", "XL"];
export const SHOE = ["40", "41", "42", "43", "44", "45"];
export const ONE = ["One size"];

export interface LookItem {
  name: string;
  kind: string;
  price: number;
  sizes: string[];
}

export interface LookDef {
  name: string;
  foot: number;
  tags: [number, number][];
  items: LookItem[];
}

export const LOOKS: LookDef[] = [
  {
    name: "Somewhere Else",
    foot: 0.0501,
    tags: [[52, 44], [80, 40], [44, 57]],
    items: [
      { name: "Ribbed Tank Top", kind: "Top", price: 36, sizes: CLOTH },
      { name: "Striped Open Shirt", kind: "Top", price: 74, sizes: CLOTH },
      { name: "Braided Belt", kind: "Accessory", price: 32, sizes: ONE },
    ],
  },
  {
    name: "Dial-Up",
    foot: 0.0501,
    tags: [[76, 45], [54, 68], [45, 87]],
    items: [
      { name: "Corduroy Trucker", kind: "Outerwear", price: 142, sizes: CLOTH },
      { name: "Pleated Shorts", kind: "Bottom", price: 64, sizes: CLOTH },
      { name: "Suede Moccasin", kind: "Shoes", price: 118, sizes: SHOE },
    ],
  },
  {
    name: "Long Walks",
    foot: 0.0656,
    tags: [[66, 47], [51, 64], [48, 87]],
    items: [
      { name: "Polar Fleece Zip", kind: "Top", price: 92, sizes: CLOTH },
      { name: "Nylon Hike Shorts", kind: "Bottom", price: 58, sizes: CLOTH },
      { name: "Mesh Trainers", kind: "Shoes", price: 124, sizes: SHOE },
    ],
  },
  {
    name: "Low Battery",
    foot: 0.0582,
    tags: [[76, 47], [43, 70], [54, 88]],
    items: [
      { name: "Yellow Anorak Shell", kind: "Outerwear", price: 128, sizes: CLOTH },
      { name: "Fleece Joggers", kind: "Bottom", price: 72, sizes: CLOTH },
      { name: "Chunky Sandals", kind: "Shoes", price: 84, sizes: SHOE },
    ],
  },
  {
    name: "No Reply",
    foot: 0.065,
    tags: [[72, 41], [51, 68], [45, 89]],
    items: [
      { name: "Navy Rollneck Knit", kind: "Top", price: 118, sizes: CLOTH },
      { name: "Wool Trousers", kind: "Bottom", price: 106, sizes: CLOTH },
      { name: "Leather Mary Janes", kind: "Shoes", price: 134, sizes: SHOE },
    ],
  },
  {
    name: "Analog",
    foot: 0.047,
    tags: [[75, 45], [51, 70], [46, 88]],
    items: [
      { name: "Corduroy Blazer", kind: "Outerwear", price: 156, sizes: CLOTH },
      { name: "Black Slim Jeans", kind: "Bottom", price: 98, sizes: CLOTH },
      { name: "Desert Boots", kind: "Shoes", price: 146, sizes: SHOE },
    ],
  },
  {
    name: "Rewind",
    foot: 0.0377,
    tags: [[69, 43], [51, 72], [56, 92]],
    items: [
      { name: "Faded Black Hoodie", kind: "Top", price: 86, sizes: CLOTH },
      { name: "Carpenter Trousers", kind: "Bottom", price: 94, sizes: CLOTH },
      { name: "Retro Court Sneaker", kind: "Shoes", price: 116, sizes: SHOE },
    ],
  },
  {
    name: "Out Of Office",
    foot: 0.0891,
    tags: [[65, 47], [43, 68], [60, 86]],
    items: [
      { name: "Linen Camp Shirt", kind: "Top", price: 76, sizes: CLOTH },
      { name: "Pleated Bermuda", kind: "Bottom", price: 68, sizes: CLOTH },
      { name: "Leather Slides", kind: "Shoes", price: 62, sizes: SHOE },
    ],
  },
  {
    name: "Paper Maps",
    foot: 0.0588,
    tags: [[66, 41], [48, 72], [56, 88]],
    items: [
      { name: "Rugby Top", kind: "Top", price: 88, sizes: CLOTH },
      { name: "Tapered Khakis", kind: "Bottom", price: 84, sizes: CLOTH },
      { name: "Suede Low-Tops", kind: "Shoes", price: 122, sizes: SHOE },
    ],
  },
];

export const money = (v: number) => "$" + (Math.round(v * 100) / 100).toFixed(v % 1 ? 2 : 0);
export const pad = (n: number) => String(n).padStart(2, "0");
export const wrapAngle = (a: number) => {
  let res = a;
  while (res > Math.PI) res -= 2 * Math.PI;
  while (res <= -Math.PI) res += 2 * Math.PI;
  return res;
};
export const shortest = (target: number, from: number) => ((target - from + 4.5) % 9 + 9) % 9 - 4.5;
