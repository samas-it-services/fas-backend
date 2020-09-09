/*
Module created to consume methods from google-play-scraper module. Throttling and output json result to data is enabled
https://github.com/facundoolano/google-play-scraper
*/

const gplay = require('google-play-scraper');
const util = require('util');
const fs = require('fs');

const DEBUG = 0
const PRETIFY_JSON = true
const THROTTLE = 8

/* No changes below this point */

var myArgs = process.argv.slice(2);
var result = {}
const global_params = {
  'throttle': THROTTLE,
}
const OUTPUT_FOLDER_PATH = 'data/'
const DEFAULT_OUTPUT_FILE = 'result.json'

function log_to_console(data) {
  if (DEBUG) {
    console.log(data)
  }
}

function log_json_to_file(data, file_path, pretify_json = PRETIFY_JSON) {
  const indentation = pretify_json ? 2 : 0;
  fs.writeFile(file_path, JSON.stringify(data, null, indentation), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log(`File saved at '${file_path}' with [${data.length-1}] items`);
  });
}

function save_result(result, file_name) {
  const file_path = OUTPUT_FOLDER_PATH + (file_name || myArgs[0] || DEFAULT_OUTPUT_FILE)
  /* handle the result */
  if (result && result instanceof Promise) {
    result.then(data => {
      log_json_to_file(data, file_path);
      log_to_console(data);
    });
  } else {
    console.log('no data')
  }
}

/*
Method: get_app_details
Retrieves the full detail of an application. 

Params:
appId: the Google Play id of the application (the ?id= parameter on the url).
lang (optional, defaults to 'en'): the two letter language code in which to fetch the app page.
country (optional, defaults to 'us'): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.
*/

async function get_app_details(appId = 'com.google.android.apps.translate', lang = 'en', country = 'us') {
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

async function get_list(num = 1, collection = gplay.collection.TOP_FREE, catagory = gplay.category.GAME, age = null, fullDetail = false) {
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

async function get_search(term, num = 1, lang = 'en', country = 'us', fullDetail = false, price = 'all') {
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

// Get App Details
// Alternate usage: node app.js google_app_detail_com_google.android.apps.translate.json
var result = get_app_details('com.google.android.apps.translate', lang = 'en', country = 'us');
save_result(result, 'google_app_detail_com_google.android.apps.translate.json')

// Get_top_free_games
var result = get_list(num = 50, collection = gplay.collection.TOP_FREE, catagory = gplay.category.GAME, age = null, fullDetail = false)
save_result(result, 'google_top_free_games.json')

// Get_top_free_games with details for each
var result = get_list(num = 200, collection = gplay.collection.TOP_FREE_GAMES, catagory = gplay.category.GAME_STRATEGY, age = null, fullDetail = true)
save_result(result, 'google_top_free_strategy_games_with_details.json')

// Get all apps with full details matching the search term 'covid19'
var result = get_search(term = 'covid19', num = 100, fullDetail = true)
save_result(result, 'google_covid19_search.json')