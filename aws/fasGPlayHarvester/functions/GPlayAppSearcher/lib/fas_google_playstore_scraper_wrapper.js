const gplay = require('google-play-scraper');
const invariant = require('invariant');

class FAS_Google_PlayStore_Scraper_Wrapper {

    constructor(global_params) {
        this.global_params = global_params
    }

    /*
    Method: get_app_details
    Retrieves the full detail of an application. 
  
    Params:
    appId: the Google Play id of the application (the ?id= parameter on the url).
    lang (optional, defaults to 'en'): the two letter language code in which to fetch the app page.
    country (optional, defaults to 'us'): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.
    */

    async get_app_details(appId, lang = 'en', country = 'us') {
        invariant(appId, 'appId is required');

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

    async get_list(num = 1, collection, catagory, age = null, fullDetail = false) {
        invariant(collection || catagory, 'Either collection or catagory is required');

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
        invariant(term, 'Search term is required');

        const global_params = this.global_params
        const params = {
            'method': 'get_search',
            'term': term,
            'num': num,
            'lang': lang,
            'country': country,
            'fullDetail': fullDetail,
            ...global_params
        }

        let data = [];

        await gplay.search(params)
            .then(result => {
                data.push(...result)
            })
            .catch(err => {
                console.log("error", err)
            });

        const result = {
            'params': {...params},
            'data': [...data],
        }
        return result;
    }
}

module.exports = {
    FAS_Google_PlayStore_Scraper_Wrapper: FAS_Google_PlayStore_Scraper_Wrapper,
    collection : gplay.collection,
    category: gplay.category
}