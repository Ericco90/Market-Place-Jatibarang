/**
 * API CONFIGURATION
 * Konfigurasi koneksi antara Frontend dan Google Apps Script Backend.
 */

const API_CONFIG = {
    // TODO: Ganti URL di bawah dengan URL Web App hasil deploy Google Apps Script Anda.
    BASE_URL: 'https://script.google.com/macros/s/AKfycbzqT1xN5jIZ0_VU5L9oVyYvc-z6D37qfeST6U3Qqs305tcrgNWeIltigQhYGbSgYOBWwQ/exec',
    
    // Header default untuk request (perhatikan bahwa GAS sering mengalami isu CORS jika menggunakan header complex)
    HEADERS: {
        'Content-Type': 'text/plain;charset=utf-8',
    }
};

/**
 * Helper function untuk melakukan HTTP GET request ke GAS
 */
async function fetchFromGAS(action, params = {}) {
    try {
        const url = new URL(API_CONFIG.BASE_URL);
        url.searchParams.append('action', action);
        
        // Append other params
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch GET Error:', error);
        return { status: 'error', message: error.message };
    }
}

/**
 * Helper function untuk melakukan HTTP POST request ke GAS
 */
async function postToGAS(action, payloadData) {
    try {
        const payload = {
            action: action,
            data: payloadData
        };

        const response = await fetch(API_CONFIG.BASE_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            // Avoid setting 'Content-Type': 'application/json' to prevent CORS Preflight (OPTIONS request) issues in GAS
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch POST Error:', error);
        return { status: 'error', message: error.message };
    }
}

// Export for module usage if using ES6 modules
// export { API_CONFIG, fetchFromGAS, postToGAS };
