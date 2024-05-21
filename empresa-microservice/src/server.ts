import express, { Express } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Importando o controller de funcionários
import * as empresaController from '/workspaces/TESTE/empresa-microservice/src/controllers/empresaController';

// Configuração inicial
dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear o corpo das requisições em JSON
app.use(bodyParser.json());

// Rotas para os funcionários
app.post('/api/empresa', empresaController.createEmpresa);
app.get('/api/empresa', empresaController.getEmpresas);
app.get('/api/empresa/:id',empresaController.getEmpresaById);
app.put('/api/empresa/:id', empresaController.updateEmpresa);
app.delete('/api/empresa/:id', empresaController.deleteEmpresa);

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});