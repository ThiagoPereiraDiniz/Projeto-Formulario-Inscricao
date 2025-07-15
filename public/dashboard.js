document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os itens da barra de navegação (os links que você quer que sejam clicáveis)
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    
    // Seleciona todas as seções de conteúdo que o dashboard pode exibir
    const contentSections = document.querySelectorAll('.main-content .content-section');

    // Seleciona o elemento onde a mensagem de boas-vindas do usuário é exibida
    const welcomeMessageElement = document.getElementById('welcome-message');

    // Função para obter o nome de usuário do localStorage ou retornar um padrão
    // Isso é um placeholder; em um app real, o username viria da sessão após o login
    function getUsername() {
        const username = localStorage.getItem('loggedInUsername'); 
        return username ? `Olá, ${username}!` : 'Olá, Usuário!';
    }

    // Atualiza a mensagem de boas-vindas ao carregar a página
    if (welcomeMessageElement) {
        welcomeMessageElement.textContent = getUsername();
    }

    // Função principal para mostrar a seção correta e atualizar o estado da navegação
    function showSection(targetId) {
        // 1. Remove a classe 'active' de todos os itens da barra de navegação
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // 2. Adiciona a classe 'active' ao item da barra de navegação que corresponde à seção alvo
        // Buscamos o link 'a' cujo 'data-target' seja igual ao 'targetId' e depois pegamos seu pai 'li'
        const activeNavItem = document.querySelector(`.nav-item a[data-target="${targetId}"]`);
        if (activeNavItem) {
            activeNavItem.closest('.nav-item').classList.add('active');
        }

        // 3. Esconde todas as seções de conteúdo
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });

        // 4. Mostra a seção de conteúdo alvo (remove a classe 'hidden')
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            // Opcional: Adicionar uma classe para animação sutil se desejar (ex: 'fade-in')
        }
    }

    // Adiciona um 'event listener' de clique a cada item da barra de navegação
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            // Previne o comportamento padrão do link (que seria recarregar a página)
            event.preventDefault(); 
            
            // Pega o valor do atributo 'data-target' do link clicado
            const targetId = item.querySelector('a').dataset.target;

            // Se um 'data-target' válido foi encontrado, mostra a seção correspondente
            if (targetId) {
                showSection(targetId);
            }
        });
    });

    // Opcional: Lidar com o estado inicial ao carregar a página (qual seção deve ser mostrada primeiro)
    // Se houver um hash na URL (ex: dashboard.html#profile-section), podemos carregar essa seção.
    // Isso é útil se você quiser que as URLs reflitam a seção atual.
    const initialHash = window.location.hash.substring(1); // Remove o '#'
    // Ex: Se a URL for http://localhost:3000/dashboard.html#profile-section, 'initialHash' será 'profile-section'
    if (initialHash && document.getElementById(initialHash)) { 
        showSection(initialHash);
    } else {
        // Por padrão, mostra a seção do dashboard ao carregar a página pela primeira vez
        showSection('dashboard-section');
    }

    // Listener para o botão Sair
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Previne o comportamento padrão do link
            // Limpa o token ou informações de usuário do localStorage/sessionStorage
            localStorage.removeItem('loggedInUsername'); // Exemplo: remove o username salvo
            // Redireciona para a página inicial ou de login
            window.location.href = '/'; 
        });
    }

    // --- EXEMPLO DE COMO VOCÊ CARREGARIA DADOS REAIS DO BACKEND (FUTURAMENTE) ---
    // Esta função seria chamada quando a seção 'Meu Perfil' fosse exibida
    /*
    async function fetchUserProfile() {
        // Obtenha o token de autenticação (JWT) do localStorage, se você estiver usando
        const token = localStorage.getItem('token'); 
        if (!token) {
            console.error('Nenhum token de autenticação encontrado. Usuário não logado ou sessão expirada.');
            // Opcional: redirecionar para a página de login
            // window.location.href = '/login';
            return;
        }

        try {
            const response = await fetch('/api/profile', { // Rota no seu server.js para buscar o perfil
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho Authorization
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Se a resposta não for OK (ex: 401 Unauthorized, 500 Internal Server Error)
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao carregar dados do perfil.');
            }

            const userData = await response.json(); // Pega os dados do usuário da resposta JSON

            // Atualiza os elementos HTML na seção 'Meu Perfil' com os dados recebidos
            document.getElementById('profile-nome').textContent = userData.nomeCompleto || 'N/A';
            document.getElementById('profile-email').textContent = userData.email || 'N/A';
            document.getElementById('profile-username').textContent = userData.username || 'N/A';
            document.getElementById('profile-cpf').textContent = userData.cpf || 'N/A';
            document.getElementById('profile-dataNascimento').textContent = userData.dataNascimento ? new Date(userData.dataNascimento).toLocaleDateString('pt-BR') : 'N/A';
            document.getElementById('profile-sexo').textContent = userData.sexo || 'N/A';
            document.getElementById('profile-telefone').textContent = userData.telefone || 'N/A';
            document.getElementById('profile-cep').textContent = userData.cep || 'N/A';
            document.getElementById('profile-endereco').textContent = userData.enderecoCompleto || 'N/A'; // Você precisaria concatenar rua, num, bairro, etc. no backend ou aqui
            document.getElementById('profile-trilha').textContent = userData.trilha || 'N/A';
            // ... e assim por diante para quaisquer outros campos do perfil
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error.message);
            // Mostrar uma mensagem de erro para o usuário na UI
            alert('Não foi possível carregar seu perfil. Tente novamente mais tarde.');
        }
    }

    // Exemplo: Chamar fetchUserProfile quando a seção de perfil é ativada
    // Você teria que adicionar uma verificação dentro da função showSection ou usar um MutationObserver
    // para detectar quando #profile-section está visível e então chamar fetchUserProfile()
    */
});