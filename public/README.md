# Programa Trilhas - Sistema de Inscrição

## 1. O que é o projeto

O Programa Trilhas é uma plataforma educacional que oferece diferentes percursos formativos (trilhas) nas áreas de tecnologia da informação e desenvolvimento. Este projeto consiste em um sistema de inscrição e autenticação para o programa, permitindo que usuários se registrem, selecionem uma trilha de aprendizagem e acessem a plataforma.

O sistema possui um formulário completo de inscrição com validação de dados, integração com API de CEP para autopreenchimento de endereço, e uma interface de login para acesso de usuários já cadastrados.

## 2. Como rodar localmente

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet (para a funcionalidade de busca de CEP)

### Passos para execução
1. Clone o repositório para sua máquina local:
   ```
   https://github.com/Millxer/projeto-3.git
   ```

2. Certifique-se de que a estrutura de arquivos está correta:
   ```
   - Home.html
   - Login.html
   - Home.js
   - Styles/
     - Home.css
   - Assets/
     - Archive.png
     - BackEnd.png
     - CheckIcon.png
     - CloudIcon.png
     - ErrorMsg.png
     - FrontEnd.png
     - IconError.png
     - IconErrorDown.png
     - image.png
     - image1.png
     - Jogos.png
     - TI.png
     - UX.png
   ```

3. Abra o projeto no Visual Studio Code

## 3. Tecnologias utilizadas

- **HTML**: Estruturação do conteúdo
- **CSS**: Estilização e layout responsivo
- **JavaScript**: Validações, máscaras de entrada e interatividade
- **LocalStorage API**: Armazenamento local para auto-salvamento do formulário
- **Fetch API**: Integração com o serviço ViaCEP para busca de endereços
- **DOM Manipulation**: Manipulação dinâmica de elementos HTML

## 4. Principais funcionalidades

### Formulário de Inscrição
- **Validação em tempo real**: Verificação de campos obrigatórios e formatos específicos
- **Máscaras de entrada**: Formatação automática para CPF, telefone e CEP
- **Validação de idade**: Verificação se o usuário tem pelo menos 15 anos
- **Busca automática de CEP**: Preenchimento automático de endereço a partir do CEP
- **Upload de documentos**: Possibilidade de envio de documento de identidade e comprovante de residência
- **Seleção de trilha**: Interface para escolha da trilha de aprendizagem
- **Auto-salvamento**: Armazenamento temporário das informações durante o preenchimento
- **Mensagem de sucesso**: Confirmação de cadastro realizado com redirecionamento

### Sistema de Login
- Interface para acesso de usuários já registrados
- Validação de campos obrigatórios
- Redirecionamento para cadastro caso o usuário não possua conta

### Design responsivo
- Layout dividido em duas partes: formulário e área visual
- Design adaptável a diferentes tamanhos de tela
- Interface intuitiva e de fácil navegação

### Segurança
- Validação tanto no cliente quanto no envio do formulário
- Verificações de formato para dados críticos como CPF e e-mail
