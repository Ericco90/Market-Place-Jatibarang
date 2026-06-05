/**
 * WARUNG UMKM JATIBARANG - GOOGLE APPS SCRIPT BACKEND
 * 
 * Cara Penggunaan:
 * 1. Buat Spreadsheet baru di Google Sheets.
 * 2. Buat sheet dengan nama: Users, Sellers, Products, Orders, Reviews, Settings.
 * 3. Buka Extensions > Apps Script.
 * 4. Paste seluruh kode ini ke dalam Code.gs.
 * 5. Klik Deploy > New Deployment.
 * 6. Pilih tipe: Web app.
 * 7. Execute as: Me (Anda).
 * 8. Who has access: Anyone.
 * 9. Klik Deploy, copy URL Web App yang dihasilkan.
 * 10. Paste URL tersebut di file frontend (js/api/config.js).
 */

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
// Jika ingin menggunakan folder Google Drive khusus untuk upload gambar, masukkan ID Foldernya di sini.
const UPLOAD_FOLDER_ID = 'MASUKKAN_ID_FOLDER_GOOGLE_DRIVE_DISINI'; 

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getProducts') {
      return getProducts();
    } else if (action === 'getSellers') {
      return getSellers();
    }
    
    return createResponse({ status: 'success', message: 'API is running' });
  } catch (error) {
    return createResponse({ status: 'error', message: error.toString() });
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    if (action === 'registerUser') {
      return registerUser(postData.data);
    } else if (action === 'uploadImage') {
      return uploadImageToDrive(postData.data.base64, postData.data.filename);
    } else if (action === 'createOrder') {
      return createOrder(postData.data);
    }
    
    return createResponse({ status: 'error', message: 'Unknown action' });
  } catch (error) {
    return createResponse({ status: 'error', message: error.toString() });
  }
}

// --- HELPER FUNCTIONS ---

function ensureSheetAndHeaders(sheetName, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  // Jika sheet belum ada, buat otomatis
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Jika sheet kosong (tidak ada header), tulis header
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    // Format header agar tebal
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  }
  
  return sheet;
}

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- SPECIFIC ENDPOINTS ---

function getProducts() {
  const products = getSheetData('Products');
  return createResponse({ status: 'success', data: products });
}

function getSellers() {
  const sellers = getSheetData('Sellers');
  return createResponse({ status: 'success', data: sellers });
}

function registerUser(userData) {
  // Pastikan sheet Users ada dan memiliki header
  const headers = ['id', 'nama', 'email', 'password', 'role', 'foto', 'tanggal_daftar'];
  const sheet = ensureSheetAndHeaders('Users', headers);
  
  // Basic check if email exists (simplification)
  const existingUsers = getSheetData('Users');
  const exists = existingUsers.some(u => u.email === userData.email);
  if (exists) {
    return createResponse({ status: 'error', message: 'Email sudah terdaftar' });
  }
  
  // Append Row
  const id = 'USR-' + new Date().getTime();
  const date = new Date().toISOString();
  
  // Urutan harus sama dengan kolom di Google Sheets: id, nama, email, password, role, foto, tanggal_daftar
  sheet.appendRow([
    id, 
    userData.nama, 
    userData.email, 
    userData.password, // Catatan: Seharusnya di-hash, ini hanya untuk prototyping
    'buyer', 
    '', 
    date
  ]);
  
  return createResponse({ status: 'success', message: 'Registrasi berhasil', data: { id: id } });
}

function createOrder(orderData) {
  // Pastikan sheet Orders ada dan memiliki header
  const headers = ['id', 'user_id', 'produk', 'total', 'status', 'tanggal'];
  const sheet = ensureSheetAndHeaders('Orders', headers);
  
  const id = 'ORD-' + new Date().getTime();
  const date = new Date().toISOString();
  
  // id, user_id, produk (JSON string), total, status, tanggal
  sheet.appendRow([
    id,
    orderData.user_id,
    JSON.stringify(orderData.items),
    orderData.total,
    'Menunggu Pembayaran',
    date
  ]);
  
  return createResponse({ status: 'success', message: 'Order berhasil dibuat', data: { id: id } });
}

// --- GOOGLE DRIVE UPLOAD ---
function uploadImageToDrive(base64Data, filename) {
  try {
    let folder;
    if (UPLOAD_FOLDER_ID === 'MASUKKAN_ID_FOLDER_GOOGLE_DRIVE_DISINI') {
      // Jika folder tidak diset, simpan di root Drive
      folder = DriveApp.getRootFolder();
    } else {
      folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
    }
    
    // Decode base64
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    
    // Create Blob
    const blob = Utilities.newBlob(byteCharacters, type, filename || ('IMG-' + new Date().getTime() + '.jpg'));
    
    // Create File
    const file = folder.createFile(blob);
    
    // Set permission so anyone can view the image (important for web images)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return the view URL
    const fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    
    return createResponse({ 
      status: 'success', 
      message: 'Upload berhasil', 
      data: { 
        url: fileUrl,
        fileId: file.getId()
      } 
    });
  } catch (error) {
    return createResponse({ status: 'error', message: 'Gagal upload: ' + error.toString() });
  }
}
