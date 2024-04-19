// sudo docker build -t shenukacj/mdc-dos:0.0.3 . && sudo docker push shenukacj/mdc-dos:0.0.3
const express = require('express');
const cors = require('cors');
const { runConsumer } = require('./consumer/consumer.js');

const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

//Run Consumer
runConsumer().catch(console.error);
