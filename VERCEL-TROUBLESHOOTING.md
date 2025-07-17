# 🚀 Vercel Deployment Checklist & Troubleshooting

## ✅ Quick Fix Checklist

### 1. Environment Variables in Vercel Dashboard
Go to https://vercel.com/sivowebdigit/title-generation/settings/environment-variables

**Required Variables:**
```
OPENAI_API_KEY=sk-proj-your-actual-key-here
GOOGLE_SHEETS_SPREADSHEET_ID=1duCmIcUIomO2GJZaAF36JsNGDfhHO0Wh5FosxvKeT0s
GOOGLE_SERVICE_ACCOUNT_KEY=your-base64-encoded-credentials
NODE_ENV=production
```

### 2. Convert Google Credentials to Base64
Run this command locally:
```bash
npm run convert-credentials
```
Or manually:
```bash
node convert-credentials.js
```

### 3. Test API Endpoints
After deployment, test these URLs:
- https://title-generation.vercel.app/api/test-connection
- https://title-generation.vercel.app/api/product/LSSS300WH

### 4. Check Vercel Function Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions" tab
4. Check for any error logs

## 🔧 Common Issues & Solutions

### Issue 1: "Internal Server Error"
**Cause:** Missing or incorrect environment variables
**Solution:** 
1. Verify all environment variables are set in Vercel
2. Make sure Base64 encoding is correct
3. Redeploy after setting variables

### Issue 2: Google Sheets API Errors
**Cause:** Service account not properly configured
**Solution:**
1. Ensure your service account has access to the spreadsheet
2. Check that Google Sheets API is enabled in Google Cloud Console
3. Verify the spreadsheet ID is correct

### Issue 3: OpenAI API Errors
**Cause:** Invalid API key or insufficient permissions
**Solution:**
1. Verify your OpenAI API key is correct
2. Ensure you have GPT-4 access
3. Check your OpenAI billing and usage limits

### Issue 4: Static Files Not Loading
**Cause:** Vercel routing configuration
**Solution:** The vercel.json has been updated to fix this

## 🧪 Testing Your Deployment

### Step 1: Basic Page Load
Visit: https://title-generation.vercel.app/
- Should see the UI with input field and buttons

### Step 2: Test API Connection
Visit: https://title-generation.vercel.app/api/test-connection
- Should return JSON with connection status

### Step 3: Test Product Data
Visit: https://title-generation.vercel.app/api/product/LSSS300WH
- Should return product data if SKU exists

### Step 4: Test Full Workflow
1. Enter a valid SKU (e.g., LSSS300WH)
2. Click "Generate"
3. Should see titles generated
4. Test other buttons

## 🔄 Redeployment Process

If you made changes:
1. Commit changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push origin master
   ```
2. Vercel will auto-deploy
3. Wait for deployment to complete
4. Test the new deployment

## 📝 Environment Variables Format

**OPENAI_API_KEY:**
```
sk-proj-1234567890abcdef...
```

**GOOGLE_SHEETS_SPREADSHEET_ID:**
```
1duCmIcUIomO2GJZaAF36JsNGDfhHO0Wh5FosxvKeT0s
```

**GOOGLE_SERVICE_ACCOUNT_KEY (Base64 encoded):**
```
eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InlvdXItcHJvamVjdCIsInByaXZhdGVfa2V5X2lkIjoiMTIzNDU2Nzg5MCIsInByaXZhdGVfa2V5IjoiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdlFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLY3dnZ1NqQWdFQUFvSUJBUUM3...
```

## 🆘 If Still Not Working

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard > Your Project > Functions
   - Look for error messages

2. **Test Locally First:**
   - Ensure your app works locally with `npm start`
   - Fix any local issues before redeploying

3. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for JavaScript errors in Console tab
   - Check Network tab for failed API calls

4. **Verify All Files Are Deployed:**
   - Check if all your files are in the GitHub repository
   - Ensure vercel.json is properly committed

## 🎯 Next Steps

Once fixed, your app should be fully functional at:
**https://title-generation.vercel.app/**

All features should work:
- ✅ Generate titles
- ✅ Fetch existing titles  
- ✅ Add to sheet
- ✅ Refresh functionality
- ✅ SKU not found modal
