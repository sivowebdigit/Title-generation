const OpenAI = require('openai');

class TitleGeneratorService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateTitles(productData) {
        try {
            console.log('Starting title generation for SKU:', productData.sku);
            const prompt = this.buildPrompt(productData);
            console.log('Generated prompt length:', prompt.length);
            
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert eCommerce product copywriter. Create descriptive product titles that are EXACTLY 90-100 characters. Every single title MUST be at least 90 characters and no more than 100 characters. Add more descriptive words if needed to reach 90+ characters. Use NO commas or symbols. Return only valid JSON responses."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            });

            const response = completion.choices[0].message.content.trim();
            console.log('OpenAI raw response length:', response.length);
            console.log('OpenAI raw response preview:', response.substring(0, 200) + '...');
            
            // Parse the JSON response
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(response);
                console.log('Successfully parsed JSON response');
                console.log('Number of titles in response:', parsedResponse.titles?.length || 0);
            } catch (parseError) {
                console.log('JSON parse error, trying to extract JSON from response');
                // Try to extract JSON from the response if it's wrapped in other text
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedResponse = JSON.parse(jsonMatch[0]);
                    console.log('Successfully extracted and parsed JSON');
                    console.log('Number of titles in response:', parsedResponse.titles?.length || 0);
                } else {
                    console.error('No JSON found in response:', response);
                    throw new Error('Invalid JSON response from AI');
                }
            }

            // Validate and filter titles by character count
            const allTitles = parsedResponse.titles || [];
            console.log('Total titles generated:', allTitles.length);
            
            // Log character counts for debugging
            if (allTitles.length > 0) {
                allTitles.forEach((title, index) => {
                    const charCount = title.optimized_title?.length || 0;
                    console.log(`Title ${index + 1}: ${charCount} chars - "${title.optimized_title}"`);
                });
            }
            
            return {
                titles: allTitles,
                imagewords: parsedResponse.imagewords || ''
            };
        } catch (error) {
            console.error('Error generating titles:', error);
            console.error('Error details:', error.message);
            if (error.response) {
                console.error('OpenAI API error response:', error.response.data);
            }
            throw error;
        }
    }

    buildPrompt(productData) {
        return `You are an eCommerce product copywriter. Based on the following product data, generate 10 unique, professional, and attractive product titles. Each title should:

- **CRITICAL: Each title must be EXACTLY 90-100 characters in length. Count characters carefully!**
- Use a mixed and rearranged combination of the below fields (labeled 1 to B).
- Be SEO-optimized using the "best_keywords".
- Use a natural flowing style with NO commas and NO unnecessary symbols or punctuation.
- Do NOT reuse the same template repeatedly.
- Include multiple product details and descriptive words to create comprehensive titles.
- Add descriptive adjectives and room applications to reach the target length.
- Keep titles clean and simple with spaces between words only.
- Return the output in **strict JSON array format** with the following structure:
  - sku
  - optimized_title
  - title_order_used (e.g. "1,3,5,6,7,B")

Additionally, create a separate field called **imagewords** — a concise, comma-separated list of vivid, descriptive keywords based on the fields **not used** in the titles (excluding fields 1–B). This will be used for AI-generated product images.

### Product Data:
sku: ${productData.sku}
1. Pack: ${productData.Pack}
2. Height: ${productData.height}
3. Size: ${productData.size}
4. Colour: ${productData.colour}
5. Material: ${productData.material}
6. Product Type: ${productData.product_type}
7. Best Keywords: ${productData.best_keywords}
8. Shape: ${productData.shape}
9. Finish: ${productData.finish}
A. Room: ${productData.room}
B. Bulb Type: ${productData.bulb_type}
C. Adjustability: ${productData.adjustability}

**EXAMPLES OF CORRECT LENGTH (90-100 chars):**
"Blue Metal Barnslot Lamp Shade 30cm Size Perfect for Living Room Kitchen Bedroom E27 Bulb" (93 chars)
"Modern Vintage Yellow Pendant Light Shade 30cm Size Metal Material for Home Decoration" (92 chars)

**IMPORTANT: Each title must be between 90-100 characters. Do not exceed 100 or go below 90.**

Return the response as a **single JSON object only**, with this exact structure:

\`\`\`json
{
  "titles": [
    {
      "sku": "${productData.sku}",
      "optimized_title": "Descriptive product title with multiple details and keywords for better SEO",
      "title_order_used": "list of field labels used like 6,7,3,9,A"
    }
  ],
  "imagewords": "words for image generation based on unused fields like adjustability, material, etc."
}
\`\`\``;
    }

    // Fallback method to regenerate titles if needed
    async regenerateTitles(productData, currentTitles, targetCount = 10) {
        if (currentTitles.length >= targetCount) {
            return currentTitles;
        }

        const needed = targetCount - currentTitles.length;
        const newTitles = await this.generateTitles(productData);
        
        const allTitles = [...currentTitles, ...newTitles.titles];
        const uniqueTitles = this.removeDuplicates(allTitles);
        
        return uniqueTitles.slice(0, targetCount);
    }

    removeDuplicates(titles) {
        const seen = new Set();
        return titles.filter(title => {
            if (seen.has(title.optimized_title)) {
                return false;
            }
            seen.add(title.optimized_title);
            return true;
        });
    }
}

module.exports = { TitleGeneratorService };
