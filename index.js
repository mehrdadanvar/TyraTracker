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
}
// console.log(CT);
module.exports = CT;
