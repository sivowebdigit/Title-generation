require('dotenv').config();
const { TitleGeneratorService } = require('./services/titleGenerator');

async function testTitleGeneration() {
    const titleGenerator = new TitleGeneratorService();
    
    // Test data based on your sheet
    const testProductData = {
        sku: 'LSCO335BM',
        Pack: '1Pcs',
        height: '9.5cm',
        size: '33cm',
        colour: 'Black',
        material: 'Metal',
        product_type: 'Lamp Shade',
        best_keywords: 'Ceiling Light Shade,Pendant Lamp Shade',
        shape: 'Cone',
        finish: 'Industrial',
        room: 'Kitchen,Bedroom,Livingroom',
        bulb_type: 'E27',
        adjustability: 'No'
    };
    
    try {
        console.log('🧪 Testing title generation with test data...');
        console.log('Product data:', testProductData);
        
        const result = await titleGenerator.generateTitles(testProductData);
        
        console.log('\n✅ Title generation successful!');
        console.log(`Generated ${result.titles.length} valid titles`);
        console.log(`Image words: ${result.imagewords}`);
        
        if (result.titles.length > 0) {
            console.log('\n📝 Sample titles:');
            result.titles.slice(0, 3).forEach((title, index) => {
                console.log(`${index + 1}. [${title.optimized_title.length} chars] ${title.optimized_title}`);
                console.log(`   Order: ${title.title_order_used}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Title generation failed:', error.message);
        console.error('Full error:', error);
    }
}

testTitleGeneration();
