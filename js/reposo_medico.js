/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE REPOSO MÉDICO GENERAL
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fechas iniciales
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const rmEmision = document.getElementById('rmFechaEmision');
    const rmInicio = document.getElementById('rmFechaInicio');
    const rmFin = document.getElementById('rmFechaFin');
    const rmReintegro = document.getElementById('rmFechaReintegro');
    const rmDiasNum = document.getElementById('rmDiasNumero');
    const rmDiasLetras = document.getElementById('rmDiasLetras');

    if (rmEmision) rmEmision.value = todayStr;
    if (rmInicio) rmInicio.value = todayStr;

    // Calcular fechas según número de días
    function updateDatesFromDays() {
        if (!rmInicio || !rmDiasNum || !rmFin) return;
        const days = parseInt(rmDiasNum.value) || 1;
        const startDate = new Date(rmInicio.value);

        if (!isNaN(startDate.getTime())) {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + (days - 1));
            rmFin.value = endDate.toISOString().slice(0, 10);

            if (rmReintegro) {
                const resumeDate = new Date(endDate);
                resumeDate.setDate(resumeDate.getDate() + 1);
                rmReintegro.value = resumeDate.toISOString().slice(0, 10);
            }

            // Convertir número a texto usando ClinicalDB
            if (rmDiasLetras) {
                rmDiasLetras.value = ClinicalDB.daysToSpanishWords(days);
            }
        }
    }

    if (rmDiasNum) rmDiasNum.addEventListener('input', updateDatesFromDays);
    if (rmInicio) rmInicio.addEventListener('change', updateDatesFromDays);
    updateDatesFromDays();

    function populateRepMedWithPatient(p) {
        if (!p) return;
        document.getElementById('rmNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('rmCedula').value = p.cedula || '';
        document.getElementById('rmEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);

        const elEmp = document.getElementById('rmEmpresa');
        if (elEmp) elEmp.value = p.empresa || 'Inversiones Mercantiles Valencia C.A.';

        if (rmDiasNum) rmDiasNum.value = p.diasReposo || 3;
        updateDatesFromDays();

        const elDiag = document.getElementById('rmDiagnostico');
        if (elDiag) elDiag.value = p.motivoReposo || 'Lumbalgia gestacional mecánica y fatiga física moderada. Se indica reposo físico absoluto.';

        ClinicalDB.showToast(`Datos de ${p.nombre || 'paciente'} cargados`, 'info');
    }

    ClinicalDB.bindPatientSelector('repMedPatientSelect', (p) => {
        populateRepMedWithPatient(p);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateRepMedWithPatient(p);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateRepMedWithPatient(testP);
    }

    // 3. Botones de Acción
    const btnDownloadPDF = document.getElementById('btnDownloadRepMedPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('rmNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('rmCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableRepMedSheet', `Reposo_Medico_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintRepMed');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearRepMed');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el reposo médico?')) {
                document.getElementById('formReposoMedico').reset();
                if (rmEmision) rmEmision.value = todayStr;
                if (rmInicio) rmInicio.value = todayStr;
                updateDatesFromDays();
                ClinicalDB.showToast('Formulario restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveRepMed');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('rmNombre').value.trim();
            const ced = document.getElementById('rmCedula').value.trim();
            const diag = document.getElementById('rmDiagnostico').value.trim();

            if (!nom || !ced || !diag) {
                alert('Complete Nombre, Cédula y Diagnóstico para guardar el reposo.');
                return;
            }

            const repData = {
                id: 'REP-' + Date.now(),
                tipo: 'reposo_medico',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('rmEdad').value,
                fecha: rmEmision.value,
                empresa: document.getElementById('rmEmpresa').value,
                diagnostico: diag,
                dias: rmDiasNum.value,
                diasLetras: rmDiasLetras.value,
                tipoReposo: document.getElementById('rmTipoReposo').value,
                fechaInicio: rmInicio.value,
                fechaFin: rmFin.value,
                fechaReintegro: rmReintegro.value,
                observaciones: document.getElementById('rmObservaciones').value,
                createdAt: new Date().toISOString()
            };

            const leaves = JSON.parse(localStorage.getItem('liteMedicMedicalLeaves') || '[]');
            leaves.unshift(repData);
            localStorage.setItem('liteMedicMedicalLeaves', JSON.stringify(leaves));

            const qrEl = document.getElementById('rmQrCode');
            if (qrEl) qrEl.textContent = `REP-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Reposo médico de ${nom} guardado`, 'success');
        });
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const rmNom = document.getElementById('rmNombre');
        if (rmNom && !rmNom.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) {
                rmNom.value = p.nombre || 'Mariana Sofia Gomez';
                document.getElementById('rmCedula').value = p.cedula || '25.489.123';
                document.getElementById('rmEdad').value = p.edad || 28;
                document.getElementById('rmEmpresa').value = p.empresa || 'Inversiones Mercantiles Valencia C.A.';
                document.getElementById('rmDiagnostico').value = 'Gestación de 34 semanas por FUR / Amenaza de parto pretérmino en remisión / Reposo obstétrico preventivo';
                if (rmDiasNum) {
                    rmDiasNum.value = '7';
                    updateDatesFromDays();
                }
            }
        }
    }, 150);
});
