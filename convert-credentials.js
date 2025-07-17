const fs = require('fs');
const path = require('path');

// Script to convert Google Service Account JSON to Base64 for Vercel deployment
function convertCredentialsToBase64() {
    const credentialsPath = path.join(__dirname, 'credentials.json');
    
    console.log('🔧 Google Credentials Base64 Converter for Vercel');
    console.log('=================================================');
    console.log('');
    
    try {
        if (!fs.existsSync(credentialsPath)) {
            console.log('❌ credentials.json file not found!');
            console.log('');
            console.log('📝 Instructions:');
            console.log('1. Download your Google Service Account JSON file');
            console.log('2. Rename it to "credentials.json"');
            console.log('3. Place it in the root directory of this project');
            console.log('4. Run this script again: node convert-credentials.js');
            console.log('');
            return;
        }
        
        const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
        
        // Validate JSON format
        try {
            JSON.parse(credentialsContent);
        } catch (jsonError) {
            console.log('❌ Invalid JSON format in credentials.json');
            console.log('Please ensure the file contains valid JSON data.');
            return;
        }
        
        const base64Credentials = Buffer.from(credentialsContent).toString('base64');
        
        console.log('✅ Successfully converted credentials to Base64!');
        console.log('');
        console.log('🔑 Copy this Base64 string for Vercel Environment Variables:');
        console.log('');
        console.log('Variable Name: GOOGLE_SERVICE_ACCOUNT_KEY');
        console.log('Variable Value:');
        console.log('─'.repeat(80));
        console.log(base64Credentials);
        console.log('─'.repeat(80));
        console.log('');
        
        // Save to file for easy copying
        const outputFile = 'credentials-base64.txt';
        fs.writeFileSync(outputFile, base64Credentials);
        console.log(`💾 Also saved to "${outputFile}" file for easy copying`);
        console.log('');
        
        console.log('📋 Next Steps for Vercel Deployment:');
        console.log('1. Copy the Base64 string above');
        console.log('2. Go to your Vercel project settings');
        console.log('3. Navigate to "Environment Variables"');
        console.log('4. Add new variable:');
        console.log('   Name: GOOGLE_SERVICE_ACCOUNT_KEY');
        console.log('   Value: <paste the Base64 string>');
        console.log('5. Click "Save"');
        console.log('6. Redeploy your project');
        console.log('');
        console.log('🎉 Your app will then have access to Google Sheets!');
        
    } catch (error) {
        console.error('❌ Error converting credentials:', error.message);
        console.log('');
        console.log('🆘 Troubleshooting:');
        console.log('- Ensure credentials.json exists in the root directory');
        console.log('- Check that the file contains valid JSON');
        console.log('- Verify you have read permissions for the file');
    }
}

// Check if running directly
if (require.main === module) {
    convertCredentialsToBase64();
}

module.exports = { convertCredentialsToBase64 };
