// User database (stored in localStorage)
let users = JSON.parse(localStorage.getItem('users')) || [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@inventory.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Staff User',
        email: 'staff@inventory.com',
        password: 'staff123',
        role: 'staff',
        createdAt: new Date().toISOString()
    }
];

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Show/Hide form panels
function showTab(tab) {
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    }
}

// Login function
function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showNotification('Please enter email and password!', 'error');
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store user session
        const session = {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(session));
        
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showNotification('Invalid email or password!', 'error');
    }
}

// Register function
function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill all fields!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        showNotification('Email already registered!', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: 'staff', // Default role for new users
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();

    showNotification('Registration successful! Please login.', 'success');
    
    // Clear form and switch to login
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
    
    showTab('login');
}

// Show notification (temporary alert replacement)
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 10px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        }
    });
});

// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('dashboard.html')) {
        // User is logged in and on dashboard, good
        return;
    }
    if (currentUser && !window.location.pathname.includes('dashboard.html')) {
        // User is logged in but on login page, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Run auth check
checkAuth();
// Add to auth.js - after successful registration/login
async function sendWelcomeEmail(user) {
    const subject = "Welcome to SmartInventory Pro! 🎉";
    const message = `
        <h3>Welcome ${user.name}!</h3>
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p>Start managing your inventory now!</p>
    `;
    await sendEmail(user.email, subject, message);
}

// Call this after user registration
// Add to your register function:
if (registrationSuccess) {
    await sendWelcomeEmail(newUser);
}