FROM docker:dind as build
COPY . .

# Install dependencies
RUN apk add --no-cache nodejs npm && \
    npm install

# Expose the port the app runs on
EXPOSE 3001
EXPOSE 9092

# docker run exec -it --rm shenukacj/cudl-xslt:0.0.5
# node app.js