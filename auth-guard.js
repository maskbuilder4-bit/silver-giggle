// auth-guard.js - Place inside a <script> tag in the <head> of index.html, upload.html, profile.html
(function () {
    const activeUser = localStorage.getItem('silver_giggle_current_user');
    if (!activeUser) {
        // Zero-second block: Redirects instantly if not logged in
        if (!window.location.href.includes('login.html') && !window.location.href.includes('signup.html')) {
            window.location.replace('login.html');
        }
    }
})();
