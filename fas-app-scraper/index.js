/*
Module created to consume data from Apple and Google Play stores. Saves results to a file inside data folder. 
*/
const apple = require('./fas_apple_appstore_scraper_wrapper.js');
const gplay = require('./fas_google_playstore_scraper_wrapper.js');

exports.apple = apple
exports.gplay = gplay
