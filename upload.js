document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('whatsapp', document.getElementById('whatsapp').value);
    
    const imageFile = document.getElementById('imageInput').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData // Sends multipart form including image for server-side AES-256 encryption
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Creation encrypted & published worldwide!');
            window.location.href = 'index.html';
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        console.error('Upload error:', err);
    }
});
