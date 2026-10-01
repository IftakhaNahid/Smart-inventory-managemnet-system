
// ============================================
// EMAIL SYSTEM CONFIGURATION
// ============================================

const EMAIL_CONFIG = {
    PUBLIC_KEY: 'fM9u0y8t1VccI-REr',     // Your EmailJS Public Key
    SERVICE_ID: 'service_wx8fcmz',       // Your EmailJS Service ID  
    ADMIN_EMAIL: 'ifthakharnahid1653@gmail.com'   // Admin email for alerts
};

// Initialize EmailJS
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
        console.log('✅ EmailJS initialized');
    } else {
        console.warn('⚠️ EmailJS not loaded - using demo mode');
    }
})();

// Send email function
async function sendEmail(to, subject, message) {
    try {
        const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center; color: white;">
                    <h2>📦 SmartInventory Pro</h2>
                </div>
                <div style="padding: 20px;">
                    ${message}
                </div>
                <div style="background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                    <p>SmartInventory Pro - Automated Notification</p>
                </div>
            </div>
        `;
        
        // Check if EmailJS is available
        if (typeof emailjs !== 'undefined' && emailjs.send) {
            const response = await emailjs.send(
                EMAIL_CONFIG.SERVICE_ID,
                'template_xyz',
                {
                    to_email: to,
                    subject: subject,
                    message_html: emailContent
                }
            );
            console.log('✅ Email sent!', response);
            showNotification(`📧 Email sent to ${to}`, 'success');
        } else {
            // Demo mode - just save to localStorage
            console.log('📧 DEMO: Would send email to', to);
            showNotification(`📧 DEMO: Email would be sent to ${to}`, 'info');
        }
        
        // Save to history
        saveToEmailHistory(to, subject, message);
        return true;
        
    } catch (error) {
        console.error('❌ Email failed:', error);
        showNotification('⚠️ Email failed: ' + error.message, 'error');
        saveToEmailHistory(to, subject, message);
        return false;
    }
}

// Save email to history
function saveToEmailHistory(to, subject, message) {
    const emails = JSON.parse(localStorage.getItem('emailAlerts')) || [];
    emails.push({
        to: to,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        sent: true
    });
    localStorage.setItem('emailAlerts', JSON.stringify(emails));
    
    // Keep only last 50
    if (emails.length > 50) {
        emails.shift();
        localStorage.setItem('emailAlerts', JSON.stringify(emails));
    }
}

// Send Low Stock Alert
async function sendLowStockAlert(product) {
    const message = `
        <div style="border-left: 4px solid #ff9800; padding-left: 15px;">
            <h3 style="color: #ff9800;">⚠️ LOW STOCK ALERT</h3>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Current Stock:</strong> <span style="color: #ff9800; font-size: 18px;">${product.stock} units</span></p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p><strong>Action Required:</strong> Please restock this product immediately!</p>
        </div>
    `;
    
    await sendEmail(EMAIL_CONFIG.ADMIN_EMAIL, `⚠️ LOW STOCK: ${product.name}`, message);
}

// Send Sale Receipt
async function sendSaleReceipt(sale, userEmail, userName) {
    const message = `
        <div style="border-left: 4px solid #4caf50; padding-left: 15px;">
            <h3 style="color: #4caf50;">✅ SALE CONFIRMATION</h3>
            <p>Dear <strong>${userName}</strong>,</p>
            <p>Thank you for your purchase!</p>
            
            <table style="width: 100%; margin: 15px 0;">
                <tr><th style="text-align: left;">Product:</th><td>${sale.productName}</td></tr>
                <tr><th style="text-align: left;">Quantity:</th><td>${sale.quantity}</td></tr>
                <tr><th style="text-align: left;">Total Amount:</th><td><strong>$${sale.totalAmount.toFixed(2)}</strong></td></tr>
                <tr><th style="text-align: left;">Date:</th><td>${new Date().toLocaleString()}</td></tr>
            </table>
            
            <p>Thank you for choosing SmartInventory Pro!</p>
        </div>
    `;
    
    await sendEmail(userEmail, `✅ Your Receipt - $${sale.totalAmount.toFixed(2)}`, message);
}

// Test Email System
async function testEmailSystem() {
    showNotification('📧 Testing email system...', 'info');
    
    const testMessage = `
        <div style="text-align: center;">
            <h3>✅ Email System Test Successful!</h3>
            <p>If you're seeing this, your email configuration is working!</p>
            <p>Time: ${new Date().toLocaleString()}</p>
        </div>
    `;
    
    const result = await sendEmail(EMAIL_CONFIG.ADMIN_EMAIL, '✅ Email Test - SmartInventory Pro', testMessage);
    
    if (result) {
        showNotification('✅ Test complete! Check email history.', 'success');
    } else {
        showNotification('❌ Test failed. Check console for errors.', 'error');
    }
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

let products = JSON.parse(localStorage.getItem('products')) || [];
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];

// DOM Elements
const productList = document.getElementById('productList');
const salesHistoryList = document.getElementById('salesHistoryList');
const totalRevenueSpan = document.getElementById('totalRevenue');
const totalProductsSpan = document.getElementById('totalProducts');
const lowStockSpan = document.getElementById('lowStock');

// Load and display products
function loadProducts() {
    if (!productList) return;
    
    if (products.length === 0) {
        productList.innerHTML = '<tr><td colspan="5" class="text-center">No products available</td></tr>';
        return;
    }
    
    productList.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td class="${product.stock <= 5 ? 'text-danger' : ''}">${product.stock}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})" ${getUserRole() !== 'admin' ? 'disabled' : ''}>
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" ${getUserRole() !== 'admin' ? 'disabled' : ''}>
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
    
    updateStats();
}

// Get user role
function getUserRole() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.role : 'staff';
}

// Add new product
function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    
    if (getUserRole() !== 'admin') {
        showNotification('Only administrators can add products!', 'error');
        return;
    }
    
    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        stock: stock
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    showNotification('Product added successfully!', 'success');
    loadProducts();
    populateProductDropdown();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    if (modal) modal.hide();
    
    event.target.reset();
}

// Edit product
function editProduct(id) {
    if (getUserRole() !== 'admin') {
        showNotification('Only administrators can edit products!', 'error');
        return;
    }
    
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('Enter new product name:', product.name);
    if (newName && newName.trim()) {
        const newPrice = prompt('Enter new price:', product.price);
        if (newPrice && !isNaN(newPrice)) {
            const newStock = prompt('Enter new stock quantity:', product.stock);
            if (newStock && !isNaN(newStock)) {
                product.name = newName.trim();
                product.price = parseFloat(newPrice);
                product.stock = parseInt(newStock);
                localStorage.setItem('products', JSON.stringify(products));
                loadProducts();
                populateProductDropdown();
                showNotification('Product updated successfully!', 'success');
            }
        }
    }
}

// Delete product
function deleteProduct(id) {
    if (getUserRole() !== 'admin') {
        showNotification('Only administrators can delete products!', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        populateProductDropdown();
        showNotification('Product deleted successfully!', 'success');
    }
}

// SELL PRODUCT - FIXED VERSION with email alerts
async function sellProduct() {
    const productId = parseInt(document.getElementById('sellProduct').value);
    const quantity = parseInt(document.getElementById('sellQuantity').value);
    
    if (!productId) {
        showNotification('Please select a product!', 'error');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        showNotification('Please enter a valid quantity!', 'error');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    if (product.stock < quantity) {
        showNotification(`Insufficient stock! Only ${product.stock} units available.`, 'error');
        return;
    }
    
    const totalAmount = product.price * quantity;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update stock
    product.stock -= quantity;
    localStorage.setItem('products', JSON.stringify(products));
    
    // Record sale
    const sale = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        totalAmount: totalAmount,
        soldBy: currentUser.name,
        date: new Date().toISOString()
    };
    
    salesHistory.push(sale);
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    
    showNotification(`Sold ${quantity} x ${product.name} for $${totalAmount.toFixed(2)}!`, 'success');
    
    // ============================================
    // SEND EMAIL ALERTS
    // ============================================
    
    // Send receipt to user
    await sendSaleReceipt(sale, currentUser.email, currentUser.name);
    
    // Send low stock alert to admin
    if (product.stock <= 5) {
        await sendLowStockAlert(product);
    }
    
    // Reset form
    document.getElementById('sellProduct').value = '';
    document.getElementById('sellQuantity').value = '';
    
    loadProducts();
    loadSalesHistory();
    populateProductDropdown();
}

// Load sales history
function loadSalesHistory() {
    if (!salesHistoryList) return;
    
    if (salesHistory.length === 0) {
        salesHistoryList.innerHTML = '<tr><td colspan="5" class="text-center">No sales recorded</td></tr>';
        return;
    }
    
    salesHistoryList.innerHTML = salesHistory.slice().reverse().map(sale => `
        <tr>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.totalAmount.toFixed(2)}</td>
            <td>${sale.soldBy}</td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    if (totalRevenueSpan) {
        const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.totalAmount, 0);
        totalRevenueSpan.innerText = `$${totalRevenue.toFixed(2)}`;
    }
    
    if (totalProductsSpan) {
        totalProductsSpan.innerText = products.length;
    }
    
    if (lowStockSpan) {
        const lowStockCount = products.filter(p => p.stock <= 5).length;
        lowStockSpan.innerText = lowStockCount;
        
        if (lowStockCount > 0) {
            lowStockSpan.classList.add('text-warning');
        } else {
            lowStockSpan.classList.remove('text-warning');
        }
    }
}

// Populate product dropdown for selling
function populateProductDropdown() {
    const sellProductSelect = document.getElementById('sellProduct');
    if (!sellProductSelect) return;
    
    sellProductSelect.innerHTML = '<option value="">Select a product</option>' +
        products.map(product => `
            <option value="${product.id}">${product.name} - Stock: ${product.stock} - $${product.price}</option>
        `).join('');
}

// Show notification
function showNotification(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1100';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';
    
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" data-bs-autohide="true" data-bs-delay="3000">
            <div class="toast-header ${bgColor} text-white">
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Display email history
function displayEmailHistory() {
    const emails = JSON.parse(localStorage.getItem('emailAlerts')) || [];
    const emailList = document.getElementById('emailHistoryList');
    
    if (!emailList) return;
    
    if (emails.length === 0) {
        emailList.innerHTML = '<tr><td colspan="4" class="text-center">No emails sent yet</td></tr>';
        return;
    }
    
    emailList.innerHTML = emails.slice().reverse().map(email => `
        <tr>
            <td>${new Date(email.timestamp).toLocaleString()}</td>
            <td>${email.to}</td>
            <td>${email.subject}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewEmail('${email.timestamp}')">
                    <i class="fas fa-eye"></i> View
                </button>
             </td>
        </tr>
    `).join('');
}

function viewEmail(timestamp) {
    const emails = JSON.parse(localStorage.getItem('emailAlerts')) || [];
    const email = emails.find(e => e.timestamp == timestamp);
    if (email) {
        alert(`To: ${email.to}\n\nSubject: ${email.subject}\n\nMessage: ${email.message}`);
    }
}

// Generate sales report
function generateReport() {
    if (getUserRole() !== 'admin') {
        showNotification('Only administrators can generate reports!', 'error');
        return;
    }
    
    const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItemsSold = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0);
    
    let report = '=== SALES REPORT ===\n\n';
    report += `Total Revenue: $${totalRevenue.toFixed(2)}\n`;
    report += `Total Items Sold: ${totalItemsSold}\n`;
    report += `Total Transactions: ${salesHistory.length}\n`;
    report += `Active Products: ${products.length}\n\n`;
    report += '=== TOP SELLING PRODUCTS ===\n';
    
    const productSales = {};
    salesHistory.forEach(sale => {
        if (!productSales[sale.productName]) {
            productSales[sale.productName] = 0;
        }
        productSales[sale.productName] += sale.quantity;
    });
    
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topProducts.forEach(([name, qty], index) => {
        report += `${index + 1}. ${name}: ${qty} units sold\n`;
    });
    
    alert(report);
}

// Export sales data to CSV
function exportSalesData() {
    if (getUserRole() !== 'admin') {
        showNotification('Only administrators can export data!', 'error');
        return;
    }
    
    if (salesHistory.length === 0) {
        showNotification('No sales data to export!', 'error');
        return;
    }
    
    let csv = 'Date,Product,Quantity,Total Amount,Sold By\n';
    salesHistory.forEach(sale => {
        csv += `${new Date(sale.date).toLocaleDateString()},${sale.productName},${sale.quantity},$${sale.totalAmount.toFixed(2)},${sale.soldBy}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Sales data exported successfully!', 'success');
}

// Check authentication
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Display user info
function displayUserInfo() {
    const user = checkAuth();
    if (user) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.innerText = user.name;
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize dashboard
function initDashboard() {
    displayUserInfo();
    loadProducts();
    loadSalesHistory();
    populateProductDropdown();
    displayEmailHistory();
    
    // Set up event listeners
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', addProduct);
    }
    
    const sellButton = document.getElementById('sellButton');
    if (sellButton) {
        sellButton.addEventListener('click', sellProduct);
    }
    
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportSalesData);
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', initDashboard);