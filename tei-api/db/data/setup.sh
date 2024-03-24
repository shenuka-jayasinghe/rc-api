sudo docker exec -it kafka kafka-topics --create --topic tei_topic --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1

sudo docker exec -it ksqldb-cli ksql http://ksqldb-server:8088
CREATE STREAM TEI (
    id VARCHAR,
    timestamp BIGINT,
    tei VARCHAR(8192)
) WITH (
    KAFKA_TOPIC='tei_topic',
    VALUE_FORMAT='JSON'
);

INSERT INTO TEI (id, timestamp, tei) VALUES ('randid', 01234554321, '<dfsd>');