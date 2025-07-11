// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Certifique-se de que bcryptjs está instalado

const userSchema = new mongoose.Schema({
    nomeCompleto: { type: String, required: true },
    dataNascimento: { type: Date, required: true },
    cpf: { type: String, required: true, unique: true },
    sexo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefone: { type: String, required: true },
    //documentoIdentidadePath: { type: String }, // Descomente se for gerenciar uploads
    //comprovanteResidenciaPath: { type: String }, // Descomente se for gerenciar uploads
    cep: { type: String, required: true },
    rua: { type: String, required: true },
    numero: { type: Number, required: true },
    cidade: { type: String, required: true },
    estado: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    trilhaAprendizagem: { type: String, required: true },
    termosAceitos: { type: Boolean, required: true }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Middleware para hash de senha antes de salvar
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Método para comparar senhas
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; // <-- ISSO É CRÍTICO: Exportar o modelo Mongoose