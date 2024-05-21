import { Request, Response } from 'express';
import { pool } from '../config/postgresConfig';
import { kafka } from '../config/kafkaConfig';
import { empresa } from '../models/empresa';

// Kafka Producer para enviar mensagens
const producer = kafka.producer();

const initKafkaProducer = async () => {
  await producer.connect();
};

initKafkaProducer();

export const createEmpresa = async (req: Request, res: Response) => {
  const { name, cnpj, address, phone, email } = req.body;
  const query = 'INSERT INTO empresas (name, cnpj, address, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [name, cnpj, address, phone, email];
  try {
    await producer.send({
      topic: 'empresa-microservice',
      messages: [{ value: JSON.stringify({ operation: 'create', data: values }) }],
    });
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

export const getEmpresas = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM empresas');
    res.status(200).json(result.rows);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

export const getEmpresaById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM empresas WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

export const updateEmpresa = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, cnpj, address, phone, email } = req.body;
  const query = 'UPDATE empresas SET name = $1, cnpj = $2, address = $3, phone = $4, email = $5 WHERE id = $6 RETURNING *';
  const values = [name, cnpj, address, phone, email, id];
  try {
    await producer.send({
        topic: 'empresa-microservice',
      messages: [{ value: JSON.stringify({ operation: 'update', data: values }) }],
    });
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

export const deleteEmpresa = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const query = 'DELETE FROM empresas WHERE id = $1 RETURNING *';
  try {
    await producer.send({
        topic: 'empresa-microservice',
      messages: [{ value: JSON.stringify({ operation: 'delete', data: { id } }) }],
    });
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};
