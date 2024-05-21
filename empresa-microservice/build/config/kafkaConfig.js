"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafka = void 0;
const kafkajs_1 = require("kafkajs");
const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
exports.kafka = new kafkajs_1.Kafka({
    clientId: 'empresa-microservice',
    brokers,
});
