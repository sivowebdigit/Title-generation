const { GoogleSheetsService } = require('./services/googleSheets');
const { TitleGeneratorService } = require('./services/titleGenerator');

async function testSetup() {
    console.log('🚀 Testing SKU Title Generator Setup...\n');

    // Test 1: Environment variables
    console.log('1. Checking environment variables...');
    const requiredEnvVars = ['OPENAI_API_KEY', 'INPUT_SHEET_ID', 'OUTPUT_SHEET_ID'];
    let envCheck = true;

    for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
            console.log(`   ✅ ${envVar}: Set`);
        } else {
            console.log(`   ❌ ${envVar}: Missing`);
            envCheck = false;
        }
    }

    if (!envCheck) {
        console.log('\n❌ Please set up your .env file with the required variables.');
        return;
    }

    // Test 2: Google Sheets connection
    console.log('\n2. Testing Google Sheets connection...');
    try {
        const googleSheetsService = new GoogleSheetsService();
        const connectionTest = await googleSheetsService.testConnection();
        
        if (connectionTest.success) {
            console.log(`   ✅ Connected to: ${connectionTest.title}`);
            console.log(`   📄 Available sheets: ${connectionTest.sheets.join(', ')}`);
        } else {
            console.log(`   ❌ Connection failed: ${connectionTest.error}`);
        }
    } catch (error) {
        console.log(`   ❌ Google Sheets error: ${error.message}`);
    }

    // Test 3: OpenAI API
    console.log('\n3. Testing OpenAI API...');
    try {
        const titleGenerator = new TitleGeneratorService();
        // Just test the service initialization
        console.log('   ✅ OpenAI service initialized');
    } catch (error) {
        console.log(`   ❌ OpenAI error: ${error.message}`);
    }

    console.log('\n🎉 Setup test complete!');
    console.log('\nNext steps:');
    console.log('1. Make sure your Google Sheets have the correct structure');
    console.log('2. Run "npm start" to start the application');
    console.log('3. Open http://localhost:3000 in your browser');
}

// Load environment variables
require('dotenv').config();

// Run the test
testSetup().catch(console.error);
