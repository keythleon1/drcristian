/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE AUTENTICACIÓN (LOGIN)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Si ya existe una sesión activa, redirigir automáticamente al Dashboard
    if (sessionStorage.getItem('liteMedicSession') === 'active') {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const loginUser = document.getElementById('loginUser');
    const loginPass = document.getElementById('loginPass');
    const togglePassword = document.getElementById('togglePassword');
    const loginAlert = document.getElementById('loginAlert');
    const alertMessage = document.getElementById('alertMessage');
    const capsLockAlert = document.getElementById('capsLockAlert');
    const rememberMeCheck = document.getElementById('rememberMe');
    const btnHelp = document.getElementById('btnHelp');
    const authCard = document.querySelector('.auth-card');

    // Credenciales autorizadas oficiales
    const VALID_USER = 'Drcristian2026';
    const VALID_PASS = 'YadielEduardo2023';

    // Recuperar usuario recordado si existe
    const savedUser = localStorage.getItem('liteMedic_savedUser');
    if (savedUser && loginUser) {
        loginUser.value = savedUser;
        if (rememberMeCheck) rememberMeCheck.checked = true;
        if (loginPass) loginPass.focus();
    } else if (loginUser) {
        loginUser.focus();
    }

    // Alternar visibilidad de contraseña
    if (togglePassword && loginPass) {
        togglePassword.addEventListener('click', () => {
            const isPassword = loginPass.getAttribute('type') === 'password';
            loginPass.setAttribute('type', isPassword ? 'text' : 'password');
            
            const icon = togglePassword.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
        });
    }

    // Detección de Bloq Mayús (Caps Lock)
    if (loginPass && capsLockAlert) {
        ['keydown', 'keyup'].forEach(eventType => {
            loginPass.addEventListener(eventType, (e) => {
                if (e.getModifierState && e.getModifierState('CapsLock')) {
                    capsLockAlert.style.display = 'flex';
                } else {
                    capsLockAlert.style.display = 'none';
                }
            });
        });
        loginPass.addEventListener('blur', () => {
            capsLockAlert.style.display = 'none';
        });
    }

    // Modal de Soporte / Ayuda
    if (btnHelp) {
        btnHelp.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Atención al Médico:\n\nSi necesita asistencia técnica o recuperación de credenciales, comuníquese con el desarrollador del sistema:\n\nKeyth Leon — Soporte Técnico Especializado');
        });
    }

    // Procesar formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputUser = loginUser.value.trim();
            const inputPass = loginPass.value;

            // Ocultar alerta previa
            if (loginAlert) loginAlert.style.display = 'none';

            if (inputUser === VALID_USER && inputPass === VALID_PASS) {
                // Guardar preferencia de recordar usuario
                if (rememberMeCheck && rememberMeCheck.checked) {
                    localStorage.setItem('liteMedic_savedUser', inputUser);
                } else {
                    localStorage.removeItem('liteMedic_savedUser');
                }

                // Inicio de sesión exitoso
                sessionStorage.setItem('liteMedicSession', 'active');
                sessionStorage.setItem('doctorName', 'Dr. Christian A. Rodríguez C.');
                sessionStorage.setItem('doctorSpecialty', 'Ginecología y Obstetricia');
                sessionStorage.setItem('doctorUser', VALID_USER);
                sessionStorage.setItem('loginTimestamp', new Date().toISOString());

                // Feedback visual antes de redirección
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('btn-loading');
                    submitBtn.innerHTML = `<span>Validando acceso...</span> <i class="fas fa-circle-notch fa-spin"></i>`;
                }

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 400);

            } else {
                // Credenciales incorrectas con efecto Shake
                if (authCard) {
                    authCard.classList.remove('shake-animation');
                    void authCard.offsetWidth; // Forzar reflujo
                    authCard.classList.add('shake-animation');
                }

                if (loginAlert && alertMessage) {
                    alertMessage.textContent = 'Usuario o contraseña incorrectos. Verifique sus datos.';
                    loginAlert.style.display = 'flex';
                }

                loginPass.value = '';
                loginPass.focus();
            }
        });
    }
});
