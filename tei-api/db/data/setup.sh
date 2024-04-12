sudo docker exec -it kafka kafka-topics --create --topic tei_topic --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1

sudo docker exec -it ksqldb-cli ksql http://ksqldb-server:8088 
CREATE STREAM collection_stream (
    event VARCHAR,
    title VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='collections-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM tei_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    tei VARCHAR
) WITH (
    KAFKA_TOPIC='tei-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM json_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='json-topic',
    VALUE_FORMAT='JSON'
);





