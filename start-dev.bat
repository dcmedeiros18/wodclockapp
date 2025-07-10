@echo off
echo ========================================
echo    WOD Clock App - Iniciando Servicos
echo ========================================
echo.

echo [1/4] Verificando se Node.js esta instalado...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/4] Instalando dependencias do frontend...
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)
echo ✓ Dependencias do frontend instaladas

echo.
echo [3/4] Instalando dependencias do backend...
cd backend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
echo ✓ Dependencias do backend instaladas
cd ..

echo.
echo [4/4] Iniciando servicos...
echo.
echo Iniciando Backend na porta 3000...
start "Backend" cmd /k "cd backend && npm start"

echo Aguardando 3 segundos para o backend inicializar...
timeout /t 3 /nobreak >nul

echo Iniciando Frontend na porta 8100...
start "Frontend" cmd /k "npm start"

echo.
echo ========================================
echo    Servicos iniciados com sucesso!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:8100
echo 🔧 Backend:  http://localhost:3000
echo.
echo 🔐 Credenciais de teste:
echo    Email: admin@wodclock.com
echo    Senha: password
echo.
echo Pressione qualquer tecla para sair...
pause >nul 