// server.js

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Certifique-se de que este caminho está correto
const multer = require('multer');       // Importar multer
const fs = require('fs');               // Importar fs para criar diretórios
const cors = require('cors');           // Importar cors

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================
// MIDDLEWARES GLOBAIS
// =========================================================

// 1. CORS: Permite que seu frontend (em outra porta ou domínio) se conecte ao backend
app.use(cors());

// 2. Body Parsers para JSON e URL-encoded data
// Estes são para dados que NÃO SÃO multipart/form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================
// CONFIGURAÇÃO DO MULTER PARA UPLOAD DE ARQUIVOS
// =========================================================

// Define onde os arquivos serão armazenados e com que nome
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads'); // Diretório onde os arquivos serão salvos
        // Cria o diretório 'uploads' se ele não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Define o nome do arquivo, ex: 'documentoIdentidade-1707202512345.pdf'
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Cria a instância do multer com a configuração de armazenamento
const upload = multer({ storage: storage });

// =========================================================
// CONEXÃO COM O BANCO DE DADOS
// =========================================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB Atlas!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// =========================================================
// SERVIÇO DE ARQUIVOS ESTÁTICOS
// =========================================================

// Servir arquivos estáticos do frontend (Home.html, Home.js, etc.)
app.use(express.static(path.join(__dirname, 'public')));
// Servir os arquivos carregados pelo Multer (para o frontend poder acessá-los, se necessário)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================================
// ROTAS DA API E DE SERVIÇO DE PÁGINAS
// =========================================================

// Rota inicial - serve Home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROTA DE REGISTRO DE USUÁRIO (POST /register)
// Usa o middleware 'upload.fields' para processar arquivos e campos de texto
app.post('/register', upload.fields([
    { name: 'documentoIdentidadeFile', maxCount: 1 },    // Nome do campo no FormData do frontend
    { name: 'comprovanteResidenciaFile', maxCount: 1 } // Nome do campo no FormData do frontend
]), async (req, res) => {
    try {
        // req.body agora conterá os campos de texto do formulário
        const {
            nomeCompleto,
            dataNascimento,
            cpf,
            sexo,
            email,
            telefone,
            cep,
            rua,
            numero,
            cidade,
            estado,
            username,
            password,
            trilhaAprendizagem,
            termosAceitos // Virá como string 'true' ou 'false' do FormData
        } = req.body;

        // req.files conterá os arquivos carregados
        const documentoIdentidadeFile = req.files['documentoIdentidadeFile'] ? req.files['documentoIdentidadeFile'][0] : null;
        const comprovanteResidenciaFile = req.files['comprovanteResidenciaFile'] ? req.files['comprovanteResidenciaFile'][0] : null;

        // Validação mais rigorosa para todos os campos obrigatórios
        const requiredFields = [
            nomeCompleto, dataNascimento, cpf, sexo, email, telefone,
            cep, rua, numero, cidade, estado, username, password,
            trilhaAprendizagem
        ];

        // Verifica se algum campo de texto/select está vazio ou undefined
        const isAnyFieldMissing = requiredFields.some(field => {
            // Para strings, verifica se é vazia ou apenas espaços em branco
            if (typeof field === 'string') return field.trim() === '';
            // Para outros tipos (como booleans se termosAceitos fosse tratado aqui diretamente), apenas verifica se é null/undefined
            return field === undefined || field === null;
        });

        if (isAnyFieldMissing) {
            console.log("Campos de texto/select faltando:", {
                nomeCompleto, dataNascimento, cpf, sexo, email, telefone,
                cep, rua, numero, cidade, estado, username, password,
                trilhaAprendizagem
            });
            return res.status(400).json({ message: 'Todos os campos de texto e seleção são obrigatórios.' });
        }

        // Validação específica para arquivos
        if (!documentoIdentidadeFile) {
            return res.status(400).json({ message: 'O documento de identidade é obrigatório.' });
        }
        if (!comprovanteResidenciaFile) {
            return res.status(400).json({ message: 'O comprovante de residência é obrigatório.' });
        }

        // Validação dos termos aceitos (converte de string para booleano)
        if (termosAceitos !== 'true') {
            return res.status(400).json({ message: 'Você deve aceitar os termos e condições.' });
        }

        // 2. Verificar se o usuário (username ou email/cpf) já existe
        const existingUser = await User.findOne({ $or: [{ username }, { email }, { cpf }] });
        if (existingUser) {
            let message = 'Usuário já existe.';
            if (existingUser.username === username) message = 'Nome de usuário já está em uso.';
            else if (existingUser.email === email) message = 'Email já está em uso.';
            else if (existingUser.cpf === cpf) message = 'CPF já está em uso.';
            return res.status(409).json({ message: message }); // 409 Conflict (Conflito)
        }

        // 3. Criar uma nova instância do usuário com os dados
        // Incluir os caminhos dos arquivos salvos pelo Multer
        const newUser = new User({
            nomeCompleto,
            dataNascimento,
            cpf,
            sexo,
            email,
            telefone,
            cep,
            rua,
            numero,
            cidade,
            estado,
            username,
            password, // A senha será hashed pelo middleware 'pre('save')' no models/User.js
            trilhaAprendizagem,
            termosAceitos: termosAceitos === 'true', // Converte a string 'true'/'false' para booleano
            documentoIdentidadePath: documentoIdentidadeFile ? `/uploads/${documentoIdentidadeFile.filename}` : null,
            comprovanteResidenciaPath: comprovanteResidenciaFile ? `/uploads/${comprovanteResidenciaFile.filename}` : null
        });

        // 4. Salvar o novo usuário no banco de dados
        await newUser.save();

        // 5. Enviar uma resposta de sucesso para o frontend
        res.status(201).json({ message: 'Usuário registrado com sucesso!' }); // 201 Created (Criado)

    } catch (error) {
        console.error('Erro no registro de usuário:', error);
        // Verificar se é um erro de validação do Mongoose (ex: campo 'required' faltando ou tipo incorreto)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Erro de validação: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
    }
});

// Rota de Login de Usuário (POST /login)
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Encontrar o usuário pelo username
        const user = await User.findOne({ username });

        // 2. Verificar se o usuário existe
        if (!user) {
            // Para segurança, não dê detalhes sobre se o usuário não existe ou a senha está errada
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }

        // 3. Comparar a senha fornecida com a senha hash armazenada
        // O método matchPassword é definido no seu models/User.js (espera-se que sim)
        const isMatch = await user.matchPassword(password);

        // 4. Verificar se as senhas coincidem
        if (!isMatch) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }

        // 5. Se tudo estiver correto, login bem-sucedido
        res.status(200).json({
            message: 'Login bem-sucedido!',
            username: user.username,
            email: user.email // Você pode retornar alguns dados do usuário (exceto a senha)
            // Em um sistema real, aqui você geraria e enviaria um token JWT para o cliente
        });

    } catch (error) {
        console.error('Erro no login de usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    }
});

// Rotas para servir outras páginas HTML
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});


// =========================================================
// INICIAR O SERVIDOR
// =========================================================
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});