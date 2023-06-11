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
}
// console.log(CT);
module.exports = CT;
