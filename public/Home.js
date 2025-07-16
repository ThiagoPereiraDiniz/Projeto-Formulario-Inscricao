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
                // Manter o fetch do ViaCEP aqui, pois é funcionalidade do frontend
                // A URL está correta. Se houver erro, é problema de rede/ambiente.
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                
                // Verifica se a resposta HTTP do ViaCEP foi bem-sucedida (status 2xx)
                if (!response.ok) {
                    throw new Error(`Erro HTTP! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.erro) { // Se o ViaCEP retornar um erro específico (CEP não encontrado)
                    mensagemErro.style.display = 'block';
                    mensagemErro.textContent = 'CEP não encontrado.';
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
                console.error('Erro ao buscar CEP (rede ou API):', error);
                mensagemErro.textContent = `Erro ao buscar CEP. Verifique sua conexão. (${error.message})`;
                mensagemErro.style.display = 'block';
                document.getElementById('Rua').value = ''; // Limpa os campos em caso de erro
                document.getElementById('Cidade').value = '';
                document.getElementById('Estado').value = '';
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

    // Função para mostrar mensagem de erro e aplicar estilo
    const showError = (fieldId, message) => {
        const errorElement = document.querySelector(`.error-message[data-field="${fieldId}"]`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            // Adiciona a classe de erro ao input ou select
            const inputElement = document.querySelector(`[name="${fieldId}"]`);
            if (inputElement) {
                inputElement.classList.add('error');
            }
        }
    };

    // Função para esconder mensagem de erro e remover estilo
    const hideError = (fieldId) => {
        const errorElement = document.querySelector(`.error-message[data-field="${fieldId}"]`);
        if (errorElement) {
            errorElement.style.display = 'none';
            // Remove a classe de erro do input ou select
            const inputElement = document.querySelector(`[name="${fieldId}"]`);
            if (inputElement) {
                inputElement.classList.remove('error');
            }
        }
    };

    // Adicionar listeners para esconder erros ao digitar/selecionar em inputs e selects
    const inputs = registrationForm.querySelectorAll('input:not([type="file"]), select');
    inputs.forEach(input => {
        const fieldName = input.name;
        if (fieldName) { // Só se o campo tiver um atributo 'name'
            input.addEventListener('input', () => hideError(fieldName));
            input.addEventListener('change', () => hideError(fieldName)); // Para selects e dates
        }
    });

    // --- Adição de Listeners para máscaras ---
    document.getElementById('CPF').addEventListener('input', function() {
        mascara(this);
    });
    document.getElementById('Tel').addEventListener('keyup', handlePhone);
    document.getElementById('CEP').addEventListener('keyup', handleZipCode);

    // --- Lógica do campo de data de nascimento ---
    const nascInput = document.getElementById('Nasc');
    if (nascInput) {
        const today = new Date();
        const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
        const formattedDate = fifteenYearsAgo.toISOString().split('T')[0];
        nascInput.setAttribute('max', formattedDate);
    }

    // --- Lógica de upload de arquivos ---
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
        option.addEventListener('click', function() {
            trilhaOptions.forEach(opt => opt.setAttribute('data-selected', 'false'));
            this.setAttribute('data-selected', 'true');
            hideError('trilhaAprendizagem'); // Esconde o erro da trilha quando uma é selecionada
        });
    });

    // --- Lógica do checkbox de termos ---
    const termsCheckbox = document.getElementById('termsCheckbox');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            console.log('Terms accepted:', this.checked);
        });
    }

    // Event Listener para o SUBMIT do formulário
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)

        // Limpar mensagens de erro anteriores e remover classes de erro dos inputs
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        document.querySelectorAll('input.error, select.error').forEach(el => el.classList.remove('error'));


        let isValid = true; // Flag para verificar a validade do formulário

        // 1. Coleta e validação dos dados de texto/select
        const rawData = {
            nomeCompleto: document.getElementById('Nome').value.trim(),
            dataNascimento: document.getElementById('Nasc').value.trim(),
            cpf: document.getElementById('CPF').value.replace(/\D/g, '').trim(),
            sexo: document.getElementById('Sexo').value.trim(),
            email: document.getElementById('Email').value.trim(),
            telefone: document.getElementById('Tel').value.replace(/\D/g, '').trim(),
            cep: document.getElementById('CEP').value.replace(/\D/g, '').trim(),
            rua: document.getElementById('Rua').value.trim(),
            numero: document.getElementById('Número').value.trim(),
            cidade: document.getElementById('Cidade').value.trim(),
            estado: document.getElementById('Estado').value.trim(),
            username: document.getElementById('Usuário').value.trim(),
            password: document.getElementById('Senha').value.trim(),
            // Trilha e termos serão tratados separadamente para validação específica
        };

        // Validação de campos obrigatórios simples
        for (const [key, value] of Object.entries(rawData)) {
            if (value === '') { // Usar === '' após o .trim() para campos de texto
                showError(key, `O campo é obrigatório.`);
                isValid = false;
            }
        }

        // Validação específica para o campo de upload de identidade
        const documentFile = document.getElementById('Document').files[0];
        if (!documentFile) {
            showError('documentoIdentidade', 'O documento de identidade é obrigatório.');
            isValid = false;
        }

        // Validação específica para o campo de upload de comprovante de residência
        const comprovanteFile = document.getElementById('Comprovante').files[0];
        if (!comprovanteFile) {
            showError('comprovanteResidencia', 'O comprovante de residência é obrigatório.');
            isValid = false;
        }

        // Validação da trilha de aprendizagem
        const selectedTrilhaOption = document.querySelector('.grid-select-option[data-selected="true"]');
        let trilhaAprendizagemValue = null;
        if (selectedTrilhaOption) {
            trilhaAprendizagemValue = selectedTrilhaOption.dataset.value;
        } else {
            showError('trilhaAprendizagem', 'Selecione uma trilha de aprendizagem.');
            isValid = false;
        }
        
        // Validação dos termos e condições
        if (!termsCheckbox.checked) {
            alert('Você deve concordar com os Termos e Condições e com a Política de Privacidade para fazer a inscrição.');
            isValid = false;
        }

        if (!isValid) {
            console.log('Formulário inválido. Corrija os erros.');
            return; // Impede o envio se houver erros de validação
        }

        // Se o formulário for válido, prosseguir com o envio
        console.log('Formulário válido. Enviando dados...');
        
        // Criar FormData para enviar dados e arquivos
        const formToSend = new FormData();
        for (const key in rawData) {
            formToSend.append(key, rawData[key]);
        }
        formToSend.append('trilhaAprendizagem', trilhaAprendizagemValue);
        formToSend.append('termosAceitos', termsCheckbox.checked);

        // Adicionar arquivos ao FormData
        if (documentFile) {
            formToSend.append('documentoIdentidadeFile', documentFile); // Nome do campo esperado pelo seu backend
        }
        if (comprovanteFile) {
            formToSend.append('comprovanteResidenciaFile', comprovanteFile); // Nome do campo esperado pelo seu backend
        }

        try {
            // A URL DEVE SER APENAS '/register' ou 'http://localhost:3000/register'
            // O '/1' no erro 500 que você viu indica que algo adicionou isso.
            // Certifique-se que NENHUMA extensão do navegador está modificando suas requisições.
            const response = await fetch('http://localhost:3000/register', { 
                method: 'POST',
                body: formToSend, // FormData não precisa de 'Content-Type' customizado para 'multipart/form-data'
            });

            if (response.ok) {
                const result = await response.json(); 
                console.log('Inscrição realizada com sucesso!', result);
                alert('Inscrição realizada com sucesso!');
                registrationForm.reset(); 
                document.getElementById("selectedFile").textContent = ''; 
                document.getElementById("comprovanteSelectedfile").textContent = ''; 
                trilhaOptions.forEach(opt => opt.setAttribute('data-selected', 'false')); 
            } else {
                // Capturar o erro do backend mais detalhadamente
                const errorData = await response.json().catch(() => ({ message: 'Resposta não é JSON ou erro desconhecido.' }));
                console.error('Erro na inscrição:', response.status, errorData);
                alert(`Erro ao fazer inscrição (${response.status}): ${errorData.message || 'Verifique os dados e tente novamente.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou no servidor:', error);
            alert('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        }
    });
});