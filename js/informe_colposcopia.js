/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE INFORME DE COLPOSCOPIA
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha actual
    const colpoFecha = document.getElementById('colpoFecha');
    if (colpoFecha) colpoFecha.value = new Date().toISOString().slice(0, 10);

    // 2. Selector de pacientes
    ClinicalDB.bindPatientSelector('colpoPatientSelect', (p) => {
        populateColpoWithPatient(p);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateColpoWithPatient(p);
    } else {
        const nomEl = document.getElementById('colpoNombre');
        if (nomEl && !nomEl.value.trim()) {
            const demo = ClinicalDB.getPatients().find(p => p.cedula === '25.489.123') || ClinicalDB.getDemoPatients()[0];
            if (demo) {
                populateColpoWithPatient(demo);
                const colpoAdecuacion = document.getElementById('colpoAdecuacion');
                if (colpoAdecuacion && !colpoAdecuacion.value) colpoAdecuacion.value = 'Adecuada. Se visualiza completamente la unión escamocolumnar (UEC)';
                const colpoUEC = document.getElementById('colpoUEC');
                if (colpoUEC && !colpoUEC.value) colpoUEC.value = 'Completamente visible (Tipo 1)';
                const colpoZT = document.getElementById('colpoZT');
                if (colpoZT && !colpoZT.value) colpoZT.value = 'Zona de transformación Tipo 1';
                const colpoAcido = document.getElementById('colpoAcido');
                if (colpoAcido && !colpoAcido.value) colpoAcido.value = 'Negativo. Epitelio acetoblanco ausente';
                const colpoSchiller = document.getElementById('colpoSchiller');
                if (colpoSchiller && !colpoSchiller.value) colpoSchiller.value = 'Lugol Positivo homogéneo (Test Negativo)';
                const colpoVasos = document.getElementById('colpoVasos');
                if (colpoVasos && !colpoVasos.value) colpoVasos.value = 'Patrón vascular normal de calibre regular';
                const colpoOtrosHallazgos = document.getElementById('colpoOtrosHallazgos');
                if (colpoOtrosHallazgos && !colpoOtrosHallazgos.value) colpoOtrosHallazgos.value = 'Ectropion fisiológico periorificial. Mucosa vaginal eutrófica sin lesiones';
                const colpoBiopsia = document.getElementById('colpoBiopsia');
                if (colpoBiopsia && !colpoBiopsia.value) colpoBiopsia.value = 'No requerida';
                const colpoDiagnostico = document.getElementById('colpoDiagnostico');
                if (colpoDiagnostico && !colpoDiagnostico.value) colpoDiagnostico.value = 'Colposcopia satisfactoria dentro de límites normales. Ausencia de hallazgos sugerentes de neoplasia intraepitelial. Control preventivo rutinario.';
                const colpoConducta = document.getElementById('colpoConducta');
                if (colpoConducta && !colpoConducta.value) colpoConducta.value = 'Control citológico y colposcópico anual.';
            }
        }
    }

    function populateColpoWithPatient(p) {
        if (!p) return;
        document.getElementById('colpoNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('colpoCedula').value = p.cedula || '';
        document.getElementById('colpoEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);
        if (p.gynFUR || p.fur) document.getElementById('colpoFUR').value = p.gynFUR || p.fur;
        if (p.gynCitologia) document.getElementById('colpoCitologia').value = p.gynCitologia;

        if (p.aoGestas !== undefined) {
            document.getElementById('colpoParidad').value = `G:${p.aoGestas} P:${p.aoPartos || 0} C:${p.aoCesareas || 0} A:${p.aoAbortos || 0}`;
        }
        ClinicalDB.showToast(`Datos de ${p.nombre || 'paciente'} cargados en colposcopia`, 'info');
    }

    const btnDownloadPDF = document.getElementById('btnDownloadColpoPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('colpoNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('colpoCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableColpoSheet', `Informe_Colposcopia_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintColpo');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearColpo');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el informe de colposcopia?')) {
                document.getElementById('formColpoReport').reset();
                if (colpoFecha) colpoFecha.value = new Date().toISOString().slice(0, 10);
                ClinicalDB.showToast('Informe colposcópico restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveColpo');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('colpoNombre').value.trim();
            const ced = document.getElementById('colpoCedula').value.trim();
            const diag = document.getElementById('colpoDiagnostico').value.trim();

            if (!nom || !ced || !diag) {
                alert('Complete Nombre, Cédula y Diagnóstico para guardar el informe de colposcopia.');
                return;
            }

            const colpoData = {
                id: 'COLPO-' + Date.now(),
                tipo: 'informe_colposcopia',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('colpoEdad').value,
                fecha: colpoFecha.value,
                adecuacion: document.getElementById('colpoAdecuacion').value,
                uec: document.getElementById('colpoUEC').value,
                zt: document.getElementById('colpoZT').value,
                acido: document.getElementById('colpoAcido').value,
                schiller: document.getElementById('colpoSchiller').value,
                vasos: document.getElementById('colpoVasos').value,
                otros: document.getElementById('colpoOtrosHallazgos').value,
                biopsia: document.getElementById('colpoBiopsia').value,
                diagnostico: diag,
                conducta: document.getElementById('colpoConducta').value,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(colpoData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            const qrEl = document.getElementById('colpoQrCode');
            if (qrEl) qrEl.textContent = `COLPO-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Informe colposcópico de ${nom} guardado`, 'success');
        });
    }
});
