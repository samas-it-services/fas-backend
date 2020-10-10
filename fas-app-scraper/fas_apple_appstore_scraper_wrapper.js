const store = require('app-store-scraper');
const invariant = require('invariant');

class FAS_Apple_Appstore_Scraper_Wrapper {

    constructor(global_params) {
        this.global_params = global_params
    }

    /*
    Method: get_app_details
    Retrieves the full detail of an application. Options:
  
    id: the iTunes "trackId" of the app, for example 553834731 for Candy Crush Saga. Either this or the appId should be provided.
    appId: the iTunes "bundleId" of the app, for example com.midasplayer.apps.candycrushsaga for Candy Crush Saga. Either this or the id should be provided.
    country: the two letter country code to get the app details from. Defaults to us. Note this also affects the language of the data.
    ratings: load additional ratings information like ratings number and histogram
    */

    async get_app_details(id, appId, lang = 'en', country = 'us', ratings = false) {
        invariant(id || appId, 'Either id or appId is required');

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

    async get_list(num = 1, collection, catagory, country = 'us', fullDetail = false) {
        invariant(collection || catagory, 'Either collection or catagory is required');

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
        invariant(term, 'search term is required');

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
}

module.exports = {
    FAS_Apple_Appstore_Scraper_Wrapper: FAS_Apple_Appstore_Scraper_Wrapper,
    collection: store.collection,
    category: store.category
}