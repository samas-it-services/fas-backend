var store = require('app-store-scraper');
/*
Module created to consume methods from app-store-scraper module. Throttling and output json result to data is enabled
https://github.com/facundoolano/app-store-scraper
*/

const util = require('util');
const fs = require('fs');

const DEBUG = 0
const PRETIFY_JSON = true
const THROTTLE = 8

/* No changes below this point */

var myArgs = process.argv.slice(2);
var result = {}
const global_params = {
  
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
Retrieves the full detail of an application. Options:

id: the iTunes "trackId" of the app, for example 553834731 for Candy Crush Saga. Either this or the appId should be provided.
appId: the iTunes "bundleId" of the app, for example com.midasplayer.apps.candycrushsaga for Candy Crush Saga. Either this or the id should be provided.
country: the two letter country code to get the app details from. Defaults to us. Note this also affects the language of the data.
ratings: load additional ratings information like ratings number and histogram
*/

async function get_app_details(id = '553834731 ', appId = 'com.midasplayer.apps.candycrushsaga', lang = 'en', country = 'us', ratings = false) {
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

async function get_list(num = 1, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES_ACTION, country = 'us', fullDetail = false) {
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

async function get_search(term, num = 1, page = 1, lang = 'en', country = 'us', idsOnly = true) {
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

// Get App Details
// Alternate usage: node app.js apple_app_detail_com.midasplayer.apps.candycrushsaga.json
var result = get_app_details(id=553834731, appId = 'com.midasplayer.apps.candycrushsaga', lang = 'en', country = 'us', ratings = true);
save_result(result, 'apple_app_detail_com.midasplayer.apps.candycrushsaga.json')

// // Get_top_free_action games for iPAD
var result = get_list(num = 50, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES_ACTION, age = null, fullDetail = false)
save_result(result, 'apple_top_free_action_games.json')

// // Get_top_free_action games for iPAD with details for each
var result = get_list(num = 200, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES, age = null, fullDetail = true)
save_result(result, 'apple_top_free_games_with_details.json')

// Get all apps with full details matching the search term 'covid19'
var result = get_search(term = 'covid19', num = 100)
save_result(result, 'apple_covid19_search.json')

// Get all apps with Ids only matching the search term 'covid19'
var result = get_search(term = 'covid19', num = 250, page = 1, idsOnly = true)
save_result(result, 'apple_covid19_search_ids-only-page-1.json')

var result = get_search(term = 'covid19', num = 250, page = 2, idsOnly = true)
save_result(result, 'apple_covid19_search_ids-only-page-2.json')
