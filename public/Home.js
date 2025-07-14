document.addEventListener('DOMContentLoaded', () => {
    console.log('Home.js carregado e DOMContentLoaded disparado!');
    const registrationForm = document.getElementById('registrationForm');
    console.log('Formulário encontrado:', registrationForm);

    // --- Funções de máscara e lógica de CEP ---
    function mascara(i) {
        var v = i.value;
        if (isNaN(v[v.length - 1])) { // impede digitar outra coisa a não ser número
            i.value = v.substring(0, v.length - 1);
            return;
        }
        i.setAttribute("maxlength", "14");
        if (v.length == 3 || v.length == 7) i.value += ".";
        if (v.length == 11) i.value += "-";
    }

    function phoneMask(value) {
        if (!value) return ""
        value = value.replace(/\D/g, '')
        value = value.replace(/(\d{2})(\d)/, "($1) $2")
        value = value.replace(/(\d)(\d{4})$/, "$1-$2")
        return value
    }

    function handlePhone(event) {
        let input = event.target
        input.value = phoneMask(input.value)
    }

    async function handleZipCode(event) {
        let input = event.target;
        input.value = zipCodeMask(input.value);

        if (input.value.length === 9) { // CEP completo ex: 12345-678
            const cep = input.value.replace(/\D/g, ''); // Remove a máscara para a requisição
            const mensagemErro = document.getElementById('mensagem-erro');

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (data.erro) {
                    mensagemErro.style.display = 'block';
                    document.getElementById('Rua').value = '';
                    document.getElementById('Cidade').value = '';
                    document.getElementById('Estado').value = '';
                } else {
                    mensagemErro.style.display = 'none';
                    document.getElementById('Rua').value = data.logradouro || '';
                    document.getElementById('Cidade').value = data.localidade || '';
                    document.getElementById('Estado').value = data.uf || '';
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                mensagemErro.textContent = 'Erro ao buscar CEP. Tente novamente.';
                mensagemErro.style.display = 'block';
            }
        } else {
            document.getElementById('mensagem-erro').style.display = 'none';
        }
    }

    function zipCodeMask(value) {
        if (!value) return ""
        value = value.replace(/\D/g, '')
        value = value.replace(/(\d{5})(\d)/, "$1-$2")
        return value
    }

    // --- Lógica de validação e envio do formulário ---

    // Função para mostrar mensagem de erro
    const showError = (fieldId, message) => {
        const errorElement = document.querySelector(`.error-message[data-field="${fieldId}"]`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    };

    // Função para esconder mensagem de erro
    const hideError = (fieldId) => {
        const errorElement = document.querySelector(`.error-message[data-field="${fieldId}"]`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    };

    // Adicionar listeners para esconder erros ao digitar em inputs e selects
    const inputs = registrationForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        const fieldName = input.name;
        if (fieldName) { // Só se o campo tiver um atributo 'name'
            input.addEventListener('input', () => hideError(fieldName));
            input.addEventListener('change', () => hideError(fieldName)); // Para selects e dates
        }
    });

    // --- Adição de Listeners para máscaras (agora no JS, não no HTML) ---
    document.getElementById('CPF').addEventListener('input', function() {
        mascara(this);
    });
    document.getElementById('Tel').addEventListener('keyup', handlePhone);
    document.getElementById('CEP').addEventListener('keyup', handleZipCode);

    // --- Lógica do campo de data de nascimento (movido do HTML) ---
    const nascInput = document.getElementById('Nasc');
    if (nascInput) {
        const today = new Date();
        const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
        const formattedDate = fifteenYearsAgo.toISOString().split('T')[0];
        nascInput.setAttribute('max', formattedDate);
    }

    // --- Lógica de upload de arquivos (movido do HTML) ---
    document.getElementById("Document").addEventListener("change", function() {
        if (this.files.length > 0) {
            const fileName = this.files[0].name;
            document.getElementById("selectedFile").textContent = `Documento Selecionado: ${fileName}`;
        }
        hideError('documentoIdentidade'); // Esconde erro se um arquivo for selecionado
    });

    document.getElementById("Comprovante").addEventListener("change", function() {
        var displayElement = document.getElementById("comprovanteSelectedfile");
        if (displayElement && this.files.length > 0) {
            const fileName = this.files[0].name;
            displayElement.textContent = `Documento Selecionado: ${fileName}`;
        }
        hideError('comprovanteResidencia'); // Esconde erro se um arquivo for selecionado
    });

    // --- Lógica da seleção das trilhas ---
    const trilhaOptions = document.querySelectorAll('.grid-select-option');
    trilhaOptions.forEach(option => {
        option.addEventListener('click', function() { // Usar 'function' para ter 'this' correto
            trilhaOptions.forEach(opt => opt.setAttribute('data-selected', 'false'));
            this.setAttribute('data-selected', 'true'); // 'this' refere-se à opção clicada
            // Esconde o erro da trilha quando uma é selecionada
            hideError('trilhaAprendizagem');
        });
    });

    // --- Lógica do checkbox de termos (movido do HTML) ---
    const termsCheckbox = document.getElementById('termsCheckbox');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            console.log('Terms accepted:', this.checked);
            // Poderia também esconder um erro específico aqui, se houver um para os termos
            // hideError('termosAceitos'); // se você tiver um erro-message para ele
        });
    }

    // Event Listener para o SUBMIT do formulário
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)

        // Limpar mensagens de erro anteriores
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

        const formData = {
            nomeCompleto: document.getElementById('Nome').value,
            dataNascimento: document.getElementById('Nasc').value, // Formato YYYY-MM-DD
            cpf: document.getElementById('CPF').value.replace(/\D/g, ''), // Remover máscara para enviar
            sexo: document.getElementById('Sexo').value,
            email: document.getElementById('Email').value,
            telefone: document.getElementById('Tel').value.replace(/\D/g, ''), // Remover máscara
            // Os campos de upload de arquivo (documentoIdentidadePath, comprovanteResidenciaPath)
            // não são incluídos diretamente no formData aqui porque não estamos lidando
            // com upload de arquivos binários via JSON neste momento.
            // Eles seriam nulos no backend, como discutido.
            cep: document.getElementById('CEP').value.replace(/\D/g, ''), // Remover máscara
            rua: document.getElementById('Rua').value,
            numero: parseInt(document.getElementById('Número').value), // Converter para número
            cidade: document.getElementById('Cidade').value,
            estado: document.getElementById('Estado').value,
            username: document.getElementById('Usuário').value,
            password: document.getElementById('Senha').value, // A senha será hashed no backend
            termosAceitos: document.getElementById('termsCheckbox').checked
        };

        // Obter a trilha de aprendizagem selecionada
        const selectedTrilhaElement = document.querySelector('.grid-select-option[data-selected="true"]');
        if (selectedTrilhaElement) {
            formData.trilhaAprendizagem = selectedTrilhaElement.dataset.value;
        } else {
            formData.trilhaAprendizagem = ''; // Caso nenhuma trilha seja selecionada
        }

        // --- Validação básica no frontend ---
        let isValid = true;

        if (!formData.nomeCompleto) { showError('nomeCompleto', 'Por favor, insira seu nome completo.'); isValid = false; }
        if (!formData.dataNascimento) { showError('dataNascimento', 'Por favor, insira sua data de nascimento.'); isValid = false; }
        if (!formData.cpf) { showError('cpf', 'Por favor, insira seu CPF.'); isValid = false; }
        if (formData.cpf.length !== 11) { showError('cpf', 'CPF deve ter 11 dígitos.'); isValid = false; }
        if (!formData.sexo) { showError('sexo', 'Por favor, selecione seu sexo.'); isValid = false; }
        if (!formData.email) { showError('email', 'Por favor, insira seu e-mail.'); isValid = false; }
        // Validação de email mais robusta pode ser adicionada aqui
        if (!formData.telefone) { showError('telefone', 'Por favor, insira seu telefone.'); isValid = false; }
        if (!formData.cep) { showError('cep', 'Por favor, insira seu CEP.'); isValid = false; }
        if (!formData.rua) { showError('rua', 'Por favor, insira sua rua.'); isValid = false; }
        if (!formData.numero || isNaN(formData.numero)) { showError('numero', 'Por favor, insira um número válido.'); isValid = false; }
        if (!formData.cidade) { showError('cidade', 'Por favor, insira sua cidade.'); isValid = false; }
        if (!formData.estado) { showError('estado', 'Por favor, insira seu estado.'); isValid = false; }
        if (!formData.username) { showError('username', 'Por favor, insira um ID de usuário.'); isValid = false; }
        if (!formData.password) { showError('password', 'Por favor, insira uma senha.'); isValid = false; }
        if (!formData.trilhaAprendizagem) { showError('trilhaAprendizagem', 'Por favor, selecione uma trilha de aprendizagem.'); isValid = false; }
        if (!formData.termosAceitos) {
            alert('Você deve aceitar os Termos e Condições para se inscrever.');
            isValid = false;
        }

        // Para os campos de upload de arquivo:
        // No momento, seu backend não espera esses campos via JSON.
        // Se você quiser que sejam obrigatórios no frontend, você precisará
        // verificar se this.files[0] existe para 'Document' e 'Comprovante'
        // e adicionar um showError para eles.
        // Exemplo:
        // if (!document.getElementById('Document').files[0]) {
        //     showError('documentoIdentidade', 'Por favor, anexe o documento de identidade.');
        //     isValid = false;
        // }
        // if (!document.getElementById('Comprovante').files[0]) {
        //     showError('comprovanteResidencia', 'Por favor, anexe o comprovante de residência.');
        //     isValid = false;
        // }

        if (!isValid) {
            // Se a validação do frontend falhou, pare aqui
            return;
        }

        try {
            // Enviar dados para o backend
            const response = await fetch('/register', { // A rota que criamos no server.js
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Indicamos que estamos enviando JSON
                },
                body: JSON.stringify(formData) // Converte o objeto JavaScript para uma string JSON
            });

            const data = await response.json(); // Tenta parsear a resposta como JSON

            if (response.ok) { // Status HTTP 2xx (ex: 200 OK, 201 Created)
                alert('Inscrição realizada com sucesso! Redirecionando para a página de login.');
                window.location.href = 'login.html'; // Redireciona para a página de login
            } else {
                // Se o backend retornou um erro (ex: 400 Bad Request, 409 Conflict)
                alert('Erro na inscrição: ' + (data.message || 'Ocorreu um erro desconhecido.'));
                // Você pode adicionar lógica para exibir erros específicos do backend
                // Por exemplo, se data.errors tiver informações sobre campos específicos
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert('Erro de conexão com o servidor. Tente novamente mais tarde.');
        }
    });

    // Código para a funcionalidade do botão Voltar (se quiser que ele volte)
    const backButton = document.querySelector('.Voltar');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // window.history.back(); // Volta para a página anterior
            // Ou redireciona para uma página específica, se for o caso
            // window.location.href = 'index.html';
            alert('Funcionalidade Voltar ainda não implementada para este exemplo.');
        });
    }

}); // Fim do DOMContentLoaded