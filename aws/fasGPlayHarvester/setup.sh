#!/bin/bash
project=freeappshowroom
DBTableName=FASGoogleSearchResult
DockerNetwork=FAS_data_harvester_local_gplay_apps
DockerDynamoDbContainer=dynamodb
delete_everything=1
endpoint_url=http://localhost:8000

if [ $delete_everything -eq "1" ] && docker network ls --format '{{.Name}}' | grep -w $DockerNetwork &> /dev/null; then
    echo Stopping and removing [$DockerDynamoDbContainer] container
    docker rm -f $DockerDynamoDbContainer &> /dev/null;

    echo deleting bridge network [$DockerNetwork] for the [$DockerDynamoDbContainer] container
    docker network rm $DockerNetwork &> /dev/null;

fi

# if [ $delete_everything -eq "1" ] && aws dynamodb list-tables --endpoint-url $endpoint_url | grep -w $DBTableName &> /dev/null; then
#     echo deleting dynamodb table $DBTableName at endpoint-url $endpoint_url
#     aws dynamodb delete-table --table-name $DBTableName --endpoint-url $endpoint_url &> /dev/null;
# fi

if ! docker network ls --format '{{.Name}}' | grep -w $DockerNetwork &> /dev/null; then
    echo Creating bridge network [$DockerNetwork] for the [$DockerDynamoDbContainer] container
    docker network create $DockerNetwork
fi

if ! docker ps --format '{{.Names}}' | grep -w dynamodb &> /dev/null; then
    echo launching local DynamoDB instance
    docker run --network $DockerNetwork --name $DockerDynamoDbContainer -d -p 8000:8000 amazon/dynamodb-local
fi

if ! aws dynamodb list-tables --endpoint-url $endpoint_url | grep -w $DBTableName &> /dev/null; then
    echo creating dynamodb table $DBTableName at endpoint-url $endpoint_url

    aws dynamodb create-table \
    --table-name $DBTableName \
    --attribute-definitions AttributeName=Id,AttributeType=S AttributeName=row_created_at,AttributeType=S \
    --key-schema AttributeName=Id,KeyType=HASH AttributeName=row_created_at,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --endpoint-url $endpoint_url \
    --tags Key=project,Value=$project \
     &> /dev/null;
fi

if aws dynamodb list-tables --endpoint-url $endpoint_url | grep -w $DBTableName &> /dev/null; then
    echo dynamodb table $DBTableName is available at endpoint-url $endpoint_url
else    
    echo Warning: Could not find dynamodb table $DBTableName at endpoint-url $endpoint_url
fi
