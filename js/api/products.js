/**
 * PRODUCTS API
 * Mengelola interaksi data produk dengan Backend.
 */

// Simulasi Mock Data jika API belum siap
const MOCK_PRODUCTS = [
    {
        id: 'PRD-001',
        nama: 'Kopi Bubuk Asli Gayo 250gr Premium',
        harga: 45000,
        hargaAsli: 90000,
        diskon: 50,
        stok: 50,
        rating: 4.8,
        terjual: 1200,
        gambar: 'https://placehold.co/400x400/eee/999?text=Kopi',
        lokasi: 'Kab. Aceh Tengah'
    },
    {
        id: 'PRD-002',
        nama: 'Keripik Pisang Coklat Lumer',
        harga: 16000,
        hargaAsli: 20000,
        diskon: 20,
        stok: 150,
        rating: 4.9,
        terjual: 120,
        gambar: 'https://placehold.co/400x400/eee/999?text=Keripik',
        lokasi: 'Kota Bandung'
    }
];

class ProductAPI {
    
    /**
     * Mengambil daftar produk (Bisa di switch antara MOCK atau REAL API)
     */
    static async getAllProducts(useMock = true) {
        if (useMock) {
            // Simulasi network delay
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({ status: 'success', data: MOCK_PRODUCTS });
                }, 500);
            });
        }
        
        // Memanggil Real API Google Apps Script
        return await fetchFromGAS('getProducts');
    }

    /**
     * Upload gambar produk ke Google Drive (Via GAS)
     * @param {File} fileObject Objek file dari input type="file"
     */
    static async uploadProductImage(fileObject) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(fileObject);
            
            reader.onload = async () => {
                const base64Data = reader.result;
                const filename = fileObject.name;
                
                try {
                    const response = await postToGAS('uploadImage', {
                        base64: base64Data,
                        filename: filename
                    });
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = error => reject(error);
        });
    }
}
