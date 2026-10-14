/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE REFERENCIA MÉDICA / INTERCONSULTA
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha actual
    const refFecha = document.getElementById('refFecha');
    if (refFecha) refFecha.value = new Date().toISOString().slice(0, 10);

    // 2. Selector de Paciente
    ClinicalDB.bindPatientSelector('refPatientSelect', (p) => {
        document.getElementById('refNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('refCedula').value = p.cedula || '';
        document.getElementById('refEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);
        ClinicalDB.showToast(`Paciente ${p.nombre || ''} seleccionada en referencia`, 'info');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) {
            document.getElementById('refNombre').value = p.nombre || p.nombreApellido || '';
            document.getElementById('refCedula').value = p.cedula || '';
            document.getElementById('refEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);
        }
    } else {
        const nomEl = document.getElementById('refNombre');
        if (nomEl && !nomEl.value.trim()) {
            const demo = ClinicalDB.getPatients().find(p => p.cedula === '25.489.123') || ClinicalDB.getDemoPatients()[0];
            if (demo) {
                document.getElementById('refNombre').value = demo.nombre || demo.nombreApellido || '';
                document.getElementById('refCedula').value = demo.cedula || '';
                document.getElementById('refEdad').value = demo.edad || ClinicalDB.calculateAge(demo.fechaNacimiento);
                const refEsp = document.getElementById('refEspecialidad');
                if (refEsp) refEsp.value = 'Medicina Materno-Fetal / Perinatología';
                const refCent = document.getElementById('refCentro');
                if (refCent && !refCent.value) refCent.value = 'Centro Policlínico Valencia';
                const refMot = document.getElementById('refMotivo');
                if (refMot && !refMot.value) refMot.value = 'Evaluación perinatológica de control y seguimiento Doppler fetoplacentario';
                const refRes = document.getElementById('refResumen');
                if (refRes && !refRes.value) refRes.value = 'Se remite paciente primigesta de 28 años cursando embarazo de 34 semanas por FUR y ecografía de primer trimestre. En evaluación obstétrica actual presenta parámetros biométricos y Doppler dentro de percentiles adecuados, con control prenatal regular. Se solicita valoración especializada complementaria para optimizar manejo del tercer trimestre.';
                const refDiag = document.getElementById('refDiagnostico');
                if (refDiag && !refDiag.value) refDiag.value = '1. Gestación simple activa de 34 semanas. 2. Primigesta. Evolución obstétrica y Doppler fetal satisfactorios.';
                const refTrat = document.getElementById('refTratamiento');
                if (refTrat && !refTrat.value) refTrat.value = 'Sulfato Ferroso 200mg + Ácido Fólico 1mg VO OD. Calcio 600mg + Vit D3 VO OD.';
            }
        }
    }

    // 3. Botones de Acción
    const btnPrint = document.getElementById('btnPrintRef');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            const btnDownload = document.getElementById('btnDownloadRefPDF');
            if (btnDownload) btnDownload.click();
            else window.print();
        });
    }

    const btnDownloadPDF = document.getElementById('btnDownloadRefPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('refNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('refCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableRefSheet', `Referencia_Medica_${nom}_${ced}`);
        });
    }

    const btnClear = document.getElementById('btnClearRef');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar la referencia médica?')) {
                document.getElementById('formReferenciaMedica').reset();
                if (refFecha) refFecha.value = new Date().toISOString().slice(0, 10);
                ClinicalDB.showToast('Formulario restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveRef');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('refNombre').value.trim();
            const ced = document.getElementById('refCedula').value.trim();
            const mot = document.getElementById('refMotivo').value.trim();

            if (!nom || !ced || !mot) {
                alert('Complete Nombre, Cédula y Motivo de Referencia para guardar.');
                return;
            }

            const refData = {
                id: 'REF-' + Date.now(),
                tipo: 'referencia_medica',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('refEdad').value,
                fecha: refFecha.value,
                especialidad: document.getElementById('refEspecialidad').value,
                centro: document.getElementById('refCentro').value,
                motivo: mot,
                resumen: document.getElementById('refResumen').value,
                diagnostico: document.getElementById('refDiagnostico').value,
                tratamiento: document.getElementById('refTratamiento').value,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(refData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            const qrEl = document.getElementById('refQrCode');
            if (qrEl) qrEl.textContent = `REF-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Referencia de ${nom} guardada con éxito`, 'success');
        });
    }
});
