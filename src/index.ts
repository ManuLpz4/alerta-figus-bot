//
//   /$$$$$$  /$$                       /$$                      /$$$$$$  /$$
//  /$$__  $$| $$                      | $$                     /$$__  $$|__/
// | $$  \ $$| $$  /$$$$$$   /$$$$$$  /$$$$$$    /$$$$$$       | $$  \__/ /$$  /$$$$$$  /$$   /$$  /$$$$$$$
// | $$$$$$$$| $$ /$$__  $$ /$$__  $$|_  $$_/   |____  $$      | $$$$    | $$ /$$__  $$| $$  | $$ /$$_____/
// | $$__  $$| $$| $$$$$$$$| $$  \__/  | $$      /$$$$$$$      | $$_/    | $$| $$  \ $$| $$  | $$|  $$$$$$
// | $$  | $$| $$| $$_____/| $$        | $$ /$$ /$$__  $$      | $$      | $$| $$  | $$| $$  | $$ \____  $$
// | $$  | $$| $$|  $$$$$$$| $$        |  $$$$/|  $$$$$$$      | $$      | $$|  $$$$$$$|  $$$$$$/ /$$$$$$$/
// |__/  |__/|__/ \_______/|__/         \___/   \_______/      |__/      |__/ \____  $$ \______/ |_______/
//                                                                           /$$  \ $$
//                                                                          |  $$$$$$/
//                                                                           \______/
//

import axios from "axios";
import * as cheerio from "cheerio";

class Product {
  title: string;
  price: string;
  link: string;

  constructor(title: string, price: string, link: string) {
    this.title = title;
    this.price = price;
    this.link = link;
  }
}

async function checkAvailableProducts(): Promise<void> {
  const url = "https://www.zonakids.com/productos";

  try {
    const panini = await axios.get(url);
    const $ = cheerio.load(panini.data);
    const products = $(".item");
    const availableProducts: Product[] = [];

    products.each((_, element) => {
      const product = $(element);
      const isAvailable = !product.text().includes("Sin stock");

      if (isAvailable) {
        const title = product.find(".item-link").first().attr("title")!;
        const price = product.find(".item-price").first().text().trim();
        const link = product.find(".item-link").first().attr("href")!;
        const availableProduct = new Product(title, price, link);

        availableProducts.push(availableProduct);
      }
    });

    if (!availableProducts.length) return console.log("Aún no hay stock");

    console.log(availableProducts);
  } catch (error) {
    throw Error("Me mataste, mostro");
  }
}

setInterval(checkAvailableProducts, 60_000);
