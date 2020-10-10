import os
import json 
from datetime import datetime
import botocore
import boto3
 
def _get_env_params():
    env = os.environ['Environment']
    endpoint_url = os.environ['DynamoDbEndPointURL']
    bucket_name = os.environ['InputBucketName']
    table_name = os.environ["DDBtable"]
    debug = os.environ['Debug']
    return env, endpoint_url, bucket_name, table_name, debug

def _get_input_params(event):
    query = event["body"]["query"] 
    category = event["body"]["category"] 
    file_path = event["body"]["file_path"] 
    result_count = event["body"]["result_count"] if event["body"] else 0

    return query, category, file_path, result_count

def _get_dynamoDb_connection(env, endpoint_url):
    ddbclient=''
    if env == 'local':
        ddbclient = boto3.resource('dynamodb', endpoint_url=endpoint_url)
    else:
        ddbclient = boto3.resource('dynamodb')

    return ddbclient
    
def _parse_gplay_search_result(item, extra_data):
    for elem in item:
        if (type(item[elem]) == float):
            item[elem] = str(item[elem])

    result = {
        'Id':                item["appId"],
        'row_created_at':     str(datetime.now().isoformat()),
    }
    del item['appId'] 
    return {**result, **item, **extra_data}

def _get_s3_file_content_as_json(bucket_name, file_path):
    s3 = boto3.client('s3')
    fileObj = s3.get_object(Bucket=bucket_name, Key=file_path)
    file_content = fileObj["Body"].read().decode("utf-8")
    return json.loads(file_content)

def lambda_handler(event, context):
    env, endpoint_url, bucket_name, table_name, debug  = _get_env_params()
    query, category, file_path, result_count = _get_input_params(event)

    if debug=="1": 
        print("Event: ", event)

    try:    
        ddbclient = _get_dynamoDb_connection(env, endpoint_url)
        dynamoTable = ddbclient.Table(table_name)
        print("dynamoTable created on:", dynamoTable.creation_date_time)

        if result_count:
            extra_data = {"category": category, "file_path": file_path}
            json_data = _get_s3_file_content_as_json(bucket_name, file_path)
            with dynamoTable.batch_writer() as batch:
                for item in json_data['data']:
                    data = _parse_gplay_search_result(item, extra_data)
                    batch.put_item(data)

        return result_count

    except botocore.exceptions.ClientError as err:
        if err.response['Error']['Code'] == 'InternalError': # Generic error
            print('Error Message: {}'.format(err.response['Error']['Message']))
            print('Request ID: {}'.format(err.response['ResponseMetadata']['RequestId']))
            print('Http code: {}'.format(err.response['ResponseMetadata']['HTTPStatusCode']))
        else:
            raise err

    except Exception as e:
        print("saveToDynamoDb: Unexpected error: ", str(e))
        print("saveToDynamoDb: env: endpoint_url: ", str(endpoint_url))
        print("saveToDynamoDb: param: file_path: ", str(file_path))
        print("saveToDynamoDb: param: query: ", str(query))
        raise e
