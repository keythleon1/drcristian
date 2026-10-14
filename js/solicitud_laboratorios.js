/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE SOLICITUD DE LABORATORIOS
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha por defecto hoy
    const labFecha = document.getElementById('labFecha');
    if (labFecha) labFecha.value = new Date().toISOString().slice(0, 10);

    function populateLabsWithPatient(p) {
        if (!p) return;
        document.getElementById('labNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('labCedula').value = p.cedula || '';
        document.getElementById('labEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);

        const elInd = document.getElementById('labIndicacion');
        if (elInd) elInd.value = p.labIndicacion || 'Control Prenatal de Rutina del III Trimestre (Semana 34)';

        // Marcar exámenes prenatales típicos del III trimestre
        const checksToSelect = [
            'Hematología Completa',
            'Glicemia en Ayunas',
            'Urea y Creatinina',
            'Examen Simple de Orina',
            'Urocultivo con Antibiograma',
            'VDRL',
            'VIH 1 y 2 (ELISA)',
            'Toxoplasmosis IgG e IgM',
            'Hepatitis B (HBsAg)',
            'PTGO 75g Glucosa (Basal, 1h, 2h)',
            'Cultivo Hisopado Streptococcus Grupo B',
            'Coagulación: TP, TTP y Fibrinógeno'
        ];

        document.querySelectorAll('input[name="labCheck"]').forEach(chk => {
            chk.checked = checksToSelect.includes(chk.value);
        });

        ClinicalDB.showToast(`Paciente ${p.nombre || ''} seleccionada en laboratorios`, 'info');
    }

    ClinicalDB.bindPatientSelector('labPatientSelect', (p) => {
        populateLabsWithPatient(p);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateLabsWithPatient(p);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateLabsWithPatient(testP);
    }

    // 3. Botones de Acción
    const btnDownloadPDF = document.getElementById('btnDownloadLabsPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('labNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('labCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableLabSheet', `Solicitud_Laboratorios_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintLabs');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearLabs');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar la solicitud de laboratorios?')) {
                document.getElementById('formLabRequest').reset();
                if (labFecha) labFecha.value = new Date().toISOString().slice(0, 10);
                ClinicalDB.showToast('Solicitud restablecida', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveLabs');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('labNombre').value.trim();
            const ced = document.getElementById('labCedula').value.trim();

            if (!nom || !ced) {
                alert('Complete Nombre y Cédula para guardar la orden médica de laboratorio.');
                return;
            }

            const selectedLabs = [];
            document.querySelectorAll('input[name="labCheck"]:checked').forEach(c => {
                selectedLabs.push(c.value);
            });

            const labData = {
                id: 'LAB-' + Date.now(),
                tipo: 'solicitud_laboratorios',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('labEdad').value,
                fecha: labFecha.value,
                diagnostico: document.getElementById('labDiagnostico').value,
                examenes: selectedLabs,
                otros: document.getElementById('labOtros').value,
                indicaciones: document.getElementById('labIndicacionesPrep').value,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(labData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            const qrEl = document.getElementById('labQrCode');
            if (qrEl) qrEl.textContent = `LAB-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Solicitud de laboratorios para ${nom} guardada`, 'success');
        });
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const labNom = document.getElementById('labNombre');
        if (labNom && !labNom.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) {
                labNom.value = p.nombre || 'Mariana Sofia Gomez';
                document.getElementById('labCedula').value = p.cedula || '25.489.123';
                document.getElementById('labEdad').value = p.edad || 28;
                document.getElementById('labDiagnostico').value = 'Control Prenatal de III Trimestre (Semana 34) / Despistaje Paraclínico';
                document.getElementById('labOtros').value = 'Perfil prenatal de control: TSH, Glicemia, Urocultivo, Cultivo para Estreptococo Grupo B';

                // Marcar exámenes prenatales de rutina
                const checkboxes = document.querySelectorAll('#formLabRequest input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    const val = (cb.value || '').toLowerCase();
                    if (val.includes('hematologia') || val.includes('glicemia') || val.includes('urocultivo') || val.includes('orina') || val.includes('vih') || val.includes('vdrl')) {
                        cb.checked = true;
                    }
                });
            }
        }
    }, 150);
});
