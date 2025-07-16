const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Certifique-se de ter instalado: npm install bcryptjs

const UserSchema = new mongoose.Schema({
    nomeCompleto: { type: String, required: true, trim: true },
    dataNascimento: { type: Date, required: true },
    cpf: { type: String, required: true, unique: true, trim: true }, // CPF deve ser único
    sexo: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    cep: { type: String, required: true, trim: true },
    rua: { type: String, required: true, trim: true },
    numero: { type: String, required: true, trim: true },
    cidade: { type: String, required: true, trim: true },
    estado: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true }, // Nome de usuário deve ser único
    password: { type: String, required: true },
    trilhaAprendizagem: { type: String, required: true, trim: true },
    termosAceitos: { type: Boolean, required: true },
    documentoIdentidadePath: { type: String, required: true }, // Caminho do arquivo
    comprovanteResidenciaPath: { type: String, required: true }, // Caminho do arquivo
    createdAt: { type: Date, default: Date.now }
});

// Middleware para hash da senha antes de salvar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar a senha fornecida com a senha hashed
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);