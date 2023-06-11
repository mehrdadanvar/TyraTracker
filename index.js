const axios = require("axios");
const loaded_statics = require("./statics");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.DB_URI);

class CT {
  constructor(name) {
    this.name = name;
  }
  ///////////////// Statics ///////////////////////////////////////
  static request_headers = loaded_statics.ct_headers;
  static price_url = loaded_statics.price_url;
  static timer = (ms) => new Promise((res) => setTimeout(res, ms));
  /////////////////////////////////////////////////////////////////
  static async load_product_codes() {
    try {
      const database = client.db("codes");
      const codes = database.collection("codes");
      const skus = codes.find();
      let cleaned_codes = [];
      for await (const sku of skus) {
        cleaned_codes.push(sku.codes);
      }
      return cleaned_codes[0];
    } catch (error) {
      error ? console.log(error) : "";
    } finally {
      await client.close();
    }
  }
  /////////////////////////////////////////////////////////////////
  static async fetch_stores() {
    try {
      const database = client.db("tirestores");
      const collection = database.collection("stores");
      const stores = collection.find();
      let cleaned_stores = [];
      for await (let store of stores) {
        cleaned_stores.push(store);
      }
      return cleaned_stores;
    } catch (error) {
      error ? console.log(error) : "";
    } finally {
      await client.close();
    }
  }
  ///////////////////////////////////////////////////////////////////////
  static clean_product(element) {
    return {
      code: element.code,
      price: element.currentPrice.value,
      store_quantity: element.fulfillment.availability.quantity,
      corporate_quantity:
        element.fulfillment.availability.Corporate.Quantity === undefined
          ? null
          : element.fulfillment.availability.Corporate.Quantity,
    };
  }
}
///////////////////////////////////////////////////////////////////////

// console.log(CT);
module.exports = CT;
