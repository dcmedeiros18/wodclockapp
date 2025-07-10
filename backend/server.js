const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'wodclock-secret-key-2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Dados em memória (em produção, usar banco de dados)
let users = [
  {
    id: 1,
    email: 'admin@wodclock.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    profile: 'admin'
  }
];

let wods = [
  {
    id: 1,
    date: '2025-01-04',
    title: 'AMRAP 12 minutes',
    description: '6 Power Clean<br>12 Wall Balls<br>18 Reverse Lunge'
  },
  {
    id: 2,
    date: '2025-01-05',
    title: 'For Time',
    description: '21-15-9 Thrusters and Pull-ups'
  },
  {
    id: 3,
    date: '2025-01-06',
    title: 'EMOM 10 minutes',
    description: 'Minute 1: 5 Burpees<br>Minute 2: 10 Air Squats'
  }
];

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      profile: 'user'
    };

    users.push(newUser);

    // Gerar token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      access_token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        profile: newUser.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login realizado com sucesso',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rotas para WOD
app.get('/api/wods', authenticateToken, (req, res) => {
  res.json(wods);
});

app.get('/api/wods/:date', authenticateToken, (req, res) => {
  const { date } = req.params;
  const wod = wods.find(w => w.date === date);
  
  if (!wod) {
    return res.status(404).json({ message: 'WOD não encontrado' });
  }
  
  res.json(wod);
});

app.post('/api/wods', authenticateToken, (req, res) => {
  const { date, title, description } = req.body;

  if (!date || !title || !description) {
    return res.status(400).json({ message: 'Data, título e descrição são obrigatórios' });
  }

  // Verificar se já existe WOD para esta data
  const existingWod = wods.find(w => w.date === date);
  if (existingWod) {
    return res.status(400).json({ message: 'Já existe um WOD para esta data' });
  }

  const newWod = {
    id: wods.length + 1,
    date,
    title,
    description
  };

  wods.push(newWod);
  res.status(201).json(newWod);
});

app.put('/api/wods/:date', authenticateToken, (req, res) => {
  const { date } = req.params;
  const { title, description } = req.body;

  const wodIndex = wods.findIndex(w => w.date === date);
  if (wodIndex === -1) {
    return res.status(404).json({ message: 'WOD não encontrado' });
  }

  wods[wodIndex] = {
    ...wods[wodIndex],
    title: title || wods[wodIndex].title,
    description: description || wods[wodIndex].description
  };

  res.json(wods[wodIndex]);
});

app.delete('/api/wods/:date', authenticateToken, (req, res) => {
  const { date } = req.params;
  const wodIndex = wods.findIndex(w => w.date === date);
  
  if (wodIndex === -1) {
    return res.status(404).json({ message: 'WOD não encontrado' });
  }

  wods.splice(wodIndex, 1);
  res.json({ message: 'WOD removido com sucesso' });
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'WOD Clock Backend API está funcionando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
  console.log(`🔐 Endpoints de autenticação: /auth/login, /auth/register`);
  console.log(`💪 Endpoints de WOD: /api/wods`);
}); 