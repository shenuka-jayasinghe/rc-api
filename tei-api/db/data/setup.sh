sudo docker exec -it kafka kafka-topics --create --topic tei_topic --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1

sudo docker exec -it ksqldb-cli ksql http://ksqldb-server:8088 
CREATE STREAM tei_stream (
    event VARCHAR,
    title VARCHAR,
    timestamp BIGINT,
    tei VARCHAR
) WITH (
    KAFKA_TOPIC='new-topic',
    VALUE_FORMAT='JSON'
);

INSERT INTO tei_stream (event, title, timestamp, tei)
VALUES ('default_event', 'Chinese_Crawford_23', 1203981290481, '<some_tei>');
