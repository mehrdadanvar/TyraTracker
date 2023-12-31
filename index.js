const axios = require("axios");
const loaded_statics = require("./statics");

class CT {
  constructor(name) {
    this.name = name;
  }
  /////////////////////////////////////////////////////////////////
  ///////////////// Statics ///////////////////////////////////////
  static request_headers = loaded_statics.ct_headers;
  static price_url = loaded_statics.price_url;
  static timer = (ms) => new Promise((res) => setTimeout(res, ms));
  /////////////////////////////////////////////////////////////////
  static async load_product_codes() {
    let response = await fetch("https://tirecodes.pages.dev/");
    let raw_text = await response.text();
    //const regex = /{([^}]+)}/g;
    let regex = /<body>([\s\S]*?)<\/body>/;
    const match = regex.exec(raw_text);
    const final = match[1].replace(/[\n\s]/g, "");
    let data = JSON.parse(final);
    return data.codes;
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
  ///////////////////////////////////////////////////////////////////////
  static async fetch_single_batch(product_numbers, store_id) {
    if (product_numbers.length > 0) {
      console.log("stop! Maxium 40 products allowed");
      return;
    } else {
      let target_url = `${CT.price_url}?lang=en_CA&storeId=${store_id}`;
      let target_codes = product_numbers.map((element) => {
        return { code: element, lowStockThreshold: 0 };
      });
      try {
        let response = await axios.post(target_url, { skus: target_codes }, { headers: CT.request_headers });
        console.log(response.status, "response code");
        let retrieved_skus = response.data.skus;
        let cleaned_skus = retrieved_skus.map((product) => {
          return this.clean_product(product);
        });
        return cleaned_skus;
      } catch (error) {
        error ? console.log(error) : "";
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////

  static async inner_loop(n, outer_target, batch_size, store_id, minor_stop) {
    let inner_scraped = [];
    // console.log(outer_target, request_spree, "outer_target is");
    let [lower, upper] = [Math.floor(n / batch_size), Math.ceil(n / batch_size)];
    let remainder = n - lower * batch_size;
    // console.table([lower, upper, remainder]);
    for (let j = 0; j < upper; j++) {
      console.log(`j from inner loop is ${j}`);
      let inter = this.fetch_single_batch(outer_target.slice(j * batch_size, (j + 1) * batch_size), store_id);
      inner_scraped.push(inter);
      // inter.forEach((item) => {
      //   console.log(`inner_scraped length is ${inner_scraped.length}`);
      //   inner_scraped.push(item);
      // });

      // await this.timer(minor_stop);
    }
    return inner_scraped;
    //this is a promise which is an array of arrays , later to be resolved
  }
  //////////////////////////////////////////////////////////////////////////
  static async fetch_multiple_batches(product_list, store_id, batch_size = 40, major_stop = 1000) {
    let [final, n] = [[], product_list.length];
    let [up_bound, low_bound] = [Math.ceil(n / batch_size), Math.floor(n / batch_size)];
    for (let i = 0; i < up_bound; i++) {
      console.log(`i is now ${i}`);
      let target = product_list.slice(i * batch_size, (i + 1) * batch_size);
      let inner_promise = this.fetch_single_batch(target, store_id);
      final.push(inner_promise);
      await this.timer(major_stop);
    }
    return final;
  }
  //////////////////////////////////////////////////////////////////////////
}

module.exports = CT;
