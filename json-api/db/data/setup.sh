sudo docker exec -it ksqldb-cli ksql http://ksqldb-server:8088 
CREATE STREAM json_stream (
    event VARCHAR,
    title VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='json-topic',
    VALUE_FORMAT='JSON'
);

