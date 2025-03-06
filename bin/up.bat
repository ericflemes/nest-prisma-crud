@echo off
echo 🚀 Starting development environment...

REM Check if docker is running
docker info > nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Build and start containers
echo 📦 Building and starting containers...
docker-compose up -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak > nul

REM Run database migrations
echo 🔄 Running database migrations...
docker-compose exec api npx prisma migrate deploy

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo 📥 Installing dependencies...
    npm install
)

REM Generate Prisma client
echo ⚡ Generating Prisma client...
npx prisma generate

echo ✨ Development environment is ready!
echo 🌐 API is running at http://localhost:3001
echo 📊 Database is running at localhost:5432
echo.
echo Useful commands:
echo - View logs: docker-compose logs -f
echo - Stop environment: docker-compose down
echo - Run tests: npm test
