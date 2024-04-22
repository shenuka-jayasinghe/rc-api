kubectl exec -it ksqldb-cli-847fbfcc9c-khqg9 -- ksql http://ksqldb-server:8088 <<EOF
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

CREATE STREAM narratives_stream (
    event VARCHAR,
    id VARCHAR,
    timestamp BIGINT,
    json VARCHAR
) WITH (
    KAFKA_TOPIC='narratives-topic',
    VALUE_FORMAT='JSON'
);

CREATE STREAM monitor_stream (
    id VARCHAR,
    kafka_topic VARCHAR,
    event VARCHAR,
    timestamp BIGINT,
    partition VARCHAR
) WITH (
    KAFKA_TOPIC='monitor-topic',
    VALUE_FORMAT='JSON'
);
EOF
