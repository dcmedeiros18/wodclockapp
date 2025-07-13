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

// Dados mock para classes e agendamentos
let classes = [
  {
    id: 1,
    date: '2025-01-04',
    time: '06:00 am',
    maxSpots: 10,
    bookedSpots: 5
  },
  {
    id: 2,
    date: '2025-01-04',
    time: '07:00 am',
    maxSpots: 10,
    bookedSpots: 4
  },
  {
    id: 3,
    date: '2025-01-04',
    time: '04:30 pm',
    maxSpots: 10,
    bookedSpots: 6
  },
  {
    id: 4,
    date: '2025-01-05',
    time: '07:00 am',
    maxSpots: 10,
    bookedSpots: 6
  },
  {
    id: 5,
    date: '2025-01-05',
    time: '05:00 pm',
    maxSpots: 10,
    bookedSpots: 8
  }
];

let bookings = [
  {
    id: 1,
    userId: 1,
    classId: 1,
    date: '2025-01-04',
    time: '06:00 am',
    createdAt: new Date().toISOString()
  }
];

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  console.log('=== AUTENTICAÇÃO ===');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token recebido:', token ? 'SIM' : 'NÃO');

  if (!token) {
    console.log('Token não fornecido');
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decodificado:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Erro na verificação do token:', err.message);
    return res.status(403).json({ message: 'Token inválido' });
  }
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

// Rotas para Classes e Agendamentos
app.get('/api/classes/:date', authenticateToken, (req, res) => {
  console.log('=== ROTA CLASSES ===');
  console.log('Requisição para classes recebida:', req.params.date);
  console.log('Usuário autenticado:', req.user);
  
  try {
    const { date } = req.params;
    const userId = req.user.userId;
    
    console.log('Data solicitada:', date);
    console.log('ID do usuário:', userId);
    
    // Validar formato da data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.log('Formato de data inválido:', date);
      return res.status(400).json({ message: 'Formato de data inválido. Use YYYY-MM-DD' });
    }
    
    // Validar se a data é válida
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.log('Data inválida:', date);
      return res.status(400).json({ message: 'Data inválida' });
    }
    
    // Verificar se o usuário existe
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.log('Usuário não encontrado no banco');
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    console.log('Usuário encontrado:', user.email);
    
    const availableClasses = classes
      .filter(c => c.date === date)
      .map(c => ({
        id: c.id,
        time: c.time,
        spots: c.maxSpots - c.bookedSpots,
        maxSpots: c.maxSpots // <-- adicionado para o frontend
      }));
    
    console.log('Classes encontradas:', availableClasses);
    res.json(availableClasses);
  } catch (error) {
    console.error('Erro na rota de classes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/api/bookings', authenticateToken, (req, res) => {
  const { classId } = req.body;
  const userId = req.user.userId;

  if (!classId) {
    return res.status(400).json({ message: 'Class ID is required.' });
  }

  // Buscar a classe
  const classToBook = classes.find(c => c.id === classId);
  if (!classToBook) {
    return res.status(404).json({ message: 'Class not found.' });
  }

  // Verificar se há vagas disponíveis
  if (classToBook.bookedSpots >= classToBook.maxSpots) {
    return res.status(400).json({ message: 'No spots available for this class.' });
  }

  // Verificar se o usuário já tem agendamento para este horário
  const conflictingBooking = bookings.find(
    b =>
      b.userId === userId &&
      normalize(b.date) === normalize(classToBook.date) &&
      normalize(b.time) === normalize(classToBook.time)
  );
  if (conflictingBooking) {
    return res.status(400).json({ message: `You have already booked a class on ${classToBook.date} at ${classToBook.time}.` });
  }

  // Criar o agendamento
  const newBooking = {
    id: bookings.length + 1,
    userId,
    classId,
    date: classToBook.date,
    time: classToBook.time,
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);

  // Atualizar o número de vagas ocupadas
  classToBook.bookedSpots++;

  res.status(201).json({
    message: `Class successfully booked for ${classToBook.date} at ${classToBook.time}.`,
    booking: newBooking
  });
});

app.get('/api/bookings/user', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userBookings = bookings
    .filter(b => b.userId === userId)
    .map(b => ({
      id: b.id,
      date: b.date,
      time: b.time,
      createdAt: b.createdAt
    }));
  
  res.json(userBookings);
});

app.delete('/api/bookings/:bookingId', authenticateToken, (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userId;

  const bookingIndex = bookings.findIndex(b => b.id === parseInt(bookingId) && b.userId === userId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  const booking = bookings[bookingIndex];
  
  // Atualizar o número de vagas ocupadas na classe
  const classToUpdate = classes.find(c => c.id === booking.classId);
  if (classToUpdate) {
    classToUpdate.bookedSpots--;
  }

  // Remover o agendamento
  bookings.splice(bookingIndex, 1);

  res.json({ message: 'Booking successfully cancelled.' });
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
  console.log(`📅 Endpoints de Classes: /api/classes/:date`);
  console.log(`📋 Endpoints de Agendamentos: /api/bookings`);
}); 