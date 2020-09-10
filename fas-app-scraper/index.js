/*
Module created to consume data from Apple and Google Play stores. Saves results to a file inside data folder. 
*/
const store = require('app-store-scraper');
const gplay = require('google-play-scraper');
const util = require('util');
const fs = require('fs');
const config = require('./config.json')

class FileHelper {
  constructor(config) {
    this.config = config

    this.DEBUG = config.DEBUG || 0; // if 1, first 100 results are printed on console
    this.PRETIFY_JSON = config.PRETIFY_JSON || true;
    this.OUTPUT_FOLDER_PATH = config.OUTPUT_FOLDER_PATH || 'data/';
    this.DEFAULT_OUTPUT_FILE = config.DEFAULT_OUTPUT_FILE || 'result.json';
  }

  log_json_to_file(data, file_path, pretify_json = true) {
    const indentation = pretify_json ? 2 : 0;
    fs.writeFile(file_path, JSON.stringify(data, null, indentation), (err) => {
      if (err) {
        console.error(err);
        return;
      };
      console.log(`File saved at '${file_path}' with [${data.length-1}] items`);
    });
  }

  save_to_file(result, file_name) {
    const file_path = this.OUTPUT_FOLDER_PATH + (file_name || this.DEFAULT_OUTPUT_FILE)
    this.log_json_to_file(result, file_path);
  }

  save_to_file_async(result, file_name) {
    if (result && result instanceof Promise) {
      result.then(data => {
        this.save_to_file(data, file_name)
      }).catch(console.log);
    } else {
      this.save_to_file(result, file_name)
    }
  }

}

class Fas_apple_appstore_scraper {

  constructor(config, file_helper) {
    this.config = config
    this.fh = file_helper

    this.DEBUG = config.DEBUG || 0; // if 1, first 100 results are printed on console
    this.global_params = {}
  }

  /*
  Method: get_app_details
  Retrieves the full detail of an application. Options:

  id: the iTunes "trackId" of the app, for example 553834731 for Candy Crush Saga. Either this or the appId should be provided.
  appId: the iTunes "bundleId" of the app, for example com.midasplayer.apps.candycrushsaga for Candy Crush Saga. Either this or the id should be provided.
  country: the two letter country code to get the app details from. Defaults to us. Note this also affects the language of the data.
  ratings: load additional ratings information like ratings number and histogram
  */

  async get_app_details(id = '553834731 ', appId = 'com.midasplayer.apps.candycrushsaga', lang = 'en', country = 'us', ratings = false) {
    const global_params = this.global_params
    const params = {
      'id': id,
      'appId': appId,
      'lang': lang,
      'country': country,
      'ratings': ratings,
      ...global_params
    }

    let data = [{
      'params': {
        'method': 'get_app_details',
        ...params,
      },
    }];

    await store.app(params)
      .then(result => {
        data.push(result)
      })
      .catch(err => {
        console.log("error", err)
      });

    return data;
  }

  /*
  Method: get_list
  Retrieves a list of applications from one of the collections at iTunes. Options:

  collection: the collection to look up. Defaults to collection.TOP_FREE_IOS, available options can be found here.
  https://github.com/facundoolano/app-store-scraper/blob/master/lib/constants.js#L3

  category: the category to look up. This is a number associated with the genre for the application. Defaults to no specific category. Available options can be found here.
  https://github.com/facundoolano/app-store-scraper/blob/master/lib/constants.js#L19

  country: the two letter country code to get the list from. Defaults to us.

  num: the amount of elements to retrieve. Defaults to 50, maximum allowed is 200.

  fullDetail: If this is set to true, an extra request will be made to get extra attributes of the resulting applications (like those returned by the app method).

  */

  async get_list(num = 1, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES_ACTION, country = 'us', fullDetail = false) {
    const global_params = this.global_params
    const params = {
      'num': num,
      'collection': collection,
      'catagory': catagory,
      'country': country,
      'fullDetail': fullDetail,
      ...global_params
    }

    let data = [{
      'params': {
        'method': 'get_list',
        ...params,
      },
    }];

    await store.list(params)
      .then(result => {
        data.push(...result)
      })
      .catch(err => {
        console.log("error", err)
      });

    return data;

  }


  /*
  Method: get_search
  Retrieves a list of apps that results of searching by the given term. Options:

  term: the term to search for (required).

  num: the amount of elements to retrieve. Defaults to 50.

  page: page of results to retrieve. Defaults to to 1.

  country: the two letter country code to get the similar apps from. Defaults to us.

  lang: language code for the result text. Defaults to en-us.

  idsOnly: (optional, defaults to false): skip extra lookup request. Search results will contain array of application ids.

  */

  async get_search(term, num = 1, page = 1, lang = 'en', country = 'us', idsOnly = true) {
    const global_params = this.global_params
    const params = {
      'term': term,
      'num': num,
      'page': page,
      'lang': lang,
      'country': country,
      'idsOnly': idsOnly,
      ...global_params
    }

    let data = [{
      'params': {
        'method': 'get_search',
        ...params,
      },
    }];

    await store.search(params)
      .then(result => {
        data.push(...result)
      })
      .catch(err => {
        console.log("error", err)
      });

    return data;
  }

  // Method: Create data files. Existing file data will be over-written.
  create_data_files = () => {
    const file_prefix = 'apple_'
    const num = 100
    const page_count = 10

    // Get App Details
    const app_id = 553834731 // 'com.midasplayer.apps.candycrushsaga'
    const app_name = 'com.midasplayer.apps.candycrushsaga'
    var result = this.get_app_details(app_id, app_name, 'en', 'us', true);
    this.fh.save_to_file_async(result, `${file_prefix}_app_detail_${app_name}.json`)

    // // // Get_top_free_action games for iPAD
    // get_list(50, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES_ACTION, age = null, fullDetail = false)
    var result = this.get_list(num, store.collection.TOP_FREE_IPAD, store.category.GAMES_ACTION, null, false)
    this.fh.save_to_file_async(result, `${file_prefix}_listdata.json`)

    // // // Get_top_free_action games for iPAD with details for each
    //(num = 200, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES, age = null, fullDetail = true)
    var result = this.get_list(num, store.collection.TOP_FREE_IPAD, store.category.GAMES, null, true)
    this.fh.save_to_file_async(result, `${file_prefix}_listdata_with_details.json`)

    // // Get all apps with full details matching the search term 'covid19'
    // get_search(term = 'covid19', num = 100)
    const search_term = 'covid19'
    var result = this.get_search(search_term, num)
    this.fh.save_to_file_async(result, `${file_prefix}_${search_term}_search.json`)

    // // Get all apps with Ids only matching the search term 'covid19'
    // get_search(term = 'covid19', num = 250, page = 1, idsOnly = true)
    var result = this.get_search('covid19', num, 1, true)
    this.fh.save_to_file_async(result, `${file_prefix}_${search_term}_search_ids-only-page-1.json`)

    // // Get all apps with Ids only matching the search term 'covid19'
    // get_search(term = 'covid19', num = 250, page = 2, idsOnly = true)
    var result = this.get_search('covid19', num, 2, true)
    this.fh.save_to_file_async(result, `${file_prefix}_${search_term}_search_ids-only-page-2.json`)
  }

}



class Fas_google_playstore_scraper {

  constructor(config, file_helper) {
    this.config = config
    this.fh = file_helper

    this.DEBUG = config.DEBUG || 0; // if 1, first 100 results are printed on console
    this.global_params = {}
  }


  /*
  Method: get_app_details
  Retrieves the full detail of an application. 

  Params:
  appId: the Google Play id of the application (the ?id= parameter on the url).
  lang (optional, defaults to 'en'): the two letter language code in which to fetch the app page.
  country (optional, defaults to 'us'): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.
  */

  async get_app_details(appId = 'com.google.android.apps.translate', lang = 'en', country = 'us') {
    const global_params = this.global_params
    const params = {
      'appId': appId,
      'lang': lang,
      'country': country,
      ...global_params
    }

    let data = [{
      'params': {
        'method': 'get_app_details',
        ...params,
      },
    }];

    await gplay.app(params)
      .then(result => {
        data.push(result)
      })
      .catch(err => {
        console.log("error", err)
      });

    return data;
  }

  /*
  Method: get_list
  Retrieve a list of applications from one of the collections at Google Play. 

  Params:
  collection (optional, defaults to collection.TOP_FREE): the Google Play collection that will be retrieved. Available options can bee found here.
  https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L58
  category (optional, defaults to no category): the app category to filter by. Available options can bee found here.
  https://github.com/facundoolano/google-play-scraper/blob/dev/lib/constants.js#L3
  age (optional, defaults to no age filter): the age range to filter the apps (only for FAMILY and its subcategories). 
  Available options are age.FIVE_UNDER, age.SIX_EIGHT, age.NINE_UP.
  num (optional, defaults to 500): the amount of apps to retrieve.
  lang (optional, defaults to 'en'): the two letter language code used to retrieve the applications.
  country (optional, defaults to 'us'): the two letter country code used to retrieve the applications.
  fullDetail (optional, defaults to false): if true, an extra request will be made for every resulting app to fetch its full detail.
  */

  async get_list(num = 1, collection = gplay.collection.TOP_FREE, catagory = gplay.category.GAME, age = null, fullDetail = false) {
    const global_params = this.global_params
    const params = {
      'num': num,
      'collection': collection,
      'catagory': catagory,
      'fullDetail': fullDetail,
      ...global_params
    }

    let data = [{
      'params': {
        'method': 'get_list',
        ...params,
      },
    }];

    await gplay.list(params)
      .then(result => {
        data.push(...result)
      })
      .catch(err => {
        console.log("error", err)
      });

    return data;

  }


  /*
  Method: get_search
  Retrieve a list of applications from one of the collections at Google Play

  Params:
  Retrieves a list of apps that results of searching by the given term. Options:

  term: the term to search by.
  num (optional, defaults to 20, max is 250): the amount of apps to retrieve.
  lang (optional, defaults to 'en'): the two letter language code used to retrieve the applications.
  country (optional, defaults to 'us'): the two letter country code used to retrieve the applications.
  fullDetail (optional, defaults to false): if true, an extra request will be made for every resulting app to fetch its full detail.
  price (optional, defaults to all): allows to control if the results apps are free, paid or both.
  all: Free and paid
  free: Free apps only
  paid: Paid apps only
  */

  async get_search(term, num = 1, lang = 'en', country = 'us', fullDetail = false, price = 'all') {
    const global_params = this.global_params
    const params = {
      'term': term,
      'num': num,
      'lang': lang,
      'country': country,
      'fullDetail': fullDetail,
      ...global_params
    }

    let data = [{
      'params': {
        'method': 'get_search',
        ...params,
      },
    }];

    await gplay.search(params)
      .then(result => {
        data.push(...result)
      })
      .catch(err => {
        console.log("error", err)
      });

    return data;
  }


  // Method: Create data files. Existing file data will be over-written.
  create_data_files = () => {
    const file_prefix = 'google_'
    const num = 100
    const page_count = 10

    // Get App Details
    const app_name = 'com.google.android.apps.translate'
    // var result = this.get_app_details('com.google.android.apps.translate', lang = 'en', country = 'us');
    var result = this.get_app_details(app_name, 'en', 'us');
    this.fh.save_to_file_async(result, `${file_prefix}_app_detail_${app_name}.json`)

    // Get top free games 
    // get_list(num = 50, collection = gplay.collection.TOP_FREE, catagory = gplay.category.GAME, age = null, fullDetail = false)
    var result = this.get_list(num, gplay.collection.TOP_FREE, gplay.category.GAME, null, false)
    this.fh.save_to_file_async(result, `${file_prefix}_listdata.json`)

    // Get top free games with details for each
    // get_list(num = 50, collection = gplay.collection.TOP_FREE, catagory = gplay.category.GAME, age = null, fullDetail = true)
    var result = this.get_list(num, gplay.collection.TOP_FREE, gplay.category.GAME, null, true)
    this.fh.save_to_file_async(result, `${file_prefix}_listdata_with_details.json`)

    // Get all apps matching the search term 'covid19'
    // get_search(term = 'covid19', num = 100, fullDetail = false)
    const search_term = 'covid19'
    var result = this.get_search(search_term, num, false)
    this.fh.save_to_file_async(result, `${file_prefix}_${search_term}_search.json`)

    // Get all apps with full details matching the search term 'covid19'
    // get_search(term = 'covid19', num = 100, fullDetail = true)
    var result = this.get_search(search_term, num, true)
    this.fh.save_to_file_async(result, `${file_prefix}_${search_term}_search_with_full_detail.json`)

  }
}

/************************************************************ */
function main() {
  const file_helper = new FileHelper(config)

  let apple_store = new Fas_apple_appstore_scraper(config, file_helper);
  apple_store.create_data_files();

  let google_store = new Fas_google_playstore_scraper(config, file_helper);
  google_store.create_data_files();

}

main();