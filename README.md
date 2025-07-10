# WOD Clock App

Aplicação para gerenciamento de WODs (Workout of the Day) com frontend Angular/Ionic e backend Node.js/Express.

## 🚀 Como executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Instalar dependências do Frontend
```bash
npm install
```

### 2. Instalar dependências do Backend
```bash
cd backend
npm install
```

### 3. Iniciar o Backend (Porta 3000)
```bash
cd backend
npm start
```

### 4. Iniciar o Frontend (Porta 8100)
Em outro terminal:
```bash
npm start
```

## 📱 Acessos

- **Frontend**: http://localhost:8100
- **Backend API**: http://localhost:3000

## 🔐 Credenciais de teste

- **Email**: admin@wodclock.com
- **Senha**: password

## 📋 Endpoints da API

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login

### WODs
- `GET /api/wods` - Listar todos os WODs
- `GET /api/wods/:date` - Buscar WOD por data
- `POST /api/wods` - Criar novo WOD
- `PUT /api/wods/:date` - Atualizar WOD
- `DELETE /api/wods/:date` - Remover WOD

## 🛠️ Tecnologias

### Frontend
- Angular 19
- Ionic 8
- TypeScript

### Backend
- Node.js
- Express.js
- JWT para autenticação
- bcryptjs para hash de senhas 