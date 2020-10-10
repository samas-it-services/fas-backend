set Environment=local
set eventFile_GPlayAppSearcherFunction=./functions/GPlayAppSearcher/event.json
set eventFile_SaveToDynamoDbFunction=./data/result1.json
set DBTableName=FASGoogleSearchResult
set InputBucketName=data.freeappshowroom.com
set S3RootFolder=raw/gplay/search
set DockerNetwork=FAS_data_harvester_local_gplay_apps
set DynamoDbEndPointURL=http://dynamodb:8000/
set endpoint_url=http://localhost:8000/
set Debug=1

@REM # Before: Make sure to run this once to setup docker container and dynamodb
@REM # ./setup.sh

@REM # ---------- no changes beyond this point ----------

echo Validating SAM template
sam validate -t template.yaml

echo Building CloudFormation stack for GPlayAppSearcherFunction
sam build GPlayAppSearcherFunction

echo Executing GPlayAppSearcherFunction
sam local invoke GPlayAppSearcherFunction --parameter-overrides \
ParameterKey=Environment,ParameterValue=%Environment% \
ParameterKey=InputBucketName,ParameterValue=%InputBucketName% \
ParameterKey=S3RootFolder,ParameterValue=%S3RootFolder% \
ParameterKey=Debug,ParameterValue=%Debug% \
--env-vars env.json -e %eventFile_GPlayAppSearcherFunction% \
> %eventFile_SaveToDynamoDbFunction%

echo Building CloudFormation stack for SaveToDynamoDbFunction
sam build SaveToDynamoDbFunction

echo Executing SaveToDynamoDbFunction
sam local invoke SaveToDynamoDbFunction --parameter-overrides \
ParameterKey=Environment,ParameterValue=%Environment% \
ParameterKey=InputBucketName,ParameterValue=%InputBucketName% \
ParameterKey=DBTableName,ParameterValue=%DBTableName% \
ParameterKey=Debug,ParameterValue=%Debug% \
ParameterKey=DynamoDbEndPointURL,ParameterValue=%DynamoDbEndPointURL% \
--docker-network %DockerNetwork% \
--env-vars env.json \
-e %eventFile_SaveToDynamoDbFunction% \
> ./data/result2.json

aws dynamodb scan --table-name %DBTableName% --select COUNT --endpoint-url %endpoint_url%

@REM # echo Deploying the stack
@REM # sam deploy
