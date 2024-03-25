FROM docker:dind as build
COPY . .

# Install dependencies
RUN apk add --no-cache nodejs npm && \
    npm install

# Expose the port the app runs on
EXPOSE 3001
EXPOSE 9092


# after the container is open run the following:
# sudo docker exec -it tei2json-api docker run shenukacj/cudl-xslt:0.0.5 && sudo docker exec -it tei2json-api node app.js
