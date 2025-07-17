const { google } = require('googleapis');
const path = require('path');

class GoogleSheetsService {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.inputSheetId = process.env.INPUT_SHEET_ID;
        this.outputSheetId = process.env.OUTPUT_SHEET_ID;
        this.initializeAuth();
    }

    async initializeAuth() {
        try {
            // Try service account authentication first
            if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
                this.auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets']
                });
            } else if (process.env.GOOGLE_SHEETS_API_KEY) {
                // Fallback to API key (read-only)
                this.auth = process.env.GOOGLE_SHEETS_API_KEY;
            } else {
                // Try to load from credentials.json file
                const credentialsPath = path.join(__dirname, '..', 'credentials.json');
                try {
                    this.auth = new google.auth.GoogleAuth({
                        keyFile: credentialsPath,
                        scopes: ['https://www.googleapis.com/auth/spreadsheets']
                    });
                } catch (fileError) {
                    console.warn('No Google Sheets authentication found. Please set up credentials.');
                    return;
                }
            }

            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
        } catch (error) {
            console.error('Error initializing Google Sheets authentication:', error);
        }
    }

    async getProductBySku(sku) {
        if (!this.sheets) {
            throw new Error('Google Sheets not initialized. Please check your authentication.');
        }

        try {
            console.log(`Fetching product data for SKU: ${sku}`);
            
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.inputSheetId,
                range: 'A:M', // Adjust range based on your sheet structure
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                throw new Error('No data found in input sheet');
            }

            // Assuming first row contains headers
            const headers = rows[0].map(header => header.toLowerCase().trim());
            const dataRows = rows.slice(1);

            console.log('Headers found:', headers);

            // Find the row with matching SKU
            const skuIndex = headers.findIndex(header => 
                header.includes('sku')
            );

            if (skuIndex === -1) {
                throw new Error('SKU column not found. Available headers: ' + headers.join(', '));
            }

            const productRow = dataRows.find(row => 
                row[skuIndex] && row[skuIndex].toString().trim().toUpperCase() === sku.toUpperCase()
            );
            
            if (!productRow) {
                console.log('Available SKUs:', dataRows.map(row => row[skuIndex]).filter(Boolean));
                return null;
            }

            // Map the data to expected format
            const productData = {
                sku: productRow[skuIndex] || '',
                Pack: this.getValueByHeader(headers, productRow, ['pack']),
                height: this.getValueByHeader(headers, productRow, ['height']),
                size: this.getValueByHeader(headers, productRow, ['size']),
                colour: this.getValueByHeader(headers, productRow, ['colour', 'color']),
                material: this.getValueByHeader(headers, productRow, ['material']),
                product_type: this.getValueByHeader(headers, productRow, ['product_type', 'product type', 'type']),
                best_keywords: this.getValueByHeader(headers, productRow, ['best_keywords', 'keywords', 'best keywords']),
                shape: this.getValueByHeader(headers, productRow, ['shape']),
                finish: this.getValueByHeader(headers, productRow, ['finish']),
                room: this.getValueByHeader(headers, productRow, ['room']),
                bulb_type: this.getValueByHeader(headers, productRow, ['bulb_type', 'bulb type', 'bulb']),
                adjustability: this.getValueByHeader(headers, productRow, ['adjustability', 'adjustable'])
            };

            console.log('Product data found:', productData);
            return productData;
        } catch (error) {
            console.error('Error fetching product data:', error);
            throw error;
        }
    }

    getValueByHeader(headers, row, possibleNames) {
        for (const name of possibleNames) {
            const index = headers.findIndex(header => 
                header.includes(name.toLowerCase())
            );
            if (index !== -1 && row[index]) {
                return row[index].toString().trim();
            }
        }
        return '';
    }

    async addTitlesToSheet(titles, imagewords) {
        if (!this.sheets) {
            throw new Error('Google Sheets not initialized. Please check your authentication.');
        }

        try {
            console.log(`Adding ${titles.length} titles to SKU titles sheet`);
            
            if (!titles || titles.length === 0) {
                throw new Error('No titles to add to sheet');
            }

            const sku = titles[0].sku; // Get the SKU from the first title
            console.log(`Looking for SKU: ${sku} in the SKU titles sheet`);

            // Get all data from the "SKU titles" sheet to find the SKU row
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.inputSheetId,
                range: 'SKU titles!A:Z', // Get wide range from "SKU titles" sheet
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                throw new Error('No data found in SKU titles sheet');
            }

            // Find headers and SKU column
            const headers = rows[0].map(header => header.toLowerCase().trim());
            const dataRows = rows.slice(1);

            const skuIndex = headers.findIndex(header => header.includes('sku'));
            if (skuIndex === -1) {
                throw new Error('SKU column not found in SKU titles sheet');
            }

            // Find the row with matching SKU
            const skuRowIndex = dataRows.findIndex(row => 
                row[skuIndex] && row[skuIndex].toString().trim().toUpperCase() === sku.toUpperCase()
            );

            if (skuRowIndex === -1) {
                throw new Error(`SKU ${sku} not found in SKU titles sheet`);
            }

            // Calculate the actual row number (add 2: 1 for 0-index, 1 for header row)
            const actualRowNumber = skuRowIndex + 2;
            console.log(`Found SKU ${sku} at row ${actualRowNumber} in SKU titles sheet`);

            // Check if titles already exist for this SKU in columns B-L
            const skuRow = dataRows[skuRowIndex];
            let hasExistingTitles = false;
            
            // Check specifically columns B to L (indices 1 to 11) for existing titles
            for (let i = 1; i <= 11; i++) {
                if (skuRow[i] && skuRow[i].toString().trim()) {
                    hasExistingTitles = true;
                    break;
                }
            }

            if (hasExistingTitles) {
                console.log(`SKU ${sku} already has titles in columns B-L. Preventing overwrite.`);
                throw new Error(`SKU ${sku} already has titles in columns B-L. Use "Fetch Existing" to view them or manually clear the titles before adding new ones.`);
            }

            // Use fixed range B-L (columns 1-11) for titles
            const titleStartColumn = 1; // Column B (0=A, 1=B)
            const titleEndColumn = 11;   // Column L (0=A, 1=B, ..., 11=L)
            const titleHeaders = ['Generated Title 1', 'Generated Title 2', 'Generated Title 3', 'Generated Title 4', 'Generated Title 5', 
                               'Generated Title 6', 'Generated Title 7', 'Generated Title 8', 'Generated Title 9', 'Generated Title 10', 'Image Words'];
            
            // Check if headers need to be added in B1:L1
            const currentHeaderRow = rows[0];
            const needsHeaders = !currentHeaderRow[titleStartColumn] || currentHeaderRow[titleStartColumn].toString().toLowerCase() !== 'generated title 1';
            
            if (needsHeaders) {
                console.log(`Adding title headers in columns B-L in SKU titles sheet`);
                
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.inputSheetId,
                    range: `SKU titles!B1:L1`,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [titleHeaders]
                    }
                });
            }

            // Prepare the title data for the specific SKU row
            const titleValues = titles.slice(0, 10).map(title => title.optimized_title);
            // Pad with empty strings if less than 10 titles
            while (titleValues.length < 10) {
                titleValues.push('');
            }
            // Add imagewords at the end
            titleValues.push(imagewords || '');

            // Update the specific row in columns B-L
            const range = `SKU titles!B${actualRowNumber}:L${actualRowNumber}`;
            
            console.log(`Updating range: ${range} with ${titleValues.length} values in SKU titles sheet`);

            const result = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.inputSheetId,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: [titleValues]
                }
            });

            console.log(`Successfully added ${titleValues.length} titles to row ${actualRowNumber} for SKU ${sku} in SKU titles sheet`);
            return result;
        } catch (error) {
            console.error('Error adding titles to SKU titles sheet:', error);
            throw error;
        }
    }

    async forceUpdateTitlesToSheet(titles, imagewords) {
        if (!this.sheets) {
            throw new Error('Google Sheets not initialized. Please check your authentication.');
        }

        try {
            console.log(`Force updating ${titles.length} titles to SKU titles sheet (overwriting existing)`);
            
            if (!titles || titles.length === 0) {
                throw new Error('No titles to add to sheet');
            }

            const sku = titles[0].sku; // Get the SKU from the first title
            console.log(`Looking for SKU: ${sku} in the SKU titles sheet`);

            // Get all data from the "SKU titles" sheet to find the SKU row
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.inputSheetId,
                range: 'SKU titles!A:Z', // Get wide range from "SKU titles" sheet
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                throw new Error('No data found in SKU titles sheet');
            }

            // Find headers and SKU column
            const headers = rows[0].map(header => header.toLowerCase().trim());
            const dataRows = rows.slice(1);

            const skuIndex = headers.findIndex(header => header.includes('sku'));
            if (skuIndex === -1) {
                throw new Error('SKU column not found in SKU titles sheet');
            }

            // Find the row with matching SKU
            const skuRowIndex = dataRows.findIndex(row => 
                row[skuIndex] && row[skuIndex].toString().trim().toUpperCase() === sku.toUpperCase()
            );

            if (skuRowIndex === -1) {
                throw new Error(`SKU ${sku} not found in SKU titles sheet`);
            }

            // Calculate the actual row number (add 2: 1 for 0-index, 1 for header row)
            const actualRowNumber = skuRowIndex + 2;
            console.log(`Found SKU ${sku} at row ${actualRowNumber} in SKU titles sheet - FORCE UPDATING`);

            // Use fixed range B-L (columns 1-11) for titles
            const titleStartColumn = 1; // Column B (0=A, 1=B)
            const titleEndColumn = 11;   // Column L (0=A, 1=B, ..., 11=L)
            const titleHeaders = ['Generated Title 1', 'Generated Title 2', 'Generated Title 3', 'Generated Title 4', 'Generated Title 5', 
                               'Generated Title 6', 'Generated Title 7', 'Generated Title 8', 'Generated Title 9', 'Generated Title 10', 'Image Words'];
            
            // Check if headers need to be added in B1:L1
            const currentHeaderRow = rows[0];
            const needsHeaders = !currentHeaderRow[titleStartColumn] || currentHeaderRow[titleStartColumn].toString().toLowerCase() !== 'generated title 1';
            
            if (needsHeaders) {
                console.log(`Adding title headers in columns B-L in SKU titles sheet`);
                
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.inputSheetId,
                    range: `SKU titles!B1:L1`,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [titleHeaders]
                    }
                });
            }

            // Prepare the title data for the specific SKU row
            const titleValues = titles.slice(0, 10).map(title => title.optimized_title);
            // Pad with empty strings if less than 10 titles
            while (titleValues.length < 10) {
                titleValues.push('');
            }
            // Add imagewords at the end
            titleValues.push(imagewords || '');

            // Update the specific row in columns B-L (FORCE UPDATE)
            const range = `SKU titles!B${actualRowNumber}:L${actualRowNumber}`;
            
            console.log(`FORCE updating range: ${range} with ${titleValues.length} values in SKU titles sheet`);

            const result = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.inputSheetId,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: [titleValues]
                }
            });

            console.log(`Successfully FORCE updated ${titleValues.length} titles to row ${actualRowNumber} for SKU ${sku} in SKU titles sheet`);
            return result;
        } catch (error) {
            console.error('Error force updating titles to SKU titles sheet:', error);
            throw error;
        }
    }

    async regenerateTitlesToSheet(titles, imagewords) {
        if (!this.sheets) {
            throw new Error('Google Sheets not initialized. Please check your authentication.');
        }

        try {
            console.log(`Regenerating ${titles.length} titles to SKU titles sheet (replacing existing in B-L)`);
            
            if (!titles || titles.length === 0) {
                throw new Error('No titles to add to sheet');
            }

            const sku = titles[0].sku; // Get the SKU from the first title
            console.log(`Looking for SKU: ${sku} in the SKU titles sheet for regeneration`);

            // Get all data from the "SKU titles" sheet to find the SKU row
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.inputSheetId,
                range: 'SKU titles!A:Z', // Get wide range from "SKU titles" sheet
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                throw new Error('No data found in SKU titles sheet');
            }

            // Find headers and SKU column
            const headers = rows[0].map(header => header.toLowerCase().trim());
            const dataRows = rows.slice(1);

            const skuIndex = headers.findIndex(header => header.includes('sku'));
            if (skuIndex === -1) {
                throw new Error('SKU column not found in SKU titles sheet');
            }

            // Find the row with matching SKU
            const skuRowIndex = dataRows.findIndex(row => 
                row[skuIndex] && row[skuIndex].toString().trim().toUpperCase() === sku.toUpperCase()
            );

            if (skuRowIndex === -1) {
                throw new Error(`SKU ${sku} not found in SKU titles sheet`);
            }

            // Calculate the actual row number (add 2: 1 for 0-index, 1 for header row)
            const actualRowNumber = skuRowIndex + 2;
            console.log(`Found SKU ${sku} at row ${actualRowNumber} in SKU titles sheet - REGENERATING`);

            // Use fixed range B-L (columns 1-11) for titles
            const titleHeaders = ['Generated Title 1', 'Generated Title 2', 'Generated Title 3', 'Generated Title 4', 'Generated Title 5', 
                               'Generated Title 6', 'Generated Title 7', 'Generated Title 8', 'Generated Title 9', 'Generated Title 10', 'Image Words'];
            
            // Check if headers need to be added in B1:L1
            const currentHeaderRow = rows[0];
            const needsHeaders = !currentHeaderRow[1] || currentHeaderRow[1].toString().toLowerCase() !== 'generated title 1';
            
            if (needsHeaders) {
                console.log(`Adding title headers in columns B-L in SKU titles sheet`);
                
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.inputSheetId,
                    range: `SKU titles!B1:L1`,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [titleHeaders]
                    }
                });
            }

            // Prepare the title data for the specific SKU row
            const titleValues = titles.slice(0, 10).map(title => title.optimized_title);
            // Pad with empty strings if less than 10 titles
            while (titleValues.length < 10) {
                titleValues.push('');
            }
            // Add imagewords at the end
            titleValues.push(imagewords || '');

            // Update the specific row in columns B-L (REGENERATE - always replace)
            const range = `SKU titles!B${actualRowNumber}:L${actualRowNumber}`;
            
            console.log(`REGENERATING range: ${range} with ${titleValues.length} values in SKU titles sheet`);

            const result = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.inputSheetId,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: [titleValues]
                }
            });

            console.log(`Successfully REGENERATED ${titleValues.length} titles to row ${actualRowNumber} for SKU ${sku} in SKU titles sheet`);
            return result;
        } catch (error) {
            console.error('Error regenerating titles to SKU titles sheet:', error);
            throw error;
        }
    }

    // Helper function to convert column number to letter (0=A, 1=B, etc.)
    numberToColumn(num) {
        let result = '';
        while (num >= 0) {
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26) - 1;
        }
        return result;
    }

    async fetchExistingTitles(sku) {
        if (!this.sheets) {
            throw new Error('Google Sheets not initialized. Please check your authentication.');
        }

        try {
            console.log(`Fetching existing titles for SKU: ${sku} from SKU titles sheet`);

            // Get all data from the "SKU titles" sheet
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.inputSheetId,
                range: 'SKU titles!A:Z', // Get wide range from "SKU titles" sheet
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                throw new Error('No data found in SKU titles sheet');
            }

            // Find headers and SKU column
            const headers = rows[0].map(header => header.toLowerCase().trim());
            const dataRows = rows.slice(1);

            const skuIndex = headers.findIndex(header => header.includes('sku'));
            if (skuIndex === -1) {
                throw new Error('SKU column not found in SKU titles sheet');
            }

            // Find the row with matching SKU
            const skuRowIndex = dataRows.findIndex(row => 
                row[skuIndex] && row[skuIndex].toString().trim().toUpperCase() === sku.toUpperCase()
            );

            if (skuRowIndex === -1) {
                console.log(`SKU ${sku} not found in SKU titles sheet`);
                return null;
            }

            const skuRow = dataRows[skuRowIndex];
            console.log(`Found SKU ${sku} at row ${skuRowIndex + 2} in SKU titles sheet`);

            // Extract existing titles from columns B-L (indices 1-11)
            const existingTitles = [];
            let imagewords = '';

            // Columns B-K are titles (indices 1-10), Column L is image words (index 11)
            for (let i = 1; i <= 10; i++) {
                if (skuRow[i] && skuRow[i].toString().trim()) {
                    existingTitles.push({
                        sku: sku,
                        optimized_title: skuRow[i].toString().trim(),
                        title_order_used: ''
                    });
                }
            }

            // Column L (index 11) is image words
            if (skuRow[11] && skuRow[11].toString().trim()) {
                imagewords = skuRow[11].toString().trim();
            }

            console.log(`Found ${existingTitles.length} existing titles for SKU ${sku} in SKU titles sheet (columns B-L)`);

            return {
                sku: sku,
                titles: existingTitles,
                imagewords: imagewords
            };

        } catch (error) {
            console.error('Error fetching existing titles from SKU titles sheet:', error);
            throw error;
        }
    }

    // Test connection method
    async testConnection() {
        try {
            if (!this.sheets) {
                throw new Error('Sheets not initialized');
            }

            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.inputSheetId
            });

            return {
                success: true,
                title: response.data.properties.title,
                sheets: response.data.sheets.map(sheet => sheet.properties.title)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = { GoogleSheetsService };
