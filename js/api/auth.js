/**
 * AUTHENTICATION API
 * Mengelola logika Login dan Registrasi.
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const alertBox = document.getElementById('alertBox');
    
    function showAlert(message, type) {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = `mb-4 p-3 rounded-lg text-sm font-medium ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        alertBox.classList.remove('hidden');
    }

    function hideAlert() {
        if (!alertBox) return;
        alertBox.classList.add('hidden');
    }

    function toggleLoading(btnId, spinnerId, isLoading) {
        const btn = document.getElementById(btnId);
        const spinner = document.getElementById(spinnerId);
        if (!btn || !spinner) return;
        
        if (isLoading) {
            btn.disabled = true;
            btn.classList.add('opacity-70', 'cursor-not-allowed');
            spinner.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-70', 'cursor-not-allowed');
            spinner.classList.add('hidden');
        }
    }

    // --- REGISTRASI ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            toggleLoading('submitBtn', 'loadingSpinner', true);

            // Set false agar menggunakan Google Apps Script nyata
            const useMock = false; 

            try {
                let response;
                if (useMock) {
                    // Simulasi delay jaringan 1.5 detik
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    response = { status: 'success', message: 'Registrasi berhasil! Mengalihkan...' };
                } else {
                    // Jika menggunakan Google Apps Script nyata:
                    response = await postToGAS('registerUser', {
                        nama: name,
                        email: email,
                        password: password // Ingat: Di sistem nyata password harus di-hash!
                    });
                }

                if (response.status === 'success') {
                    showAlert(response.message, 'success');
                    // Redirect ke halaman profil setelah berhasil
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1500);
                } else {
                    showAlert(response.message, 'error');
                }
            } catch (error) {
                showAlert('Terjadi kesalahan jaringan. Coba lagi.', 'error');
            } finally {
                toggleLoading('submitBtn', 'loadingSpinner', false);
            }
        });
    }

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            toggleLoading('submitBtn', 'loadingSpinner', true);

            const useMock = false;

            try {
                let response;
                if (useMock) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    // Simulasi logika sederhana
                    if (email === 'admin@warungumkm.com') {
                        response = { status: 'success', role: 'admin', url: '../admin/dashboard.html' };
                    } else if (email === 'seller@warungumkm.com') {
                        response = { status: 'success', role: 'seller', url: '../seller/dashboard.html' };
                    } else {
                        response = { status: 'success', role: 'buyer', url: 'profile.html' };
                    }
                } else {
                    // Implementasi nyata ke GAS...
                    // response = await postToGAS('loginUser', { email, password });
                }

                if (response.status === 'success') {
                    showAlert('Login berhasil! Mengalihkan...', 'success');
                    // Simpan sesi dummy
                    localStorage.setItem('userRole', response.role);
                    
                    setTimeout(() => {
                        window.location.href = response.url;
                    }, 1000);
                } else {
                    showAlert(response.message || 'Email atau password salah', 'error');
                }
            } catch (error) {
                showAlert('Terjadi kesalahan jaringan. Coba lagi.', 'error');
            } finally {
                toggleLoading('submitBtn', 'loadingSpinner', false);
            }
        });
    }
});
