# Setup Instructions for SKU Title Generator

## Prerequisites

1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org/)
2. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Google Sheets API Access**: Set up through Google Cloud Console

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:
```powershell
npm install
```

## Step 2: Set up Environment Variables

1. Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

2. Edit the `.env` file with your credentials:
```
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
INPUT_SHEET_ID=1duCmIcUIomO2GJZaAF36JsNGDfhHO0Wh5FosxvKeT0s
OUTPUT_SHEET_ID=1duCmIcUIomO2GJZaAF36JsNGDfhHO0Wh5FosxvKeT0s
PORT=3000
```

## Step 3: Google Sheets API Setup

### Option A: API Key (Recommended for read access)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Sheets API
4. Create credentials → API Key
5. Add the API key to your `.env` file

### Option B: Service Account (Recommended for write access)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Sheets API
4. Create credentials → Service Account
5. Download the JSON key file
6. Either:
   - Save as `credentials.json` in the project root, OR
   - Add the entire JSON content to `.env` as `GOOGLE_SERVICE_ACCOUNT_KEY`

## Step 4: Configure Google Sheets

### Input Sheet Structure
Your input sheet should have these columns (case-insensitive):
- sku
- pack
- height
- size
- colour (or color)
- material
- product_type (or product type)
- best_keywords (or keywords)
- shape
- finish
- room
- bulb_type (or bulb type)
- adjustability (or adjustable)

### Output Sheet
The application will automatically create headers in your output sheet:
- SKU
- Optimized Title
- Title Order Used
- Image Words

## Step 5: Run the Application

```powershell
npm start
```

Or for development with auto-restart:
```powershell
npm run dev
```

## Step 6: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## Testing the Setup

1. Visit `http://localhost:3000/api/health` to check if the server is running
2. Visit `http://localhost:3000/api/test-connection` to test Google Sheets connection

## Troubleshooting

### Common Issues:

1. **"SKU not found"**
   - Check that your SKU exists in the input sheet
   - Verify the input sheet ID is correct
   - Ensure the SKU column is properly named

2. **"Google Sheets not initialized"**
   - Check your Google Sheets API credentials
   - Verify the sheet IDs are correct
   - Make sure the sheets are publicly accessible or your service account has access

3. **"Failed to generate titles"**
   - Check your OpenAI API key
   - Verify you have sufficient API credits
   - Check the console for detailed error messages

4. **Permission denied errors**
   - Make sure your Google Sheets are shared with the service account email
   - Or make them publicly accessible with "Anyone with the link can view"

### Sheet Access Setup:
1. Open your Google Sheet
2. Click "Share" button
3. Either:
   - Change to "Anyone with the link" can view/edit, OR
   - Add your service account email (from credentials.json) with Editor access

## Usage

1. Enter a SKU in the input field
2. Click "Generate" to create titles
3. Review the generated titles (only 180-200 character titles are valid)
4. Click "Add to Sheet" to save to your output Google Sheet
5. Click "Refresh" to generate new titles for the same SKU

## Notes

- The application generates exactly 10 titles per SKU
- Only titles between 180-200 characters are considered valid
- Invalid titles are highlighted in red
- The "imagewords" field contains keywords for AI image generation based on unused product fields
