# 💈 Barbearia Flores - Sistema SaaS Premium

Este é um sistema web completo, moderno e de altíssimo nível para barbearias de alto padrão. Projetado especificamente para ser vendido como um serviço mensal (SaaS), o projeto foca em alta conversão de clientes, animações cinematográficas fluidas, excelente performance móvel e administração de dados em tempo real.

---

## 🚀 Principais Recursos

- **Landing Page Cinematográfica**: 10 seções interativas com transições suaves (Framer Motion) e visual luxuoso (preto, cinza escuro e detalhes em dourado).
- **Antes e Depois Interativo**: Um controle deslizante interativo que revela a transformação visual (clássica vs. moderna) utilizando clip-path responsivo.
- **Wizard de Agendamento Online**: Fluxo guiado em 4 etapas (Escolha de Barbeiro ➔ Serviço ➔ Data e Horário ➔ Dados de Contato) com salvamento em banco de dados e notificação instantânea formatada no WhatsApp.
- **Painel Administrativo Completo**: Dashboard moderno com controle em tempo real de agendamentos, faturamento estimado e estatísticas rápidas.
- **CRUDs em Tempo Real**: Gerenciamento de Serviços, Funcionários, Depoimentos, Fotos da Galeria e Configurações Gerais com atualizações instantâneas no site dos clientes.
- **Fallback Inteligente (Modo Demo)**: Se as chaves do Firebase não forem configuradas no `.env`, o sistema ativa automaticamente o modo offline usando LocalStorage, permitindo testar toda a aplicação e painel de controle imediatamente.

---

## 🛠️ Stack Tecnológica

### Frontend
- **React.js (Vite)**
- **Tailwind CSS** (Configurado com identidade visual de luxo)
- **Framer Motion** (Animações fluidas de entrada e transições de tela)
- **Lucide React** (Ícones premium e modernos)
- **React Router DOM** (Controle de navegação e guardas de rotas seguras)

### Backend & Banco de Dados (Firebase)
- **Firebase Auth** (Autenticação segura de administradores)
- **Firebase Firestore** (Banco NoSQL em tempo real para controle de dados)
- **Firebase Storage** (Armazenamento em nuvem de fotos de profissionais e galeria)
- **Firebase Hosting** (Hospedagem estática com HTTPS seguro e CDN)

---

## 📦 Estrutura do Projeto

```text
barbearia-premium/
├── scripts/
│   └── init-db.js          # Script para popular o Firebase Firestore
├── src/
│   ├── assets/             # Arquivos de imagem estáticos
│   ├── firebase/
│   │   ├── config.js       # Inicialização inteligente do Firebase
│   │   ├── dbService.js    # Serviço de banco unificado (Firestore / LocalStorage)
│   │   ├── authService.js  # Serviço de autenticação unificado
│   │   └── storageService.js # Serviço de upload de arquivos (Storage / Base64)
│   ├── pages/
│   │   ├── LandingPage.jsx    # Experiência visual da Landing Page
│   │   ├── AdminLogin.jsx     # Login do administrador
│   │   └── AdminDashboard.jsx # Painel administrativo completo
│   ├── App.jsx             # Roteamento e guarda de rotas
│   ├── index.css           # Estilos globais e componentes customizados
│   └── main.jsx            # Ponto de entrada React
├── firebase.json           # Configuração do Firebase CLI
├── firestore.rules         # Regras de segurança de dados
├── storage.rules           # Regras de segurança de arquivos
├── tailwind.config.js      # Identidade visual (Paleta Dourada & Preta)
└── README.md               # Documentação do projeto
```

---

## 💻 Instalação e Execução Local

### Passo 1: Clonar e instalar dependências
Certifique-se de que possui o **Node.js (v18+)** instalado. No diretório do projeto, execute:
```bash
npm install
```

### Passo 2: Executar em Modo de Demonstração (Sem Firebase)
Para rodar a aplicação imediatamente usando banco de dados local simulado (LocalStorage):
```bash
npm run dev
```
Acesse `http://localhost:5173`.
- Para entrar no **Painel Administrativo**, clique no link "Admin" no rodapé ou acesse `http://localhost:5173/admin`.

---

## ⚙️ Conectando com seu Firebase (Produção)

### Passo 1: Criar o Projeto no Firebase
1. Vá até o [Firebase Console](https://console.firebase.google.com/) e crie um novo projeto.
2. Ative os seguintes serviços no menu lateral:
   - **Authentication** (Habilite o provedor de E-mail/Senha).
   - **Cloud Firestore** (Crie o banco em modo produção/teste).
   - **Storage** (Crie o balde de armazenamento padrão).
   - **Hosting** (Selecione a opção de hospedagem).

### Passo 2: Configurar o Arquivo `.env`
Renomeie o arquivo `.env.example` para `.env` e adicione as chaves fornecidas nas configurações do seu projeto do Firebase:
```env
VITE_FIREBASE_API_KEY=sua_api_key_real
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain_real
VITE_FIREBASE_PROJECT_ID=seu_project_id_real
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket_real
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_real
VITE_FIREBASE_APP_ID=seu_app_id_real
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id_real

VITE_WHATSAPP_NUMBER=5516994206778
```

### Passo 3: Criar seu Usuário Admin no Firebase
No painel do Firebase Console em **Authentication**, clique em **Add User** e cadastre o e-mail administrador e senha.
Depois, no **Firestore Database**, crie uma coleção chamada `admins` e adicione um documento onde o **ID do Documento** seja exatamente o **UID** do usuário criado no Authentication. Adicione o campo `role: "admin"`.

### Passo 4: Rodar o script de carga inicial (Seeder)
Para preencher automaticamente o banco de dados do Firebase com serviços premium, profissionais e depoimentos iniciais, execute:
```bash
npm run seed
```

---

## 🚀 Deploy no Firebase Hosting

### Passo 1: Instalar o Firebase CLI
Caso não tenha instalado globalmente:
```bash
npm install -g firebase-tools
```

### Passo 2: Login e Inicialização do projeto
```bash
firebase login
firebase use --add seu-project-id-do-firebase
```

### Passo 3: Build do Projeto React
Gere o pacote de produção otimizado:
```bash
npm run build
```

### Passo 4: Publicar Regras e Hospedagem
Suba as regras de segurança e o site compilado de uma única vez:
```bash
firebase deploy
```

Seu site estará ativo na URL fornecida pelo Firebase!
