@echo off
echo Setting up SKU Title Generator...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
npm install

:: Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo.
    echo Please edit the .env file and add your API keys:
    echo - OPENAI_API_KEY: Your OpenAI API key
    echo - GOOGLE_SHEETS_API_KEY: Your Google Sheets API key
    echo.
    echo You can also set up service account authentication for Google Sheets.
    echo.
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit the .env file with your API keys
echo 2. Set up Google Sheets API authentication
echo 3. Run 'npm start' to start the application
echo.
pause
