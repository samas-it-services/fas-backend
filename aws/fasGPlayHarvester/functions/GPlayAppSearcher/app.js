const AWS = require('aws-sdk');
// const fas_app_scraper = require('fas_app_scraper');
// const gplay = fas_app_scraper.gplay
const gplay = require('./fas_google_playstore_scraper_wrapper.js');
const s3 = new AWS.S3();

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

const uploadFile = async (s3, bucket_name, file_path, fileContent) => {

    // Setting up S3 upload parameters
    const params = {
        Bucket: bucket_name,
        Key: file_path,
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        return data.Location
    });

};

const getEnvParams = () => {
    // const accessKeyId = process.env.accessKeyId
    // const secretAccessKey = process.env.secretAccessKey
    const bucket_name = process.env.InputBucketName
    const root_folder = process.env.S3RootFolder
    const debug = process.env.Debug

    return {
        bucket_name,
        root_folder,
        debug
    }
}

const getInputParams = (event) => {
    const default_query = "candy crush"
    const query = event["query"] || default_query
    const category = event["category"] || "default"
    const count = event["count"] || "10"
    const since_id = event["since_id"] || ""

    return {
        query,
        category,
        count,
        since_id
    }
}

/**
 * Sample Lambda function which mocks the operation of selling a random number of shares for a stock.
 * For demonstration purposes, this Lambda function does not actually perform any  actual transactions. It simply returns a mocked result.
 * 
 * @param {Object} event - Input event to the Lambda function
 * @param {Object} context - Lambda Context runtime methods and attributes
 *
 * @returns {Object} object - Object containing details of the stock selling transaction
 * 
 */
exports.lambdaHandler = async (event, context, callback) => {
    let {
        bucket_name,
        root_folder,
        debug
    } = getEnvParams()
    let {
        query,
        category,
        count,
        since_id
    } = getInputParams(event)
    if (debug) {
        console.log("env: bucket_name: ", bucket_name)
        console.log("env: root_folder: ", root_folder)
        console.log("event: query: ", query)
        console.log("event: category: ", category)
        console.log("event: count: ", count)
    }

    const input_params = {
        "params": {
            "category": category,
            "since_id": since_id
        }
    }

    let google_store = new gplay.FAS_Google_PlayStore_Scraper_Wrapper(input_params);
    var result = await google_store.get_search(query, count, fullDetail = true)
    const jsonFilename = new Date().getTime() + '.json';
    let data = JSON.stringify(result)
    s3_file_path = uploadFile(s3, bucket_name, jsonFilename, data)

    let response = {
        'statusCode': 200,
        'body': {
            "category": category,
            "query": query,
            "since_id": since_id,
            "requested_count": count,
            "result_count": result.length,
            "file_path": jsonFilename
        }
    }

    return callback(null, response);
    // return response

};