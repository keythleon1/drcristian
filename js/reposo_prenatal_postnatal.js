/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE CERTIFICADO DE REPOSO PRE Y POSTNATAL (1 SOLA PÁGINA + WHATSAPP)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const rppEmision = document.getElementById('rppFechaEmision');
    const rppFUR = document.getElementById('rppFUR');
    const rppFPP = document.getElementById('rppFPP');
    const rppEG = document.getElementById('rppEG');
    const rppDiagnostico = document.getElementById('rppDiagnostico');

    const rppPreInicio = document.getElementById('rppPreInicio');
    const rppPreFin = document.getElementById('rppPreFin');
    const rppPostInicio = document.getElementById('rppPostInicio');
    const rppPostFin = document.getElementById('rppPostFin');
    const rppReintegro = document.getElementById('rppReintegro');
    const rppEsquemaPost = document.getElementById('rppEsquemaPost');
    const badgePostDuracion = document.getElementById('badgePostDuracion');

    if (rppEmision) rppEmision.value = todayStr;

    // Por defecto, inicializar con una FPP a 6 semanas vista para que el documento nunca tenga campos "dd/mm/aaaa" vacíos
    function setInitialDefaultDates() {
        if (rppFPP && !rppFPP.value) {
            const defaultFpp = new Date(today);
            defaultFpp.setDate(defaultFpp.getDate() + 42);
            rppFPP.value = defaultFpp.toISOString().slice(0, 10);
            if (rppEG && !rppEG.value) rppEG.value = '34 semanas + 0 días';
            if (rppDiagnostico && !rppDiagnostico.value) {
                rppDiagnostico.value = 'Gestación simple activa de 34 semanas por FUR y biometría ecográfica. Feto único vivo en situación longitudinal, presentación cefálica.';
            }
            updateScheduleFromFPP();
        }
    }

    function updateScheduleFromFPP() {
        if (!rppFPP || !rppFPP.value) return;
        const fppDate = new Date(rppFPP.value + 'T00:00:00');
        if (isNaN(fppDate.getTime())) return;

        const postDays = rppEsquemaPost ? parseInt(rppEsquemaPost.value, 10) || 84 : 84;
        const postWeeks = Math.round(postDays / 7);

        if (badgePostDuracion) {
            badgePostDuracion.textContent = `${postWeeks} Semanas (${postDays} Días)`;
        }

        // Período Prenatal: 6 semanas (42 días) antes de la FPP
        const preStart = new Date(fppDate);
        preStart.setDate(preStart.getDate() - 42);

        if (rppPreInicio) rppPreInicio.value = preStart.toISOString().slice(0, 10);
        if (rppPreFin) rppPreFin.value = fppDate.toISOString().slice(0, 10);

        // Período Postnatal: empieza al día siguiente de la FPP
        const postStart = new Date(fppDate);
        postStart.setDate(postStart.getDate() + 1);

        const postEnd = new Date(fppDate);
        postEnd.setDate(postEnd.getDate() + postDays);

        const resume = new Date(postEnd);
        resume.setDate(resume.getDate() + 1);

        if (rppPostInicio) rppPostInicio.value = postStart.toISOString().slice(0, 10);
        if (rppPostFin) rppPostFin.value = postEnd.toISOString().slice(0, 10);
        if (rppReintegro) rppReintegro.value = resume.toISOString().slice(0, 10);
    }

    if (rppFPP) rppFPP.addEventListener('change', updateScheduleFromFPP);
    if (rppEsquemaPost) rppEsquemaPost.addEventListener('change', updateScheduleFromFPP);

    if (rppFUR) {
        rppFUR.addEventListener('change', () => {
            const naegele = ClinicalDB.calculateNaegele(rppFUR.value);
            if (naegele.fpp) {
                rppFPP.value = naegele.fpp;
                if (rppEG && naegele.egTexto) {
                    rppEG.value = `${naegele.egTexto} de gestación`;
                }
                if (rppDiagnostico && naegele.egSemanas !== '') {
                    rppDiagnostico.value = `Gestación simple activa de ${naegele.egSemanas} semanas + ${naegele.egDias} días por FUR. Feto único vivo en presentación cefálica.`;
                }
                updateScheduleFromFPP();
            }
        });
    }

    function populateFromPatient(p) {
        if (!p) return;
        document.getElementById('rppNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('rppCedula').value = p.cedula || '';
        document.getElementById('rppEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);

        const elEmpresa = document.getElementById('rppEmpresa');
        if (elEmpresa) elEmpresa.value = p.empresa || 'Inversiones Mercantiles Valencia C.A.';

        if (p.gynFUR || p.fur) {
            rppFUR.value = p.gynFUR || p.fur;
            const naegele = ClinicalDB.calculateNaegele(p.gynFUR || p.fur);
            if (naegele.fpp) {
                rppFPP.value = naegele.fpp;
                if (rppEG && naegele.egTexto) rppEG.value = `${naegele.egTexto} de gestación`;
                if (rppDiagnostico) {
                    rppDiagnostico.value = p.diagReposoMaternal || `Gestación simple activa de ${naegele.egSemanas || 34} semanas por FUR y control ecográfico. Feto único vivo en presentación cefálica. Reposo prenatal reglamentario correspondiente a 6 semanas (42 días continuos) y período postnatal de 12 semanas (84 días continuos).`;
                }
                updateScheduleFromFPP();
            }
        } else if (p.fpp) {
            rppFPP.value = p.fpp;
            if (rppDiagnostico && p.diagReposoMaternal) rppDiagnostico.value = p.diagReposoMaternal;
            updateScheduleFromFPP();
        }
        ClinicalDB.showToast(`Datos de ${p.nombre || 'gestante'} cargados`, 'info');
    }

    ClinicalDB.bindPatientSelector('repPrePatientSelect', populateFromPatient);

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateFromPatient(p);
    } else {
        // Cargar paciente de prueba preestablecido
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateFromPatient(testP);
    }

    // Botón Enviar por WhatsApp
    const btnWA = document.getElementById('btnSendRepPreWA');
    if (btnWA) {
        btnWA.addEventListener('click', () => {
            const nom = document.getElementById('rppNombre').value.trim() || 'Estimada paciente';
            const ced = document.getElementById('rppCedula').value.trim();
            const preIni = ClinicalDB.formatReadableDate(rppPreInicio.value);
            const postFin = ClinicalDB.formatReadableDate(rppPostFin.value);
            const reint = ClinicalDB.formatReadableDate(rppReintegro.value);

            ClinicalDB.openWhatsAppReminder({
                paciente: nom,
                cedula: ced,
                fecha: rppPreInicio.value,
                tipo: 'prenatal',
                motivo: `Certificado de Reposo Pre y Postnatal emitido. Inicio Prenatal: ${preIni} | Culminación Postnatal: ${postFin} | Reintegro estimado: ${reint}`
            });
        });
    }

    const btnDownloadPDF = document.getElementById('btnDownloadRepPrePDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('rppNombre').value.trim() || 'Gestante';
            const ced = document.getElementById('rppCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableCertificateSheet', `Certificado_Reposo_Pre_Postnatal_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintRepPre');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearRepPre');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el certificado de reposo prenatal?')) {
                document.getElementById('formReposoPrePost').reset();
                if (rppEmision) rppEmision.value = todayStr;
                setInitialDefaultDates();
                ClinicalDB.showToast('Certificado restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveRepPre');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('rppNombre').value.trim();
            const ced = document.getElementById('rppCedula').value.trim();
            const diag = document.getElementById('rppDiagnostico').value.trim();

            if (!nom || !ced || !diag) {
                alert('Complete Nombre, Cédula y Diagnóstico para guardar el reposo maternal.');
                return;
            }

            const postDays = rppEsquemaPost ? parseInt(rppEsquemaPost.value, 10) || 84 : 84;
            const postWeeks = Math.round(postDays / 7);

            const repData = {
                id: 'REP-MAT-' + Date.now(),
                tipo: 'prenatal_postnatal',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('rppEdad').value,
                fecha: rppEmision.value,
                empresa: document.getElementById('rppEmpresa').value,
                fpp: rppFPP.value,
                eg: rppEG.value,
                diagnostico: diag,
                semanas: `${6 + postWeeks} (6 pre + ${postWeeks} post)`,
                preInicio: rppPreInicio.value,
                preFin: rppPreFin.value,
                postInicio: rppPostInicio.value,
                postFin: rppPostFin.value,
                reintegro: rppReintegro.value,
                observaciones: document.getElementById('rppObservaciones').value,
                createdAt: new Date().toISOString()
            };

            const leaves = JSON.parse(localStorage.getItem('liteMedicMedicalLeaves') || '[]');
            leaves.unshift(repData);
            localStorage.setItem('liteMedicMedicalLeaves', JSON.stringify(leaves));

            const qrEl = document.getElementById('rppQrCode');
            if (qrEl) qrEl.textContent = `MAT-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Reposo pre y postnatal de ${nom} guardado`, 'success');
        });
    }
});
