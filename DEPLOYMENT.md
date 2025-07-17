# 🚀 Deployment Guide - SKU Title Generator

## Deploy to Render (Recommended - Free)

### Step 1: Prepare Your Credentials

1. **OpenAI API Key**
   - Get your API key from https://platform.openai.com/api-keys
   - Make sure you have GPT-4 access

2. **Google Service Account**
   - Go to Google Cloud Console
   - Create a service account for Sheets API
   - Download the JSON credentials file
   - Convert to Base64: `base64 -w 0 credentials.json` (Linux/Mac) or use online converter
   - Enable Google Sheets API for your project

### Step 2: Deploy to Render

1. **Sign up at Render**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `sivowebdigit/Title-generation`
   - Choose the repository

3. **Configure Deployment**
   - **Name**: `sku-title-generator`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `master`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   Add these in Render's Environment Variables section:
   
   ```
   NODE_ENV=production
   OPENAI_API_KEY=your_actual_openai_api_key
   GOOGLE_SHEETS_SPREADSHEET_ID=1duCmIcUIomO2GJZaAF36JsNGDfhHO0Wh5FosxvKeT0s
   GOOGLE_SERVICE_ACCOUNT_KEY=your_base64_encoded_service_account_json
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - You'll get a URL like: `https://sku-title-generator.onrender.com`

### Step 3: Alternative - Railway

1. **Sign up at Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `sivowebdigit/Title-generation`
   - Set the same environment variables as above

### Step 4: Alternative - Heroku

1. **Sign up at Heroku**
   - Go to https://heroku.com
   - Create account

2. **Create App**
   - New → Create new app
   - Connect to GitHub
   - Choose your repository
   - Set environment variables in Settings → Config Vars

## 📝 Important Notes

### Free Tier Limitations:
- **Render**: 750 hours/month, app sleeps after 15 minutes of inactivity
- **Railway**: $5 credit/month (usually enough for small apps)
- **Heroku**: Limited free dyno hours

### Environment Variables Required:
- `OPENAI_API_KEY` - Your OpenAI API key
- `GOOGLE_SHEETS_SPREADSHEET_ID` - Your Google Sheets ID  
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Base64 encoded service account JSON
- `NODE_ENV=production`

### Google Sheets Setup:
- Make sure your Google Sheet is shared with the service account email
- Sheet structure should match the expected format (SKU in column A, etc.)

## 🔧 Testing Your Deployment

1. Visit your deployed URL
2. Enter a valid SKU from your Google Sheet
3. Test all functions: Generate, Fetch Existing, Add to Sheet, Refresh

## 🆘 Troubleshooting

**App won't start?**
- Check logs in hosting platform
- Verify all environment variables are set
- Ensure Google Sheet permissions are correct

**API errors?**
- Verify OpenAI API key has GPT-4 access
- Check Google service account has Sheets API enabled
- Confirm spreadsheet ID is correct

**Performance issues?**
- Free tiers may be slower
- Apps may sleep and take time to wake up
- Consider upgrading to paid tier for better performance

## 🎉 Success!

Once deployed, your SKU Title Generator will be live and accessible worldwide!
Share your live URL: `https://your-app-name.onrender.com`
