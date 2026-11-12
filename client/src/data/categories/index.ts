import { carsProducts } from "./cars";
import { fridgesProducts } from "./fridges";
import { microwavesProducts } from "./microwaves";
import { kitchenUtensilsProducts } from "./kitchenUtensils";
import { furnitureProducts } from "./furniture";
import { tvsProducts } from "./tvs";
import { laptopsProducts } from "./laptops";
import { monitorsProducts } from "./monitors";

export {
  carsProducts,
  fridgesProducts,
  microwavesProducts,
  kitchenUtensilsProducts,
  furnitureProducts,
  tvsProducts,
  laptopsProducts,
  monitorsProducts
};

export const expandedCatalog = [
  ...carsProducts,
  ...fridgesProducts,
  ...microwavesProducts,
  ...kitchenUtensilsProducts,
  ...furnitureProducts,
  ...tvsProducts,
  ...laptopsProducts,
  ...monitorsProducts
];
