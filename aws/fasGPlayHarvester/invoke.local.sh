#!/bin/bash
Environment=local
eventFile_GPlayAppSearcherFunction=./functions/GPlayAppSearcher/event.json
eventFile_SaveToDynamoDbFunction=./data/result1.json
DBTableName=FASGoogleSearchResult
InputBucketName=data.freeappshowroom.com
S3RootFolder=raw/gplay/search
DockerNetwork=FAS_data_harvester_local_gplay_apps
DynamoDbEndPointURL=http://dynamodb:8000/
endpoint_url=http://localhost:8000/
Debug=1

# Before: Make sure to run this once to setup docker container and dynamodb
# ./setup.sh

# ---------- no changes beyond this point ----------

echo Validating SAM template
sam validate -t template.yaml

echo Building CloudFormation stack for GPlayAppSearcherFunction
sam build GPlayAppSearcherFunction

echo Executing GPlayAppSearcherFunction
sam local invoke GPlayAppSearcherFunction --parameter-overrides \
ParameterKey=Environment,ParameterValue=$Environment \
ParameterKey=TwitterKey,ParameterValue=$TwitterKey \
ParameterKey=TwitterSecretKey,ParameterValue=$TwitterSecretKey \
ParameterKey=InputBucketName,ParameterValue=$InputBucketName \
ParameterKey=S3RootFolder,ParameterValue=$S3RootFolder \
ParameterKey=Debug,ParameterValue=$Debug \
--env-vars env.json -e $eventFile_GPlayAppSearcherFunction \
> $eventFile_SaveToDynamoDbFunction

echo Building CloudFormation stack for SaveToDynamoDbFunction
sam build SaveToDynamoDbFunction

echo Executing SaveToDynamoDbFunction
sam local invoke SaveToDynamoDbFunction --parameter-overrides \
ParameterKey=Environment,ParameterValue=$Environment \
ParameterKey=InputBucketName,ParameterValue=$InputBucketName \
ParameterKey=DBTableName,ParameterValue=$DBTableName \
ParameterKey=Debug,ParameterValue=$Debug \
ParameterKey=DynamoDbEndPointURL,ParameterValue=$DynamoDbEndPointURL \
--docker-network $DockerNetwork \
--env-vars env.json \
-e $eventFile_SaveToDynamoDbFunction \
> ./data/result2.json

aws dynamodb scan --table-name $DBTableName --select COUNT --endpoint-url $endpoint_url

# echo Deploying the stack
# sam deploy
