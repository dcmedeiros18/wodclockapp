#!/bin/bash

echo "========================================"
echo "   WOD Clock App - Iniciando Servicos"
echo "========================================"
echo

echo "[1/4] Verificando se Node.js esta instalado..."
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js nao encontrado. Instale o Node.js primeiro."
    exit 1
fi
echo "✓ Node.js encontrado"

echo
echo "[2/4] Instalando dependencias do frontend..."
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependencias do frontend"
    exit 1
fi
echo "✓ Dependencias do frontend instaladas"

echo
echo "[3/4] Instalando dependencias do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependencias do backend"
    exit 1
fi
echo "✓ Dependencias do backend instaladas"
cd ..

echo
echo "[4/4] Iniciando servicos..."
echo

echo "Iniciando Backend na porta 3000..."
gnome-terminal --title="Backend" -- bash -c "cd backend && npm start; exec bash" 2>/dev/null || \
xterm -title "Backend" -e "cd backend && npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd backend && npm start"' 2>/dev/null || \
echo "Inicie manualmente: cd backend && npm start"

echo "Aguardando 3 segundos para o backend inicializar..."
sleep 3

echo "Iniciando Frontend na porta 8100..."
gnome-terminal --title="Frontend" -- bash -c "npm start; exec bash" 2>/dev/null || \
xterm -title "Frontend" -e "npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "npm start"' 2>/dev/null || \
echo "Inicie manualmente: npm start"

echo
echo "========================================"
echo "   Servicos iniciados com sucesso!"
echo "========================================"
echo
echo "📱 Frontend: http://localhost:8100"
echo "🔧 Backend:  http://localhost:3000"
echo
echo "🔐 Credenciais de teste:"
echo "   Email: admin@wodclock.com"
echo "   Senha: password"
echo 