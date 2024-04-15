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

CREATE STREAM tei_template_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    tei_template VARCHAR
) WITH (
    KAFKA_TOPIC='tei-template-topic',
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

CREATE STREAM mapping_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='mapping-topic',
    VALUE_FORMAT='JSON'
);
