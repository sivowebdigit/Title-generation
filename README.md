# SKU Title Generator

A professional eCommerce product title generation application powered by OpenAI GPT-4 and Google Sheets integration.

## 🚀 Features

- **AI-Powered Title Generation**: Generate 10 unique, professional product titles (90-100 characters) using OpenAI GPT-4
- **Google Sheets Integration**: Seamlessly read product data and save generated titles to Google Sheets
- **Smart Column Management**: Fixed B-L column range for consistent title placement
- **Professional UI**: Modern, responsive web interface with Bootstrap styling
- **Real-time Validation**: Character count validation and SKU availability checks
- **Modal Popups**: Centered error modals for invalid SKUs with helpful suggestions
- **Bulk Operations**: Generate, fetch existing, add to sheet, and refresh titles
- **Title Overwrite Protection**: Prevents accidental overwrites with confirmation dialogs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your credentials:
```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
INPUT_SHEET_ID=1duCmIcUIomO2GJZaAF36JsNGDfhHO0Wh5FosxvKeT0s
OUTPUT_SHEET_ID=1duCmIcUIomO2GJZaAF36JsNGDfhHO0Wh5FosxvKeT0s
```

3. Set up Google Sheets API credentials (service account JSON file)

4. Run the application:
```bash
npm start
```

## Usage

1. Enter a SKU in the input field
2. Click "Generate" to create titles
3. Review the generated titles
4. Click "Add to Sheet" to save to Google Sheets
5. Click "Refresh" to generate new titles for the same SKU

## Google Sheets Structure

### Input Sheet (gid=0)
Contains product data with columns:
- sku, Pack, height, size, colour, material, product_type, best_keywords, shape, finish, room, bulb_type, adjustability

### Output Sheet (gid=989103065)
Will store generated titles with columns:
- sku, optimized_title, title_order_used, imagewords
