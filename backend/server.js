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

// Mock data for classes and bookings - Monday to Thursday
let classes = [
  // Monday (2025-01-06)
  {
    id: 1,
    date: '2025-01-06',
    time: '06:00 am',
    maxSpots: 10,
    bookedSpots: 5
  },
  {
    id: 2,
    date: '2025-01-06',
    time: '07:00 am',
    maxSpots: 10,
    bookedSpots: 4
  },
  {
    id: 3,
    date: '2025-01-06',
    time: '05:00 pm',
    maxSpots: 10,
    bookedSpots: 6
  },
  // Tuesday (2025-01-07)
  {
    id: 4,
    date: '2025-01-07',
    time: '06:00 am',
    maxSpots: 10,
    bookedSpots: 3
  },
  {
    id: 5,
    date: '2025-01-07',
    time: '07:00 am',
    maxSpots: 10,
    bookedSpots: 7
  },
  {
    id: 6,
    date: '2025-01-07',
    time: '05:00 pm',
    maxSpots: 10,
    bookedSpots: 8
  },
  // Wednesday (2025-01-08)
  {
    id: 7,
    date: '2025-01-08',
    time: '06:00 am',
    maxSpots: 10,
    bookedSpots: 4
  },
  {
    id: 8,
    date: '2025-01-08',
    time: '07:00 am',
    maxSpots: 10,
    bookedSpots: 5
  },
  {
    id: 9,
    date: '2025-01-08',
    time: '05:00 pm',
    maxSpots: 10,
    bookedSpots: 9
  },
  // Thursday (2025-01-09)
  {
    id: 10,
    date: '2025-01-09',
    time: '06:00 am',
    maxSpots: 10,
    bookedSpots: 2
  },
  {
    id: 11,
    date: '2025-01-09',
    time: '07:00 am',
    maxSpots: 10,
    bookedSpots: 6
  },
  {
    id: 12,
    date: '2025-01-09',
    time: '05:00 pm',
    maxSpots: 10,
    bookedSpots: 7
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

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  console.log('=== AUTHENTICATION ===');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token received:', token ? 'YES' : 'NO');

  if (!token) {
    console.log('Token not provided');
    return res.status(401).json({ message: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Error verifying token:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Authentication routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, secretQuestion, secretAnswer } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!secretQuestion || !secretAnswer) {
      return res.status(400).json({ message: 'Secret question and answer are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecretAnswer = await bcrypt.hash(secretAnswer, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      secretQuestion,
      secretAnswer: hashedSecretAnswer,
      profile: 'user'
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User created successfully',
      access_token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        profile: newUser.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to get secret question
app.post('/auth/get-secret-question', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ secretQuestion: user.secretQuestion });
});

// Endpoint to verify secret answer
app.post('/auth/verify-secret-answer', async (req, res) => {
  const { email, answer } = req.body;
  if (!email || !answer) return res.status(400).json({ message: 'Email and answer are required.' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const valid = await bcrypt.compare(answer, user.secretAnswer);
  if (!valid) return res.status(400).json({ message: 'Incorrect secret answer.' });
  res.json({ message: 'Correct answer.' });
});

// Endpoint to reset password via secret question
app.post('/auth/reset-password-with-secret', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ message: 'Email and new password are required.' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ message: 'Password reset successfully.' });
});

// WOD routes
app.get('/api/wods', authenticateToken, (req, res) => {
  res.json(wods);
});

app.get('/api/wods/:date', authenticateToken, validateDateParam, (req, res) => {
  const { date } = req.params;
  const wod = wods.find(w => w.date === date);
  
  if (!wod) {
    return res.status(404).json({ message: 'WOD not found for the specified date' });
  }
  
  res.json(wod);
});

app.post('/api/wods', authenticateToken, (req, res) => {
  const { date, title, description } = req.body;

  if (!date || !title || !description) {
    return res.status(400).json({ message: 'Date, title and description are required' });
  }

  // Check if WOD already exists for this date
  const existingWod = wods.find(w => w.date === date);
  if (existingWod) {
    return res.status(400).json({ message: 'WOD already exists for this date' });
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

app.put('/api/wods/:date', authenticateToken, validateDateParam, (req, res) => {
  const { date } = req.params;
  const { title, description } = req.body;

  const wodIndex = wods.findIndex(w => w.date === date);
  if (wodIndex === -1) {
    return res.status(404).json({ message: 'WOD not found for the specified date' });
  }

  wods[wodIndex] = {
    ...wods[wodIndex],
    title: title || wods[wodIndex].title,
    description: description || wods[wodIndex].description
  };

  res.json(wods[wodIndex]);
});

app.delete('/api/wods/:date', authenticateToken, validateDateParam, (req, res) => {
  const { date } = req.params;
  const wodIndex = wods.findIndex(w => w.date === date);
  
  if (wodIndex === -1) {
    return res.status(404).json({ message: 'WOD not found for the specified date' });
  }

  wods.splice(wodIndex, 1);
  res.json({ message: 'WOD removed successfully' });
});

// Middleware for date validation
const validateDateParam = (req, res, next) => {
  const { date } = req.params;
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    console.log('Invalid date format:', date);
    return res.status(400).json({ 
      message: 'Invalid date format. Use YYYY-MM-DD',
      received: date 
    });
  }
  
  // Validate if date is valid
  const dateObj = new Date(date + 'T00:00:00.000Z');
  if (isNaN(dateObj.getTime())) {
    console.log('Invalid date:', date);
    return res.status(400).json({ 
      message: 'Invalid date',
      received: date 
    });
  }

  // Validate if date is not too old (more than 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  // Validate if date is not too far in the future (more than 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (dateObj < oneYearAgo || dateObj > oneYearFromNow) {
    console.log('Date outside allowed range:', date);
    return res.status(400).json({ 
      message: 'Date must be between 1 year in the past and 1 year in the future',
      received: date 
    });
  }
  
  next();
};

// Routes for Classes and Bookings
app.get('/api/classes/:date', authenticateToken, validateDateParam, (req, res) => {
  console.log('=== CLASSES ROUTE ===');
  console.log('Request for classes received:', req.params.date);
  console.log('Authenticated user:', req.user);
  
  try {
    const { date } = req.params;
    const userId = req.user.userId;
    
    console.log('Requested date:', date);
    console.log('User ID:', userId);
    
    // Check if user exists
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.email);
    
    // Log all classes before filtering
    console.log('=== ALL CLASSES IN DATABASE ===');
    console.log('Total classes:', classes.length);
    console.log('Classes:', classes.map(c => ({ id: c.id, date: c.date, time: c.time })));
    
    // Filter classes for the requested date
    const classesForDate = classes.filter(c => c.date === date);
    console.log(`=== CLASSES FOR ${date} ===`);
    console.log('Filtered classes:', classesForDate.length);
    console.log('Classes for date:', classesForDate.map(c => ({ id: c.id, date: c.date, time: c.time })));
    
    // Check if there are duplicates by time
    const timeGroups = classesForDate.reduce((acc, c) => {
      acc[c.time] = (acc[c.time] || []).concat(c);
      return acc;
    }, {});
    
    console.log('=== GROUPING BY TIME ===');
    Object.entries(timeGroups).forEach(([time, classes]) => {
      if (classes.length > 1) {
        console.log(`⚠️  DUPLICATE FOUND - Time ${time}:`, classes.map(c => ({ id: c.id, date: c.date })));
      } else {
        console.log(`✅ Time ${time}: 1 class`, classes[0].id);
      }
    });
    
    // Find user bookings for this date
    const userBookingsForDate = bookings.filter(b => 
      b.userId === userId && b.date === date
    );
    
    console.log('User bookings for this date:', userBookingsForDate);
    
    const availableClasses = classesForDate.map(c => {
      const alreadyBooked = userBookingsForDate.some(b => b.classId === c.id);
      return {
        id: c.id,
        time: c.time,
        date: c.date,
        spots: c.maxSpots - c.bookedSpots,
        spotsLeft: c.maxSpots - c.bookedSpots,
        maxSpots: c.maxSpots,
        alreadyBooked: alreadyBooked,
        status: c.status || 'active'
      };
    });
    
    console.log('=== FINAL RESPONSE ===');
    console.log('Classes returned:', availableClasses.length);
    console.log('Response:', availableClasses);
    res.json(availableClasses);
  } catch (error) {
    console.error('Error in classes route:', error);
    res.status(500).json({ message: 'Internal server error' });
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

// Rota de health check melhorada
app.get('/', (req, res) => {
  res.json({ 
    message: 'WOD Clock Backend API está funcionando!',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    endpoints: {
      auth: ['/auth/login', '/auth/register', '/auth/get-secret-question'],
      wods: ['/api/wods', '/api/wods/:date'],
      classes: ['/api/classes/:date'],
      bookings: ['/api/bookings', '/api/bookings/user']
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Middleware para capturar rotas não encontradas
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: ['/auth/login', '/auth/register'],
      api: ['/api/wods', '/api/classes/:date', '/api/bookings']
    }
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  
  // Se a resposta já foi enviada, delega para o handler padrão do Express
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
  console.log(`🔐 Endpoints de autenticação: /auth/login, /auth/register`);
  console.log(`💪 Endpoints de WOD: /api/wods`);
  console.log(`📅 Endpoints de Classes: /api/classes/:date`);
  console.log(`📋 Endpoints de Agendamentos: /api/bookings`);
  console.log(`🩺 Health check: /health`);
  console.log(`📚 Documentação: GET / para lista de endpoints`);
}); 