# 💈 Barbearia Flores: Sistema SaaS Premium de Gestão & Agendamento

Este repositório contém a base de código do **Barbearia Flores**, uma plataforma web de altíssimo nível (SaaS) projetada especificamente para barbearias premium e franquias de estética masculina. Como um arquiteto sênior, estruturei este sistema focando em quatro pilares fundamentais: **alta conversão e usabilidade (UX/UI)**, **segurança defensiva**, **resiliência arquitetural** e **independência de infraestrutura**.

---

## 🏛️ Arquitetura do Sistema e Decisões de Design

### 🔄 1. Abstração de Dados Híbrida (Modo Híbrido Resiliente)
O sistema implementa uma camada de serviço híbrida inteligente (`dbService.js`). Se os parâmetros de ambiente do Firebase não estiverem configurados (`.env`), o sistema **ativa de forma transparente o modo offline simulado (Demo)** usando `LocalStorage`. Isso permite a homologação, testes rápidos de UX/UI e demonstração comercial instantânea sem necessidade de infraestrutura ativa.

### 💈 2. Modelagem Relacional Dinâmica (Filiais & Catálogos)
A modelagem NoSQL no Firestore foi estruturada para suportar múltiplos estabelecimentos (franquias):
* **Unidades Físicas (`/branches`)**: Benassi e Bairro Alto.
* **Barbeiros (`/employees`)**: Vinculados a uma unidade específica (`branchId`).
* **Wizard de Agendamento Inteligente**:
  1. O usuário escolhe a **Unidade**.
  2. O sistema filtra e exibe **apenas os profissionais** daquela unidade específica.
  3. Ao selecionar o profissional, a interface exibe **apenas os serviços** que ele tem habilitação (`allowedServices`) para executar, evitando agendamentos impossíveis.

### 🛡️ 3. Segurança Defensiva e Controle de Acesso
* **Proteção Contra Brute-Force (Bloqueio Admin)**: O componente `AdminLogin.jsx` possui uma política local de rate-limiting reativa. Se o usuário falhar 3 tentativas de login consecutivas, um bloqueio temporal de segurança de 30 segundos é acionado.
* **Regras de Acesso Firestore (`firestore.rules`)**: Apenas administradores autenticados e registrados com cargo explícito (`role == "admin"`) na coleção `/admins` podem gravar ou excluir dados nas coleções públicas de serviços, equipe, fotos e depoimentos.
* **Regras do Storage (`storage.rules`)**: Arquivos de imagem enviados são limitados por tipo (`image/*`), tamanho e apenas administradores autenticados possuem autorização de gravação.

### 🖼️ 4. Otimização Client-Side (Performance & Banda)
* **Compressão de Mídia em Tempo Real (`imageCompressor.js`)**: Antes de enviar qualquer foto para o Firebase Storage, a aplicação realiza a compressão client-side (reduzindo dimensões para um limite de 800px de largura e aplicando fator de qualidade JPEG de 70%). Isso reduz drasticamente o consumo de banda dos administradores e os custos de armazenamento em nuvem.

### 🎨 5. Acessibilidade & UI/UX Premium (WCAG AA)
Revisado por um Designer de Produto Sênior, o sistema implementa uma paleta de cores escura e luxuosa em contraste com tons metálicos dourados. Todas as tipografias cinzas secundárias e legendas de formulários foram otimizadas de `text-dark-500` para tons elevados como `text-dark-300` e `text-dark-400` para atingir a taxa mínima de contraste exigida de **4.5:1 (Padrão WCAG AA)**, otimizando o conforto visual e o uso mobile sob luz solar direta.

---

## 🛠️ Stack Tecnológica

* **Core & Roteamento**: [React.js](https://react.dev/) (Vite) + [React Router DOM](https://reactrouter.com/) (Guarda de rotas robusta).
* **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (Extensões customizadas no escopo de variáveis CSS `@theme`).
* **Animações Cinematográficas**: [Framer Motion](https://www.framer.com/motion/) (Entradas elegantes de seção, transições fluidas no Wizard).
* **Biblioteca de Ícones**: [Lucide React](https://lucide.dev/).
* **Backend como Serviço (BaaS)**: 
  * [Firebase Auth](https://firebase.google.com/docs/auth) (Gestão segura de sessões administrativas).
  * [Cloud Firestore NoSQL](https://firebase.google.com/docs/firestore) (Sincronização em tempo real dos agendamentos via listener ativo).
  * [Cloud Storage](https://firebase.google.com/docs/storage) (Upload e armazenamento CDN de fotos de perfil e galeria).
  * [Firebase Hosting](https://firebase.google.com/docs/hosting) (Hospedagem estática veloz global por CDN).

---

## 📦 Organização do Projeto (Clean Architecture)

```text
barbearia-flores/
├── scripts/
│   └── init-db.js            # Script automatizado de carga e purificação de banco de dados
├── src/
│   ├── assets/               # Imagens e logotipos estáticos de suporte
│   ├── components/
│   │   └── ServiceCard.jsx   # Card premium de serviços isolado com micro-interações de hover
│   ├── firebase/
│   │   ├── config.js         # Inicializador reativo com detecção de modo Sandbox/Real
│   │   ├── authService.js    # Interfaceamento e abstração de autenticação Firebase Auth
│   │   ├── dbService.js      # Camada reativa híbrida NoSQL Firestore / LocalStorage
│   │   └── storageService.js # Processamento de uploads de arquivos
│   ├── pages/
│   │   ├── LandingPage.jsx   # Hub Visual principal com Wizard de Agendamento dinâmico
│   │   ├── Services.jsx      # Catálogo e Tabela de Serviços pública e indexável
│   │   ├── AdminLogin.jsx    # Portal de acesso administrativo com proteção brute-force
│   │   └── AdminDashboard.jsx# Central Admin de controle financeiro, equipe, e agendamentos reais
│   ├── utils/
│   │   └── imageCompressor.js# Utilitário client-side de compressão canvas para otimização de imagens
│   ├── index.css             # Componentização Tailwind, fontes Cinzel/Montserrat e design tokens
│   ├── App.jsx               # Roteamento global e guarda de rotas de segurança de nível de sessão
│   └── main.jsx              # Inicializador do ciclo de vida da aplicação React
├── firestore.rules           # Regras de segurança RBAC declarativas de banco de dados
├── storage.rules             # Regras declarativas de segurança de arquivos em nuvem
└── tailwind.config.js        # Design System tokens (Dourado de luxo & Paleta Preta)
```

---

## ⚙️ Configuração do Ambiente e Execução Local

### 1. Pré-requisitos
* Node.js v18.0.0 ou superior
* Gerenciador de Pacotes npm ou yarn

### 2. Clonar e Instalar Dependências
```bash
# Instalar todos os pacotes requeridos
npm install
```

### 3. Rodar em Modo Demo Sandbox (Offline Instantâneo)
Para testar a aplicação inteira (Landing Page, fluxo completo de agendamento online e o Painel Administrativo de forma mockada rápida), execute:
```bash
npm run dev
```
O sistema criará o banco de dados simulado no LocalStorage. Acesse `http://localhost:5173`.
* **Painel Administrativo**: Clique no link "ADMIN" no header ou acesse `http://localhost:5173/admin` para testar. As credenciais em modo demo são livres.

---

## 🔗 Integração com Banco de Dados de Produção (Firebase)

### Passo 1: Provisionar Recursos no Firebase Console
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative os seguintes serviços fundamentais:
   * **Authentication**: Habilite o método de login por **E-mail/Senha**.
   * **Cloud Firestore Database**: Ative o banco de dados.
   * **Storage**: Provisione o balde padrão para armazenar mídias.
   * **Hosting**: Ative o provisionamento de hospedagem.

### Passo 2: Definir Variáveis de Ambiente
Duplique o arquivo `.env.example`, renomeie para `.env` no diretório raiz do projeto e configure as credenciais da sua web-app:

```env
VITE_FIREBASE_API_KEY=seu_api_key_fornecido_no_console
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id

VITE_WHATSAPP_NUMBER=5516994206778
```

### Passo 3: Cadastrar Usuário Administrativo Real
1. Acesse seu Firebase Console na aba **Authentication** e crie um usuário admin com e-mail e senha. Note o **UID** gerado.
2. Acesse a aba **Firestore Database** e crie um documento na coleção `admins`. O **ID do documento** deve ser o **UID** exato do usuário. Adicione a chave:
   * `role`: "admin"

### Passo 4: Executar a Carga Inicial Purificada de Dados (Seed)
Para carregar os 13 serviços premium oficiais da barbearia (limpos e livre das chaves legadas obsoletas), as filiais e a lista inicial de barbeiros reais distribuídos por filiais, execute o seeder:
```bash
# Roda o script de carga autenticado no Firestore
npm run seed
```

---

## 🚀 Build de Produção & Deploy no Firebase Hosting

Sendo um projeto SPA reativo compilado em Vite, o pipeline de implantação foi planejado para ser executado de forma simples:

### 1. Compilação de Produção Otimizada
O Vite gerará um bundle minificado e otimizado com divisões de chunk em menos de 20 segundos:
```bash
npm run build
```

### 2. Efetuar Login no Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase use --add seu-projeto-id
```

### 3. Deploy de Infraestrutura de Código
Implante as regras declarativas de segurança do banco e do storage simultaneamente com os arquivos otimizados compilados na pasta `/dist`:
```bash
firebase deploy
```
O Firebase fornecerá a URL permanente com certificado SSL gratuito (`https://sua-url.web.app`) ativa em produção!
