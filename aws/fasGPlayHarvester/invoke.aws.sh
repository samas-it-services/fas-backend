#!/bin/bash
Environment=aws
eventFile_GPlayAppSearcherFunction=./functions/GPlayAppSearcher/event.json
eventFile_SaveToDynamoDbFunction=./data/result1.json
DBTableName=FAS-Google
InputBucketName=data.freeappshowroom.com
S3RootFolder=raw/gplay/search
region=us-west-2
Debug=0
# ---------- no changes beyond this point ----------

# echo Validating SAM template
# sam validate -t template.yaml

# echo Building CloudFormation stack
sam build

# If you don’t have Python3.8 installed on your local environment, use below command
# sam build --use-container

echo Executing GPlayAppSearcherFunction
sam local invoke GPlayAppSearcherFunction --parameter-overrides \
ParameterKey=Environment,ParameterValue=$Environment \
ParameterKey=TwitterKey,ParameterValue=$TwitterKey \
ParameterKey=TwitterSecretKey,ParameterValue=$TwitterSecretKey \
ParameterKey=InputBucketName,ParameterValue=$InputBucketName \
ParameterKey=S3RootFolder,ParameterValue=$S3RootFolder \
ParameterKey=Debug,ParameterValue=$Debug \
--skip-pull-image \
--region $region \
--env-vars env.json -e $eventFile_GPlayAppSearcherFunction \
> $eventFile_SaveToDynamoDbFunction

echo Executing SaveToDynamoDbFunction
sam local invoke SaveToDynamoDbFunction --parameter-overrides \
ParameterKey=Environment,ParameterValue=$Environment \
ParameterKey=InputBucketName,ParameterValue=$InputBucketName \
ParameterKey=DBTableName,ParameterValue=$DBTableName \
ParameterKey=Debug,ParameterValue=$Debug \
--skip-pull-image \
--region $region \
--env-vars env.json \
-e $eventFile_SaveToDynamoDbFunction \
> ./data/result2.json

# DBTableName=FAS-Google
aws dynamodb scan --table-name $DBTableName --select COUNT --region $region
