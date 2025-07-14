// server.js

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // Importar bcryptjs
const User = require('./models/User'); // Importar o modelo de usuário

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear o corpo das requisições JSON
// Isso é essencial para que você consiga acessar os dados do formulário via req.body
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB Atlas!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Servir arquivos estáticos (seu frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rota inicial - continua servindo Home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

// =========================================================
// ROTA DE REGISTRO DE USUÁRIO (POST /register)
// =========================================================
app.post('/register', async (req, res) => {
    try {
        // 1. Obter os dados do corpo da requisição
        const {
            nomeCompleto,
            dataNascimento,
            cpf,
            sexo,
            email,
            telefone,
            cep,
            // documentoIdentidadePath, // Não estamos lidando com upload de arquivos diretamente via JSON para esses campos por enquanto.
            // comprovanteResidenciaPath,
            rua,
            numero,
            cidade,
            estado,
            username,
            password, // Senha em texto puro, que será criptografada
            trilhaAprendizagem,
            termosAceitos
        } = req.body;

        // Validação básica do backend
        if (!nomeCompleto || !email || !username || !password || !termosAceitos || !trilhaAprendizagem || !cpf || !dataNascimento || !sexo || !telefone || !cep || !rua || !numero || !cidade || !estado) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        // 2. Verificar se o usuário (username ou email/cpf) já existe
        const existingUser = await User.findOne({ $or: [{ username }, { email }, { cpf }] });
        if (existingUser) {
            let message = 'Usuário já existe.';
            if (existingUser.username === username) message = 'Nome de usuário já está em uso.';
            else if (existingUser.email === email) message = 'Email já está em uso.';
            else if (existingUser.cpf === cpf) message = 'CPF já está em uso.';
            return res.status(409).json({ message: message }); // 409 Conflict
        }

        // Se você estivesse usando o middleware 'pre save' no modelo User.js para hash da senha
        // você não precisaria destas duas linhas aqui.
        // Já verificamos que seu User.js tem o pre save, então essa parte abaixo não seria estritamente necessária aqui,
        // mas não há problema em tê-la se quiser garantir o hash aqui também (redundância).
        // No entanto, para evitar hashing duplo ou inconsistência, o ideal é confiar no middleware.
        // Removi o hash aqui para confiar no modelo.

        // 3. Criar uma nova instância do usuário com os dados
        // A senha será hashed automaticamente pelo middleware 'pre('save')' no models/User.js
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
            password, // A senha será hashed pelo middleware no User.js antes de ser salva
            trilhaAprendizagem,
            termosAceitos
        });

        // 4. Salvar o novo usuário no banco de dados
        await newUser.save();

        // 5. Enviar uma resposta de sucesso para o frontend
        res.status(201).json({ message: 'Usuário registrado com sucesso!' }); // 201 Created

    } catch (error) {
        console.error('Erro no registro de usuário:', error);
        // Verificar se é um erro de validação do Mongoose (ex: campo 'required' faltando)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
    }
});

// =========================================================
// NOVA ROTA: Rota de Login de Usuário (POST /login)
// ADICIONE ESTE BLOCO LOGO ABAIXO DA ROTA /register
// =========================================================
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Encontrar o usuário pelo username
        const user = await User.findOne({ username });

        // 2. Verificar se o usuário existe
        if (!user) {
            // Não dê detalhes sobre se o usuário não existe ou a senha está errada para segurança
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }

        // 3. Comparar a senha fornecida com a senha hash armazenada
        // O método matchPassword é definido no seu models/User.js
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
            // Aqui, em um sistema real, você geraria e enviaria um token JWT
        });

    } catch (error) {
        console.error('Erro no login de usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    }
});
// =========================================================
// FIM DA NOVA ROTA DE LOGIN
// =========================================================


// Rota para servir a página de login.html (opcional, se você quiser acessá-la diretamente)
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// Rota para uma página pós-login (exemplo)
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html')); // Você precisará criar este arquivo
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});