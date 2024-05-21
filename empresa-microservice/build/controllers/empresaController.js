"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmpresa = exports.updateEmpresa = exports.getEmpresaById = exports.getEmpresas = exports.createEmpresa = void 0;
const postgresConfig_1 = require("../config/postgresConfig");
const kafkaConfig_1 = require("../config/kafkaConfig");
// Kafka Producer para enviar mensagens
const producer = kafkaConfig_1.kafka.producer();
const initKafkaProducer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.connect();
});
initKafkaProducer();
const createEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, cnpj, address, phone, email } = req.body;
    const query = 'INSERT INTO empresas (name, cnpj, address, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [name, cnpj, address, phone, email];
    try {
        yield producer.send({
            topic: 'empresa-microservice',
            messages: [{ value: JSON.stringify({ operation: 'create', data: values }) }],
        });
        const result = yield postgresConfig_1.pool.query(query, values);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
});
exports.createEmpresa = createEmpresa;
const getEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield postgresConfig_1.pool.query('SELECT * FROM empresas');
        res.status(200).json(result.rows);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
});
exports.getEmpresas = getEmpresas;
const getEmpresaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const result = yield postgresConfig_1.pool.query('SELECT * FROM empresas WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
});
exports.getEmpresaById = getEmpresaById;
const updateEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { name, cnpj, address, phone, email } = req.body;
    const query = 'UPDATE empresas SET name = $1, cnpj = $2, address = $3, phone = $4, email = $5 WHERE id = $6 RETURNING *';
    const values = [name, cnpj, address, phone, email, id];
    try {
        yield producer.send({
            topic: 'empresa-microservice',
            messages: [{ value: JSON.stringify({ operation: 'update', data: values }) }],
        });
        const result = yield postgresConfig_1.pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
});
exports.updateEmpresa = updateEmpresa;
const deleteEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const query = 'DELETE FROM empresas WHERE id = $1 RETURNING *';
    try {
        yield producer.send({
            topic: 'empresa-microservice',
            messages: [{ value: JSON.stringify({ operation: 'delete', data: { id } }) }],
        });
        const result = yield postgresConfig_1.pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
});
exports.deleteEmpresa = deleteEmpresa;
