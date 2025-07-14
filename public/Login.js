// public/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginErrorMessage = document.getElementById('login-error-message');

    // Função para mostrar mensagem de erro (específica para o login ou campos)
    const showLoginError = (message) => {
        loginErrorMessage.textContent = message;
        loginErrorMessage.style.display = 'block';
    };

    // Função para esconder mensagem de erro
    const hideLoginError = () => {
        loginErrorMessage.style.display = 'none';
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none'); // Esconde erros de validação de campo
    };

    // Adicionar listeners para esconder erros ao digitar
    usernameInput.addEventListener('input', hideLoginError);
    passwordInput.addEventListener('input', hideLoginError);


    // Listener para o SUBMIT do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            hideLoginError(); // Esconde mensagens de erro anteriores

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Validação básica no frontend (se campos estão vazios)
            let isValid = true;
            if (!username) {
                document.querySelector('.error-message[data-field="username"]').style.display = 'block';
                document.querySelector('.error-message[data-field="username"]').textContent = 'Por favor, insira seu ID de usuário.';
                isValid = false;
            }
            if (!password) {
                document.querySelector('.error-message[data-field="password"]').style.display = 'block';
                document.querySelector('.error-message[data-field="password"]').textContent = 'Por favor, insira sua senha.';
                isValid = false;
            }

            if (!isValid) {
                return; // Para se a validação básica falhar
            }

            try {
                const response = await fetch('/login', { // Nova rota no backend
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) { // Status 2xx (ex: 200 OK)
                    alert('Login bem-sucedido! Redirecionando para o dashboard.');
                    // Aqui você redirecionaria para uma página de dashboard, por exemplo
                    window.location.href = 'dashboard.html'; // Crie esta página depois
                } else {
                    // Se o backend retornou um erro (ex: 401 Unauthorized, 400 Bad Request)
                    showLoginError(data.message || 'Erro ao fazer login. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro de conexão no login:', error);
                showLoginError('Erro de conexão com o servidor. Tente novamente mais tarde.');
            }
        });
    }

    // Lógica para o botão "Voltar"
    const backButton = document.querySelector('.Voltar');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back(); // Volta para a página anterior
        });
    }
});