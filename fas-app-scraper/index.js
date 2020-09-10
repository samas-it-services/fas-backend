/*
Module created to consume data from Apple and Google Play stores. Saves results to a file inside data folder. 
*/
const config = require('./config.json')
const fh = require('./file_helper.js');
const store = require('./fas_apple_appstore_scraper_wrapper.js');
const gplay = require('./fas_google_playstore_scraper_wrapper.js');

// Method: Create data files. Existing file data will be over-written.
create_data_files_from_apple_app_store = (config, file_helper) => {
  let apple_store = new store.FAS_Apple_Appstore_Scraper_Wrapper(config);
  let fh = file_helper

  const file_prefix = 'apple_'
  const num = 100
  const page_count = 10

  // Get App Details
  const app_id = 553834731 // 'com.midasplayer.apps.candycrushsaga'
  const app_name = 'com.midasplayer.apps.candycrushsaga'
  var result = apple_store.get_app_details(app_id, app_name, 'en', 'us', true);
  fh.save_to_file_async(result, `${file_prefix}_app_detail_${app_name}.json`)

  // // // Get_top_free_action games for iPAD
  // get_list(50, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES_ACTION, age = null, fullDetail = false)
  var result = apple_store.get_list(num, store.collection.TOP_FREE_IPAD, store.category.GAMES_ACTION, null, false)
  fh.save_to_file_async(result, `${file_prefix}_listdata.json`)

  // // // Get_top_free_action games for iPAD with details for each
  //(num = 200, collection = store.collection.TOP_FREE_IPAD, catagory = store.category.GAMES, age = null, fullDetail = true)
  var result = apple_store.get_list(num, store.collection.TOP_FREE_IPAD, store.category.GAMES, null, true)
  fh.save_to_file_async(result, `${file_prefix}_listdata_with_details.json`)

  // // Get all apps with full details matching the search term 'covid19'
  // get_search(term = 'covid19', num = 100)
  const search_term = 'covid19'
  var result = apple_store.get_search(search_term, num)
  fh.save_to_file_async(result, `${file_prefix}_${search_term}_search.json`)

  // // Get all apps with Ids only matching the search term 'covid19'
  // get_search(term = 'covid19', num = 250, page = 1, idsOnly = true)
  var result = apple_store.get_search('covid19', num, 1, true)
  fh.save_to_file_async(result, `${file_prefix}_${search_term}_search_ids-only-page-1.json`)

  // // Get all apps with Ids only matching the search term 'covid19'
  // get_search(term = 'covid19', num = 250, page = 2, idsOnly = true)
  var result = apple_store.get_search('covid19', num, 2, true)
  fh.save_to_file_async(result, `${file_prefix}_${search_term}_search_ids-only-page-2.json`)
}

// Method: Create data files from Google Play Store. Existing file data will be over-written.
create_data_files_from_google_store = (config, file_helper) => {
  let google_store = new gplay.FAS_Google_PlayStore_Scraper_Wrapper(config);
  let fh = file_helper

  const file_prefix = 'google_'
  const num = 100
  const page_count = 10

  // Get App Details
  const app_name = 'com.oasissolutions.bahlool.dana.free'
  // var result = this.get_app_details('com.google.android.apps.translate', lang = 'en', country = 'us');
  var result = google_store.get_app_details(app_name, 'en', 'us');
  fh.save_to_file_async(result, `${file_prefix}_app_detail_${app_name}.json`)

  // Get top free games 
  // get_list(num = 50, collection = gplay.collection.TOP_FREE, catagory = gplay.category.GAME, age = null, fullDetail = false)
  var result = google_store.get_list(num, gplay.collection.TOP_FREE, gplay.category.GAME, null, false)
  fh.save_to_file_async(result, `${file_prefix}_listdata.json`)

  // Get top free games with details for each
  // get_list(num = 50, collection = gplay.collection.TOP_FREE, catagory = gplay.category.GAME, age = null, fullDetail = true)
  var result = google_store.get_list(num, gplay.collection.TOP_FREE, gplay.category.GAME, null, true)
  fh.save_to_file_async(result, `${file_prefix}_listdata_with_details.json`)

  // Get all apps matching the search term 'covid19'
  // get_search(term = 'covid19', num = 100, fullDetail = false)
  const search_term = 'covid19'
  var result = google_store.get_search(search_term, num, false)
  fh.save_to_file_async(result, `${file_prefix}_${search_term}_search.json`)

  // Get all apps with full details matching the search term 'covid19'
  // get_search(term = 'covid19', num = 100, fullDetail = true)
  var result = google_store.get_search(search_term, num, true)
  fh.save_to_file_async(result, `${file_prefix}_${search_term}_search_with_full_detail.json`)
}

/************************************************************ */
function main() {
  const file_helper = new fh.FileHelper(config)

  create_data_files_from_apple_app_store(config, file_helper);

  create_data_files_from_google_store(config, file_helper);

}

main();