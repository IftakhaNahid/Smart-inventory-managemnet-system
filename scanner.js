
// scanner.js - Using HTML5-QRCode (Works in Edge, Chrome, Firefox, Safari)
let html5QrCode = null;
let isScanning = false;

// Start camera scanner
async function startScanner() {
    const scannerContainer = document.getElementById('scannerContainer');
    
    if (isScanning) {
        console.log('Scanner already running');
        return;
    }
    
    try {
        // Show scanner container
        scannerContainer.style.display = 'flex';
        
        // Clear any existing video
        const videoElement = document.getElementById('scannerVideo');
        if (videoElement) {
            // Stop any existing streams
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
            }
        }
        
        // Create new QR code scanner
        html5QrCode = new Html5Qrcode("scannerVideo");
        
        const config = {
            fps: 10, // frames per second
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
        };
        
        isScanning = true;
        
        // Start scanning
        await html5QrCode.start(
            { facingMode: "environment" }, // Use back camera
            config,
            (decodedText, decodedResult) => {
                // Success callback - barcode detected
                console.log('Scanned:', decodedText);
                
                // Vibrate if supported
                if (navigator.vibrate) navigator.vibrate(100);
                
                // Stop scanner
                stopScanner();
                
                // Look up the product
                lookupBarcode(decodedText);
            },
            (errorMessage) => {
                // Error callback - just log, don't show to user
                console.log('Scan error:', errorMessage);
            }
        ).catch(err => {
            console.error('Start error:', err);
            alert('Could not start camera. Please check permissions.');
            stopScanner();
        });
        
    } catch (error) {
        console.error('Camera error:', error);
        alert('Error accessing camera: ' + error.message);
        stopScanner();
    }
}

// Stop scanner
function stopScanner() {
    isScanning = false;
    
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            console.log('Scanner stopped');
            html5QrCode = null;
        }).catch(err => {
            console.error('Error stopping scanner:', err);
        });
    }
    
    const scannerContainer = document.getElementById('scannerContainer');
    if (scannerContainer) {
        scannerContainer.style.display = 'none';
    }
}

// Look up barcode from backend
async function lookupBarcode(barcode = null) {
    // If no barcode provided, get from manual input
    if (!barcode) {
        barcode = document.getElementById('manualBarcode').value.trim();
        if (!barcode) {
            alert('Please enter a barcode or scan one');
            return;
        }
    }
    
    // Get auth token
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    // Show loading
    const productInfoDiv = document.getElementById('productInfo');
    productInfoDiv.innerHTML = '<p>Loading...</p>';
    productInfoDiv.classList.add('show');
    
    try {
        // Adjust this URL to match your backend endpoint
        const response = await fetch(`/api/products/barcode/${barcode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const product = await response.json();
            displayProductInfo(product);
            // Clear manual input
            document.getElementById('manualBarcode').value = '';
        } else if (response.status === 404) {
            showNotFound(barcode);
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error:', error);
        productInfoDiv.innerHTML = '<p style="color:red;">Error looking up product. Please try again.</p>';
    }
}

// Display product information
function displayProductInfo(product) {
    const productInfoDiv = document.getElementById('productInfo');
    productInfoDiv.innerHTML = `
        <div class="product-card">
            <h4>📦 ${product.name}</h4>
            <p><strong>Barcode:</strong> ${product.barcode}</p>
            <p><strong>Current Stock:</strong> ${product.quantity} units</p>
            <p><strong>Price:</strong> $${parseFloat(product.price).toFixed(2)}</p>
            
            <div class="stock-controls">
                <label>Quantity:</label>
                <input type="number" id="quantityInput" class="quantity-input" value="1" min="1" />
                <button onclick="updateStock(${product.id}, 'add')" class="add-stock-btn">➕ Add Stock</button>
                <button onclick="updateStock(${product.id}, 'remove')" class="remove-stock-btn">➖ Remove Stock</button>
            </div>
        </div>
    `;
}

// Show not found message with option to add product
function showNotFound(barcode) {
    const productInfoDiv = document.getElementById('productInfo');
    productInfoDiv.innerHTML = `
        <div class="not-found">
            <p><strong>⚠️ Product not found</strong></p>
            <p>Barcode: ${barcode}</p>
            <button onclick="showAddProductForm('${barcode}')" class="lookup-btn">➕ Add New Product</button>
        </div>
    `;
}

// Show form to add new product
function showAddProductForm(barcode) {
    const productInfoDiv = document.getElementById('productInfo');
    productInfoDiv.innerHTML = `
        <div class="add-product-form">
            <h4>Add New Product</h4>
            <input type="text" id="newProductName" placeholder="Product Name" />
            <input type="number" id="newProductPrice" placeholder="Price" step="0.01" />
            <input type="number" id="newProductQuantity" placeholder="Initial Quantity" />
            <button onclick="addNewProduct('${barcode}')" class="scan-btn">💾 Save Product</button>
            <button onclick="lookupBarcode('${barcode}')" style="margin-left:10px;">Cancel</button>
        </div>
    `;
}

// Add new product to database
async function addNewProduct(barcode) {
    const name = document.getElementById('newProductName').value;
    const price = parseFloat(document.getElementById('newProductPrice').value);
    const quantity = parseInt(document.getElementById('newProductQuantity').value);
    
    if (!name || isNaN(price) || isNaN(quantity)) {
        alert('Please fill all fields correctly');
        return;
    }
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                barcode: barcode,
                price: price,
                quantity: quantity
            })
        });
        
        if (response.ok) {
            alert('Product added successfully!');
            lookupBarcode(barcode);
        } else {
            const error = await response.json();
            alert('Failed to add product: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding product');
    }
}

// Update stock quantity
async function updateStock(productId, action) {
    const quantityInput = document.getElementById('quantityInput');
    if (!quantityInput) return;
    
    const quantity = parseInt(quantityInput.value);
    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/inventory/update', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: quantity,
                action: action
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`✅ Stock updated! New quantity: ${result.newQuantity}`);
            // Refresh current product display
            const productCard = document.querySelector('.product-card h4');
            if (productCard) {
                location.reload(); // Simple refresh
            }
        } else {
            const error = await response.json();
            alert('Failed to update stock: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating stock');
    }
}

// Close scanner when pressing ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isScanning) {
        stopScanner();
    }
});

// Allow manual barcode entry with Enter key
document.addEventListener('DOMContentLoaded', function() {
    const manualInput = document.getElementById('manualBarcode');
    if (manualInput) {
        manualInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                lookupBarcode();
            }
        });
    }
    
    // Test if we need to load the library
    if (typeof Html5Qrcode === 'undefined') {
        // Load the library dynamically
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
        script.onload = () => {
            console.log('HTML5-QRCode library loaded');
        };
        script.onerror = () => {
            console.error('Failed to load HTML5-QRCode library');
            alert('Failed to load scanner library. Please check your internet connection.');
        };
        document.head.appendChild(script);
    }
});
// Add to scanner.js - alert when scanned product is low stock
async function handleScannedProduct(product) {
    // ... existing scan code ...
    
    if (product.stock <= 5) {
        await sendLowStockAlert(product);
        showNotification(`⚠️ ${product.name} is low on stock!`, 'warning');
    }
}