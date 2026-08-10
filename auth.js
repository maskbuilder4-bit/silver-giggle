// Termux tunnel URL configuration
const BACKEND_URL = "https://discard-visor-shindig.ngrok-free.dev";

// Auto sync offline products when internet connection returns
window.addEventListener('online', syncOfflineProducts);

async function syncOfflineProducts() {
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    let unsynced = products.filter(p => !p.synced);

    for (let prod of unsynced) {
        try {
            let res = await fetch(`${BACKEND_URL}/api/upload-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prod)
            });
            if (res.ok) {
                prod.synced = true;
            }
        } catch (e) {
            console.log("Still offline, will try later.");
            break;
        }
    }
    localStorage.setItem('products', JSON.stringify(products));
}

// ==========================================
// 1. SIGNUP LOGIC
// ==========================================
async function handleSignup(event) {
    event.preventDefault();

    const data = {
        fullname: document.getElementById('fullname').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        schoolNickname: document.getElementById('schoolNickname').value.trim(),
        interests: document.getElementById('interests').value.trim(),
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            alert(result.message);
            window.location.href = "home.html";
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert("Server se connection fail ho gaya.");
    }
}

// ==========================================
// 2. LOGIN LOGIC
// ==========================================
async function handleLogin(event) {
    event.preventDefault();

    const data = {
        loginInput: document.getElementById('loginInput').value.trim().toLowerCase(),
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            alert(result.message);
            window.location.href = "home.html";
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert("Server se connection fail ho gaya.");
    }
}

// ==========================================
// 3. DASHBOARD LOAD & LOGOUT
// ==========================================
function loadDashboard() {
    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
        alert("Pehle Login karein!");
        window.location.href = "login.html";
        return;
    }

    const currentUser = JSON.parse(currentUserData);
    if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').innerText = currentUser.fullname;
    if (document.getElementById('userEmailDisplay')) document.getElementById('userEmailDisplay').innerText = currentUser.email;
    if (document.getElementById('walletBalance')) document.getElementById('walletBalance').innerText = "₹ " + (currentUser.walletBalance || 0);
    if (document.getElementById('userRefCode')) document.getElementById('userRefCode').innerText = currentUser.id || '';
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    alert("Aap Log Out ho chuke hain.");
    window.location.href = "login.html";
}
