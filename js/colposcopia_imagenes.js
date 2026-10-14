/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE MONTAJE DE IMÁGENES COLPOSCÓPICAS
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha por defecto hoy
    const cpFecha = document.getElementById('cpFecha');
    if (cpFecha) cpFecha.value = new Date().toISOString().slice(0, 10);

    // 2. Selector de Pacientes
    ClinicalDB.bindPatientSelector('colpoPhotoPatientSelect', (p) => {
        document.getElementById('cpNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('cpCedula').value = p.cedula || '';
        ClinicalDB.showToast(`Paciente ${p.nombre || ''} seleccionada para fotos`, 'info');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) {
            document.getElementById('cpNombre').value = p.nombre || p.nombreApellido || '';
            document.getElementById('cpCedula').value = p.cedula || '';
        }
    } else {
        const nomEl = document.getElementById('cpNombre');
        if (nomEl && !nomEl.value.trim()) {
            const demo = ClinicalDB.getPatients().find(p => p.cedula === '25.489.123') || ClinicalDB.getDemoPatients()[0];
            if (demo) {
                document.getElementById('cpNombre').value = demo.nombre || demo.nombreApellido || '';
                document.getElementById('cpCedula').value = demo.cedula || '';
                const d1 = document.getElementById('descPhoto1');
                if (d1 && !d1.value) d1.value = 'Foto 1: Visión panorámica del cérvix con solución salina normal';
                const d2 = document.getElementById('descPhoto2');
                if (d2 && !d2.value) d2.value = 'Foto 2: Cérvix tras aplicación de ácido acético al 5% (Negativo)';
                const d3 = document.getElementById('descPhoto3');
                if (d3 && !d3.value) d3.value = 'Foto 3: Test de Schiller con solución de Lugol (Positivo / Test Negativo)';
                const d4 = document.getElementById('descPhoto4');
                if (d4 && !d4.value) d4.value = 'Foto 4: Detalle de zona de transformación y canal endocervical';
            }
        }
    }

    // 3. Manejo de Carga de Imágenes con Previsualización Rápida
    [1, 2, 3, 4].forEach(idx => {
        const fileInput = document.getElementById(`filePhoto${idx}`);
        const imgPrev = document.getElementById(`imgPreview${idx}`);
        const box = document.getElementById(`boxPhoto${idx}`);

        if (fileInput && imgPrev) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (evt) {
                        imgPrev.src = evt.target.result;
                        imgPrev.style.display = 'block';
                        if (box) box.classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });

    // 4. Botones de Acción
    const btnPrint = document.getElementById('btnPrintPhotos');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            const btnDownload = document.getElementById('btnDownloadPhotosPDF');
            if (btnDownload) btnDownload.click();
            else window.print();
        });
    }

    const btnDownloadPDF = document.getElementById('btnDownloadPhotosPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('cpNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('cpCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableColpoPhotosSheet', `Lamina_Colposcopia_Fotos_${nom}_${ced}`);
        });
    }

    const btnClear = document.getElementById('btnClearPhotos');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar todas las fotografías?')) {
                [1, 2, 3, 4].forEach(idx => {
                    const f = document.getElementById(`filePhoto${idx}`);
                    const img = document.getElementById(`imgPreview${idx}`);
                    const desc = document.getElementById(`descPhoto${idx}`);
                    const box = document.getElementById(`boxPhoto${idx}`);
                    if (f) f.value = '';
                    if (img) { img.src = ''; img.style.display = 'none'; }
                    if (desc) desc.value = '';
                    if (box) box.classList.remove('has-image');
                });
                ClinicalDB.showToast('Lámina fotográfica limpiada', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSavePhotos');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('cpNombre').value.trim();
            const ced = document.getElementById('cpCedula').value.trim();
            if (!nom || !ced) {
                alert('Ingrese nombre y cédula de la paciente antes de guardar');
                return;
            }

            const photosData = {
                id: 'COLPO-IMG-' + Date.now(),
                nombre: nom,
                cedula: ced,
                fecha: cpFecha.value,
                foto1: { clock: document.getElementById('clockPhoto1').value, desc: document.getElementById('descPhoto1').value },
                foto2: { clock: document.getElementById('clockPhoto2').value, desc: document.getElementById('descPhoto2').value },
                foto3: { clock: document.getElementById('clockPhoto3').value, desc: document.getElementById('descPhoto3').value },
                foto4: { clock: document.getElementById('clockPhoto4').value, desc: document.getElementById('descPhoto4').value },
                conclusion: document.getElementById('cpConclusion').value,
                savedAt: new Date().toISOString()
            };

            const savedList = JSON.parse(localStorage.getItem('liteMedicColpoMontages') || '[]');
            savedList.unshift(photosData);
            localStorage.setItem('liteMedicColpoMontages', JSON.stringify(savedList));

            const qrEl = document.getElementById('cpQrCode');
            if (qrEl) qrEl.textContent = `IMG-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast('Lámina fotográfica colposcópica guardada', 'success');
        });
    }
});
