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
import { TwitterApi } from "twitter-api-v2";
import "dotenv/config";
import Product from "./domain/entities/Product.js";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY as string,
  appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
});

async function getAvailableProducts(): Promise<Product[]> {
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
        const availableProduct = new Product(
          product.find(".item-link").first().attr("title")!,
          product.find(".item-price").first().text().trim(),
          product.find(".item-link").first().attr("href")!
        );

        availableProducts.push(availableProduct);
      }
    });

    return availableProducts;
  } catch (error) {
    throw Error("Me mataste, mostro");
  }
}

setInterval(async () => {
  try {
    const availableProducts = await getAvailableProducts();

    if (availableProducts.length) {
      let text =
        "🚨 ¡Contra todo pronóstico hay productos disponibles en la página oficial de @PaniniArg!";

      availableProducts.forEach((product, index) => {
        text.concat(
          `\n\n\\u003${index} ${product.title} (${product.price}) 👇🏻\n${product.link}`
        );
      });
      twitterClient.v2.tweet(text);
    }
  } catch (_) {
    console.log("Algo reventó pero vamos a seguir intentando");
  }
}, 60_000);
