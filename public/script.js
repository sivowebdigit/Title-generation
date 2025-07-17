class TitleGeneratorApp {
    constructor() {
        this.currentSku = null;
        this.currentTitles = null;
        this.currentImageWords = null;
        this.loadingModal = null;
        
        this.initializeEventListeners();
        this.initializeModal();
    }

    initializeEventListeners() {
        // Button event listeners
        document.getElementById('generateBtn').addEventListener('click', () => this.generateTitles());
        document.getElementById('fetchExistingBtn').addEventListener('click', () => this.fetchExistingTitles());
        document.getElementById('addToSheetBtn').addEventListener('click', () => this.addToSheet());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshTitles());
        
        // Enter key support for SKU input
        document.getElementById('skuInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateTitles();
            }
        });
    }

    initializeModal() {
        this.loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'), {
            backdrop: 'static',
            keyboard: false
        });

        this.skuNotFoundModal = new bootstrap.Modal(document.getElementById('skuNotFoundModal'), {
            backdrop: 'static',
            keyboard: false
        });
    }

    async generateTitles() {
        const skuInput = document.getElementById('skuInput');
        const sku = skuInput.value.trim();

        if (!sku) {
            this.showMessage('Please enter a SKU', 'warning');
            return;
        }

        try {
            this.showLoading('Fetching product data...');
            
            // First, get product data
            const productResponse = await fetch(`/api/product/${sku}`);
            if (!productResponse.ok) {
                if (productResponse.status === 404) {
                    throw new Error('SKU not found in the database');
                }
                throw new Error('Failed to fetch product data');
            }

            const productData = await productResponse.json();
            this.displayProductData(productData);

            this.updateLoadingText('Generating titles with AI...');

            // Generate titles
            const titlesResponse = await fetch('/api/generate-titles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sku })
            });

            if (!titlesResponse.ok) {
                throw new Error('Failed to generate titles');
            }

            const titleData = await titlesResponse.json();
            
            this.currentSku = sku;
            this.currentTitles = titleData.titles;
            this.currentImageWords = titleData.imagewords;
            
            this.displayTitles(titleData.titles);
            this.displayImageWords(titleData.imagewords);
            this.enableButtons();
            
            this.hideLoading();
            this.showMessage(`Generated ${titleData.titles.length} titles successfully!`, 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error:', error);
            
            // Show SKU not found modal for specific error
            if (error.message === 'SKU not found in the database') {
                this.showSkuNotFoundModal(sku);
            } else {
                this.showMessage(error.message, 'danger');
            }
        }
    }

    async fetchExistingTitles() {
        const skuInput = document.getElementById('skuInput');
        const sku = skuInput.value.trim();

        if (!sku) {
            this.showMessage('Please enter a SKU', 'warning');
            return;
        }

        try {
            this.showLoading('Fetching existing titles from SKU titles sheet...');
            
            // First, get product data to display
            const productResponse = await fetch(`/api/product/${sku}`);
            if (!productResponse.ok) {
                if (productResponse.status === 404) {
                    throw new Error('SKU not found in the database');
                }
                throw new Error('Failed to fetch product data');
            }

            const productData = await productResponse.json();
            this.displayProductData(productData);

            // Fetch existing titles from SKU titles sheet
            const titlesResponse = await fetch(`/api/fetch-titles/${sku}`);
            if (!titlesResponse.ok) {
                if (titlesResponse.status === 404) {
                    throw new Error('No existing titles found for this SKU in the SKU titles sheet');
                }
                throw new Error('Failed to fetch existing titles');
            }

            const existingData = await titlesResponse.json();
            
            this.currentSku = sku;
            this.currentTitles = existingData.titles;
            this.currentImageWords = existingData.imagewords;
            
            this.displayTitles(existingData.titles);
            this.displayImageWords(existingData.imagewords);
            this.enableButtons();
            
            this.hideLoading();
            this.showMessage(`Fetched ${existingData.titles.length} existing titles from SKU titles sheet!`, 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error:', error);
            
            // Show SKU not found modal for specific error
            if (error.message === 'No existing titles found for this SKU in the SKU titles sheet') {
                this.showSkuNotFoundModal(sku);
            } else {
                this.showMessage(error.message, 'danger');
            }
        }
    }

    async addToSheet() {
        if (!this.currentTitles || !this.currentImageWords) {
            this.showMessage('No titles to add. Please generate titles first.', 'warning');
            return;
        }

        try {
            this.showLoading('Adding titles to Google Sheet...');

            const response = await fetch('/api/add-to-sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titles: this.currentTitles,
                    imagewords: this.currentImageWords
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'TITLES_EXIST') {
                    this.hideLoading();
                    // Show confirmation dialog for overwriting
                    const shouldOverwrite = confirm(
                        `${data.error}\n\nDo you want to overwrite the existing titles with the new ones?`
                    );
                    
                    if (shouldOverwrite) {
                        await this.forceUpdateSheet();
                    } else {
                        this.showMessage('Add to sheet cancelled. Existing titles preserved.', 'info');
                    }
                    return;
                } else {
                    throw new Error(data.error || 'Failed to add titles to sheet');
                }
            }

            this.hideLoading();
            this.showMessage('Titles successfully added to Google Sheet!', 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error:', error);
            this.showMessage(error.message, 'danger');
        }
    }

    async forceUpdateSheet() {
        if (!this.currentTitles || !this.currentImageWords) {
            this.showMessage('No titles to update. Please generate titles first.', 'warning');
            return;
        }

        try {
            this.showLoading('Overwriting existing titles in Google Sheet...');

            const response = await fetch('/api/force-update-sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titles: this.currentTitles,
                    imagewords: this.currentImageWords
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to force update titles to sheet');
            }

            this.hideLoading();
            this.showMessage('Titles successfully overwritten in Google Sheet!', 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error:', error);
            this.showMessage(error.message, 'danger');
        }
    }

    async refreshTitles() {
        if (!this.currentSku) {
            this.showMessage('No SKU selected. Please generate titles first.', 'warning');
            return;
        }

        try {
            this.showLoading('Regenerating titles with AI...');

            // Generate new titles
            const titlesResponse = await fetch('/api/generate-titles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sku: this.currentSku })
            });

            if (!titlesResponse.ok) {
                throw new Error('Failed to generate new titles');
            }

            const titleData = await titlesResponse.json();
            
            this.currentTitles = titleData.titles;
            this.currentImageWords = titleData.imagewords;
            
            this.displayTitles(titleData.titles);
            this.displayImageWords(titleData.imagewords);

            this.updateLoadingText('Regenerating titles in sheet (replacing existing in B-L)...');

            // Automatically regenerate (replace) in sheet
            const regenerateResponse = await fetch('/api/regenerate-titles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titles: this.currentTitles,
                    imagewords: this.currentImageWords
                })
            });

            if (!regenerateResponse.ok) {
                const data = await regenerateResponse.json();
                throw new Error(data.error || 'Failed to regenerate titles in sheet');
            }
            
            this.hideLoading();
            this.showMessage(`Regenerated ${titleData.titles.length} new titles and updated them in columns B-L!`, 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error:', error);
            this.showMessage(error.message, 'danger');
        }
    }

    displayProductData(productData) {
        const productDataCard = document.getElementById('productDataCard');
        const productDataContent = document.getElementById('productDataContent');

        const fields = [
            { label: 'SKU', value: productData.sku },
            { label: 'Pack', value: productData.Pack },
            { label: 'Height', value: productData.height },
            { label: 'Size', value: productData.size },
            { label: 'Colour', value: productData.colour },
            { label: 'Material', value: productData.material },
            { label: 'Product Type', value: productData.product_type },
            { label: 'Best Keywords', value: productData.best_keywords },
            { label: 'Shape', value: productData.shape },
            { label: 'Finish', value: productData.finish },
            { label: 'Room', value: productData.room },
            { label: 'Bulb Type', value: productData.bulb_type },
            { label: 'Adjustability', value: productData.adjustability }
        ];

        const gridHtml = fields
            .filter(field => field.value) // Only show fields with values
            .map(field => `
                <div class="product-data-item">
                    <div class="product-data-label">${field.label}:</div>
                    <div class="product-data-value">${field.value}</div>
                </div>
            `).join('');

        productDataContent.innerHTML = `<div class="product-data-grid">${gridHtml}</div>`;
        productDataCard.style.display = 'block';
    }

    displayTitles(titles) {
        const titlesCard = document.getElementById('titlesCard');
        const titlesContent = document.getElementById('titlesContent');
        const titleCount = document.getElementById('titleCount');

        titleCount.textContent = `${titles.length} titles generated`;

        const titlesHtml = titles.map((title, index) => {
            const charCount = title.optimized_title.length;

            return `
                <div class="title-item">
                    <div class="title-text">${title.optimized_title}</div>
                    <div class="title-meta">
                        <span>Order: ${title.title_order_used}</span>
                        <span class="char-count">
                            ${charCount} characters
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        titlesContent.innerHTML = titlesHtml;
        titlesCard.style.display = 'block';
    }

    displayImageWords(imageWords) {
        const imageWordsCard = document.getElementById('imageWordsCard');
        const imageWordsContent = document.getElementById('imageWordsContent');

        imageWordsContent.innerHTML = `
            <div class="image-words-container">
                <strong>Keywords for AI Image Generation:</strong><br>
                ${imageWords}
            </div>
        `;
        
        imageWordsCard.style.display = 'block';
    }

    enableButtons() {
        document.getElementById('addToSheetBtn').disabled = false;
        document.getElementById('refreshBtn').disabled = false;
    }

    clearDisplay() {
        document.getElementById('productDataCard').style.display = 'none';
        document.getElementById('titlesCard').style.display = 'none';
        document.getElementById('imageWordsCard').style.display = 'none';
        document.getElementById('addToSheetBtn').disabled = true;
        document.getElementById('refreshBtn').disabled = true;
    }

    showLoading(text = 'Loading...') {
        this.updateLoadingText(text);
        this.loadingModal.show();
    }

    hideLoading() {
        this.loadingModal.hide();
    }

    showSkuNotFoundModal(sku) {
        document.getElementById('invalidSku').textContent = sku;
        this.skuNotFoundModal.show();
    }

    updateLoadingText(text) {
        document.getElementById('loadingText').textContent = text;
    }

    showMessage(message, type = 'info') {
        const statusMessages = document.getElementById('statusMessages');
        const alertId = `alert-${Date.now()}`;
        
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
                <i class="fas fa-${this.getIconForType(type)}"></i> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        statusMessages.insertAdjacentHTML('beforeend', alertHtml);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                const alert = new bootstrap.Alert(alertElement);
                alert.close();
            }
        }, 5000);
    }

    getIconForType(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TitleGeneratorApp();
});
