/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE INFORME DE EGRESO (EPICRISIS)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fechas iniciales
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const egEgreso = document.getElementById('egFechaEgreso');
    const egIngreso = document.getElementById('egFechaIngreso');
    const egProxima = document.getElementById('egProximaCita');

    if (egEgreso) egEgreso.value = todayStr;
    if (egIngreso) {
        const ingDate = new Date(today);
        ingDate.setDate(ingDate.getDate() - 1);
        egIngreso.value = ingDate.toISOString().slice(0, 10);
    }
    if (egProxima) {
        const prox = new Date(today);
        prox.setDate(prox.getDate() + 7);
        egProxima.value = prox.toISOString().slice(0, 10);
    }

    // 2. Selector de Paciente
    ClinicalDB.bindPatientSelector('egresoPatientSelect', (p) => {
        document.getElementById('egNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('egCedula').value = p.cedula || '';
        document.getElementById('egEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);
        ClinicalDB.showToast(`Paciente ${p.nombre || ''} seleccionada en egreso`, 'info');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) {
            document.getElementById('egNombre').value = p.nombre || p.nombreApellido || '';
            document.getElementById('egCedula').value = p.cedula || '';
            document.getElementById('egEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);
        }
    } else {
        const nomEl = document.getElementById('egNombre');
        if (nomEl && !nomEl.value.trim()) {
            const demo = ClinicalDB.getPatients().find(p => p.cedula === '25.489.123') || ClinicalDB.getDemoPatients()[0];
            if (demo) {
                document.getElementById('egNombre').value = demo.nombre || demo.nombreApellido || '';
                document.getElementById('egCedula').value = demo.cedula || '';
                document.getElementById('egEdad').value = demo.edad || ClinicalDB.calculateAge(demo.fechaNacimiento);
                const egDiagIng = document.getElementById('egDiagIngreso');
                if (egDiagIng && !egDiagIng.value) egDiagIng.value = 'Embarazo a término de 39 semanas + Trabajo de parto en fase activa';
                const egProc = document.getElementById('egProcedimiento');
                if (egProc && !egProc.value) egProc.value = 'Cesárea segmentaria tipo Kerr + Alumbramiento dirigido no complicado';
                const egEvol = document.getElementById('egEvolucion');
                if (egEvol && !egEvol.value) egEvol.value = 'Paciente cursa estancia postoperatoria con adecuada evolución. Hemodinámicamente estable, afebril, adecuada tolerancia a la vía oral y diuresis espontánea. Herida quirúrgica afrontada, limpia y seca. Loquios hemáticos escasos no fétidos.';
                const egRnSex = document.getElementById('egRnSexo');
                if (egRnSex) egRnSex.value = 'Femenino';
                const egRnPeso = document.getElementById('egRnPeso');
                if (egRnPeso && !egRnPeso.value) egRnPeso.value = '3.250 g';
                const egRnTalla = document.getElementById('egRnTalla');
                if (egRnTalla && !egRnTalla.value) egRnTalla.value = '50 cm';
                const egRnApgar = document.getElementById('egRnApgar');
                if (egRnApgar && !egRnApgar.value) egRnApgar.value = '9 / 10 puntos';
                const egDiagEg = document.getElementById('egDiagEgreso');
                if (egDiagEg && !egDiagEg.value) egDiagEg.value = '1. Puerperio quirúrgico mediato sin complicaciones.\n2. Recién nacida única viva femenina a término adecuada para edad gestacional, vigorosa.';
                const egTrat = document.getElementById('egTratamientoAlta');
                if (egTrat && !egTrat.value) egTrat.value = '1. Cefadroxilo 500mg vía oral cada 12 horas por 7 días.\n2. Ibuprofeno 400mg vía oral cada 8 horas SOS dolor.\n3. Sulfato Ferroso 200mg + Ácido Fólico 1mg VO OD.\n4. Cura diaria y asepsia de herida operatoria con agua y jabón neutro, mantener seca.\n5. Lactancia materna exclusiva a libre demanda.';
            }
        }
    }

    const btnWaEgreso = document.getElementById('btnWaEgresoReminder');
    if (btnWaEgreso) {
        btnWaEgreso.addEventListener('click', () => {
            const fecha = document.getElementById('egProximaCita')?.value;
            const paciente = document.getElementById('egNombre')?.value.trim();
            const cedula = document.getElementById('egCedula')?.value.trim();
            if (!fecha) {
                alert('Seleccione la fecha de cita de control postquirúrgico primero.');
                return;
            }
            ClinicalDB.openWhatsAppReminder({
                paciente,
                cedula,
                fecha,
                tipo: 'postoperatorio',
                motivo: 'Control Postoperatorio y Evaluación de Alta Médica'
            });
        });
    }

    // 3. Botones de Acción
    const btnDownloadPDF = document.getElementById('btnDownloadEgresoPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('egNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('egCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printableEgresoSheet', `Informe_Egreso_Epicrisis_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintEgreso');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearEgreso');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el informe de egreso?')) {
                document.getElementById('formInformeEgreso').reset();
                if (egEgreso) egEgreso.value = todayStr;
                ClinicalDB.showToast('Informe de egreso restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveEgreso');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('egNombre').value.trim();
            const ced = document.getElementById('egCedula').value.trim();
            const diag = document.getElementById('egDiagEgreso').value.trim();

            if (!nom || !ced || !diag) {
                alert('Complete Nombre, Cédula y Diagnóstico de Egreso para guardar.');
                return;
            }

            const egData = {
                id: 'EGR-' + Date.now(),
                tipo: 'informe_egreso',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('egEdad').value,
                fechaIngreso: egIngreso.value,
                fechaEgreso: egEgreso.value,
                diagIngreso: document.getElementById('egDiagIngreso').value,
                procedimiento: document.getElementById('egProcedimiento').value,
                evolucion: document.getElementById('egEvolucion').value,
                rnSexo: document.getElementById('egRnSexo').value,
                rnPeso: document.getElementById('egRnPeso').value,
                rnTalla: document.getElementById('egRnTalla').value,
                rnApgar: document.getElementById('egRnApgar').value,
                diagEgreso: diag,
                tratamientoAlta: document.getElementById('egTratamientoAlta').value,
                proximaCita: egProxima.value,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(egData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            const qrEl = document.getElementById('egQrCode');
            if (qrEl) qrEl.textContent = `EGR-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Informe de egreso de ${nom} guardado`, 'success');
        });
    }
});
