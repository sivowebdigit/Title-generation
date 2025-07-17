const fs = require('fs');
const path = require('path');

// Script to convert Google Service Account JSON to Base64 for deployment
function convertCredentialsToBase64() {
    const credentialsPath = path.join(__dirname, 'credentials.json');
    
    try {
        if (!fs.existsSync(credentialsPath)) {
            console.log('❌ credentials.json file not found!');
            console.log('📝 Please place your Google Service Account JSON file as "credentials.json" in the root directory.');
            return;
        }
        
        const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
        const base64Credentials = Buffer.from(credentialsContent).toString('base64');
        
        console.log('✅ Successfully converted credentials to Base64!');
        console.log('');
        console.log('🔑 Copy this Base64 string for GOOGLE_SERVICE_ACCOUNT_KEY environment variable:');
        console.log('');
        console.log(base64Credentials);
        console.log('');
        console.log('📋 Instructions:');
        console.log('1. Copy the Base64 string above');
        console.log('2. In Render/Railway/Heroku, set environment variable:');
        console.log('   GOOGLE_SERVICE_ACCOUNT_KEY = <paste the Base64 string>');
        console.log('');
        
        // Save to file for easy copying
        fs.writeFileSync('credentials-base64.txt', base64Credentials);
        console.log('💾 Also saved to "credentials-base64.txt" file for easy copying');
        
    } catch (error) {
        console.error('❌ Error converting credentials:', error.message);
    }
}

console.log('🔧 Google Credentials Base64 Converter');
console.log('=====================================');
convertCredentialsToBase64();
