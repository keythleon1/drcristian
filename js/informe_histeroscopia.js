/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE INFORME DE HISTEROSCOPIA
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha por defecto hoy
    const hFecha = document.getElementById('hFecha');
    if (hFecha) hFecha.value = new Date().toISOString().slice(0, 10);

    // 2. Vincular selector de paciente
    ClinicalDB.bindPatientSelector('histeroPatientSelect', (p) => {
        document.getElementById('hNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('hCedula').value = p.cedula || '';
        document.getElementById('hEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);
        ClinicalDB.showToast(`Paciente ${p.nombre || ''} cargada en histeroscopia`, 'info');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) {
            document.getElementById('hNombre').value = p.nombre || p.nombreApellido || '';
            document.getElementById('hCedula').value = p.cedula || '';
            document.getElementById('hEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);
        }
    } else {
        const nomEl = document.getElementById('hNombre');
        if (nomEl && !nomEl.value.trim()) {
            const demo = ClinicalDB.getPatients().find(p => p.cedula === '25.489.123') || ClinicalDB.getDemoPatients()[0];
            if (demo) {
                document.getElementById('hNombre').value = demo.nombre || demo.nombreApellido || '';
                document.getElementById('hCedula').value = demo.cedula || '';
                document.getElementById('hEdad').value = demo.edad || ClinicalDB.calculateAge(demo.fechaNacimiento);
                const hTipo = document.getElementById('hTipo');
                if (hTipo && !hTipo.value) hTipo.value = 'Histeroscopia Diagnóstica de Consultorio';
                const hMedio = document.getElementById('hMedio');
                if (hMedio && !hMedio.value) hMedio.value = 'Solución Salina Fisiológica 0.9%';
                const hAnestesia = document.getElementById('hAnestesia');
                if (hAnestesia && !hAnestesia.value) hAnestesia.value = 'Sin anestesia (Vaginoscopia de Bettocchi)';
                const hIndicacion = document.getElementById('hIndicacion');
                if (hIndicacion && !hIndicacion.value) hIndicacion.value = 'Evaluación de cavidad endometrial y descartar patología endocavitaria';
                const hEndocervix = document.getElementById('hEndocervix');
                if (hEndocervix && !hEndocervix.value) hEndocervix.value = 'Canal endocervical permeable, mucosa endocervical de aspecto normal';
                const hCavidad = document.getElementById('hCavidad');
                if (hCavidad && !hCavidad.value) hCavidad.value = 'Cavidad uterina simétrica, normoconfigurada, sin septos ni adherencias';
                const hEndometrio = document.getElementById('hEndometrio');
                if (hEndometrio && !hEndometrio.value) hEndometrio.value = 'Endometrio homogéneo, fase correspondiente con ciclo, sin engrosamiento ni pólipos';
                const hOstiumDer = document.getElementById('hOstiumDer');
                if (hOstiumDer && !hOstiumDer.value) hOstiumDer.value = 'Ostium tubárico derecho permeable, visible y anatómico';
                const hOstiumIzq = document.getElementById('hOstiumIzq');
                if (hOstiumIzq && !hOstiumIzq.value) hOstiumIzq.value = 'Ostium tubárico izquierdo permeable, visible y anatómico';
                const hProcedimiento = document.getElementById('hProcedimiento');
                if (hProcedimiento && !hProcedimiento.value) hProcedimiento.value = 'Exploración histeroscópica satisfactoria bajo técnica de vaginoscopia sin instrumentalización traumática. Tolerancia óptima.';
                const hDiagnostico = document.getElementById('hDiagnostico');
                if (hDiagnostico && !hDiagnostico.value) hDiagnostico.value = 'Cavidad uterina y ostiums tubáricos histeroscópicamente normales. Ausencia de lesiones intracavitarias.';
                const hPlan = document.getElementById('hPlan');
                if (hPlan && !hPlan.value) hPlan.value = 'Alta médica ambulatoria inmediata. Control rutinario habitual.';
            }
        }
    }

    const btnDownloadPDF = document.getElementById('btnDownloadHisteroPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('hNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('hCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableHisteroSheet', `Informe_Histeroscopia_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintHistero');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearHistero');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el informe de histeroscopia?')) {
                document.getElementById('formHisteroReport').reset();
                if (hFecha) hFecha.value = new Date().toISOString().slice(0, 10);
                ClinicalDB.showToast('Informe histeroscópico restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveHistero');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('hNombre').value.trim();
            const ced = document.getElementById('hCedula').value.trim();
            const diag = document.getElementById('hDiagnostico').value.trim();

            if (!nom || !ced || !diag) {
                alert('Complete Nombre, Cédula y Diagnóstico para guardar el informe de histeroscopia.');
                return;
            }

            const histeroData = {
                id: 'HIST-' + Date.now(),
                tipo: 'informe_histeroscopia',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('hEdad').value,
                fecha: hFecha.value,
                tipoProcedimiento: document.getElementById('hTipo').value,
                medio: document.getElementById('hMedio').value,
                anestesia: document.getElementById('hAnestesia').value,
                indicacion: document.getElementById('hIndicacion').value,
                endocervix: document.getElementById('hEndocervix').value,
                cavidad: document.getElementById('hCavidad').value,
                endometrio: document.getElementById('hEndometrio').value,
                ostiumDer: document.getElementById('hOstiumDer').value,
                ostiumIzq: document.getElementById('hOstiumIzq').value,
                procedimiento: document.getElementById('hProcedimiento').value,
                diagnostico: diag,
                plan: document.getElementById('hPlan').value,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(histeroData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            const qrEl = document.getElementById('hQrCode');
            if (qrEl) qrEl.textContent = `HIST-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Informe de histeroscopia de ${nom} guardado`, 'success');
        });
    }
});
