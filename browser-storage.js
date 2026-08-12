// Helper to convert file to Base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Simple browser-based encryption key generator/retrieval
async function getOrCreateEncryptionKey() {
    let rawKey = localStorage.getItem('sg_sec_key');
    if (!rawKey) {
        const key = window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        // Export and store key safely in browser session
        const exported = await window.crypto.subtle.exportKey("jwk", await key);
        localStorage.setItem('sg_sec_key', JSON.stringify(exported));
        return await window.crypto.subtle.importKey("jwk", exported, "AES-GCM", true, ["encrypt", "decrypt"]);
    } else {
        return await window.crypto.subtle.importKey("jwk", JSON.parse(rawKey), "AES-GCM", true, ["encrypt", "decrypt"]);
    }
}

async function encryptData(payloadObject) {
    const key = await getOrCreateEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(payloadObject));
    
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
    );

    return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(ciphertext))
    };
}

async function decryptData(encryptedObj) {
    const key = await getOrCreateEncryptionKey();
    const iv = new Uint8Array(encryptedObj.iv);
    const data = new Uint8Array(encryptedObj.data);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
}

// Handle Upload Form Submission (Saving fully encrypted in browser storage)
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const imageFile = document.getElementById('imageInput').files[0];
    
    let imageBase64 = '';
    if (imageFile) {
        imageBase64 = await fileToBase64(imageFile); // Converts image to secure string format
    }

    // Fetch user IP and country flag
    let countryFlag = '🌐';
    let countryName = 'Global';
    try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData.country_code) {
            countryFlag = ipData.country_code.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
            countryName = ipData.country_name;
        }
    } catch (err) {
        console.warn('IP fetch skipped');
    }

    const productPayload = {
        id: Date.now(),
        title,
        description,
        whatsapp,
        image: imageBase64,
        countryFlag,
        countryName,
        uploader: JSON.parse(localStorage.getItem('silver_giggle_current_user'))?.email || 'Anonymous'
    };

    // Encrypt the entire payload package
    const encryptedPackage = await encryptData(productPayload);

    // Save encrypted blob to browser localStorage
    let secureRepo = JSON.parse(localStorage.getItem('silver_giggle_secure_repo') || '[]');
    secureRepo.unshift(encryptedPackage);
    localStorage.setItem('silver_giggle_secure_repo', JSON.stringify(secureRepo));

    alert('Creation successfully encrypted & saved inside browser storage!');
    window.location.href = 'index.html';
});
