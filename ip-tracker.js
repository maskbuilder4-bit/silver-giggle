// ip-tracker.js - Save user IP & Country alongside product uploads
// To use this, include this script or merge its logic into your upload processing handler.

async function uploadProductWithIP(productData) {
    try {
        // Fetch user public IP and geo-location details using a free IP API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Attach IP and Country flag/code to the product data object
        productData.ip = data.ip || 'Unknown IP';
        productData.countryCode = data.country_code || 'US';
        productData.countryName = data.country_name || 'Global';
        // Generate flag emoji from country code (e.g., 'IN' -> 🇮🇳)
        productData.countryFlag = data.country_code 
            ? data.country_code.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0))) 
            : '🌐';

    } catch (error) {
        console.warn('Could not fetch IP details, falling back to default:', error);
        productData.ip = 'Hidden';
        productData.countryCode = 'UN';
        productData.countryFlag = '🌐';
    }

    // Save to local storage backend structure
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    productData.id = Date.now(); // Unique ID for deletion/management
    products.unshift(productData); // Add to beginning of array
    localStorage.setItem('products', JSON.stringify(products));

    // Optional: Sync with remote backend if applicable
    if (typeof BACKEND_URL !== 'undefined') {
        try {
            await fetch(`${BACKEND_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } catch (e) {
            console.log('Backend sync offline, saved locally.');
        }
    }

    window.location.href = 'index.html';
}

// Helper code for rendering product cards with the country flag in the corner on home.html
function renderProductCardWithFlag(prod) {
    return `
        <div class="product-card" style="position: relative;">
            <!-- Country Flag Badge in Corner -->
            <div style="position: absolute; top: 15px; right: 15px; background: rgba(5,6,8,0.75); border: 1px solid var(--panel-border); padding: 4px 8px; border-radius: 8px; font-size: 13px; z-index: 5;" title="Origin: ${prod.countryName || 'Global'}">
                ${prod.countryFlag || '🌐'}
            </div>
            <div>
                ${prod.image ? `<div class="prod-img-box"><img src="${prod.image}" alt="${prod.title}"></div>` : ''}
                <h3>${prod.title}</h3>
                <p>${prod.description}</p>
            </div>
            <div class="card-footer">
                <span class="price-tag">₹40 / $0.50</span>
                <button class="btn-buy" onclick="initiateBuy('${prod.whatsapp}')">Pay to get contact</button>
            </div>
        </div>
    `;
}
