/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE CONSTANCIA MÉDICA
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha actual
    const constFecha = document.getElementById('constFecha');
    if (constFecha) constFecha.value = new Date().toISOString().slice(0, 10);

    const tipoSelect = document.getElementById('constTipoSelect');
    const textoArea = document.getElementById('constTexto');
    const docTitle = document.getElementById('constDocTitle');

    // Plantillas de texto dinámicas según el tipo de constancia
    function updateCertificateTemplate() {
        const tipo = tipoSelect ? tipoSelect.value : 'asistencia';
        const nom = document.getElementById('constNombre').value.trim() || '[NOMBRE DE LA PACIENTE]';
        const ced = document.getElementById('constCedula').value.trim() || '[CÉDULA]';
        const sem = document.getElementById('constSemanas').value.trim() || '26 semanas';

        let text = '';
        if (tipo === 'asistencia') {
            if (docTitle) docTitle.textContent = 'CONSTANCIA DE ASISTENCIA A CONSULTA';
            text = `Por medio de la presente se hace constar que la ciudadana ${nom}, titular de la Cédula de Identidad Nº ${ced}, asistió a este consultorio médico el día de hoy para evaluación médica ginecológica y/o de control, permaneciendo en consulta durante el horario correspondiente.\n\nSe expide a solicitud de la parte interesada para justificar su asistencia.`;
        } else if (tipo === 'embarazo_viaje') {
            if (docTitle) docTitle.textContent = 'CONSTANCIA MÉDICA DE APTITUD PARA VIAJAR (AEROLÍNEAS)';
            text = `HAGO CONSTAR: Que he evaluado clínicamente a la ciudadana ${nom}, titular de la Cédula de Identidad Nº ${ced}, quien cursa con gestación activa de ${sem} de evolución por FUR y ecografía, con feto único vivo en adecuadas condiciones de bienestar fetal y sin signos de alarma obstétrica.\n\nAl momento del examen físico, la paciente se encuentra en óptimas condiciones de salud, cursando embarazo de evolución satisfactoria sin complicaciones médicas, por lo cual se encuentra APTA PARA REALIZAR VIAJES EN TRANSPORTE AÉREO O TERRESTRE conforme a las regulaciones vigentes.`;
        } else if (tipo === 'embarazo_general') {
            if (docTitle) docTitle.textContent = 'CONSTANCIA DE ESTADO DE GRAVIDEZ';
            text = `Por medio de la presente CERTIFICO que la ciudadana ${nom}, titular de la Cédula de Identidad Nº ${ced}, se encuentra bajo control médico prenatal en este servicio, cursando actualmente con un embarazo de ${sem} de gestación, con fecha probable de parto estimada bajo criterios ecográficos.\n\nSe expide para fines de notificación a su empleador e inicio de trámites de protección maternal.`;
        } else if (tipo === 'aptitud') {
            if (docTitle) docTitle.textContent = 'CONSTANCIA DE BUENA SALUD GINECOLÓGICA';
            text = `Por medio de la presente CERTIFICO que he practicado examen clínico y ginecológico integral a la ciudadana ${nom}, titular de la Cédula de Identidad Nº ${ced}, encontrándose clínicamente sana, sin evidencia de procesos infecciosos, lesiones activas ni patologías del aparato genital femenino al momento de la evaluación.`;
        } else if (tipo === 'tratamiento') {
            if (docTitle) docTitle.textContent = 'CONSTANCIA DE TRATAMIENTO MÉDICO';
            text = `Por medio de la presente hago constar que la ciudadana ${nom}, titular de la Cédula de Identidad Nº ${ced}, se encuentra recibiendo tratamiento médico farmacológico y seguimiento ginecológico ambulatorio en este consultorio, requiriendo cumplimiento estricto de su plan terapéutico.`;
        }

        if (textoArea) textoArea.value = text;
    }

    if (tipoSelect) tipoSelect.addEventListener('change', updateCertificateTemplate);

    // 2. Selector de Paciente y Carga de Datos
    function populateConstanciaWithPatient(p) {
        if (!p) return;
        document.getElementById('constNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('constCedula').value = p.cedula || '';
        document.getElementById('constEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);

        if (tipoSelect) tipoSelect.value = p.constanciaTipo || 'prenatal';

        if (p.gynFUR || p.fur) {
            const naegele = ClinicalDB.calculateNaegele(p.gynFUR || p.fur);
            if (naegele.egTexto) document.getElementById('constSemanas').value = `${naegele.egTexto} de gestación`;
        } else {
            const elSem = document.getElementById('constSemanas');
            if (elSem) elSem.value = '34 semanas de gestación';
        }

        updateCertificateTemplate();
        ClinicalDB.showToast(`Datos de ${p.nombre || 'paciente'} cargados`, 'info');
    }

    ClinicalDB.bindPatientSelector('constPatientSelect', (p) => {
        populateConstanciaWithPatient(p);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateConstanciaWithPatient(p);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateConstanciaWithPatient(testP);
    }

    ['constNombre', 'constCedula', 'constSemanas'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateCertificateTemplate);
    });

    // 3. Botones de Acción
    const btnDownloadPDF = document.getElementById('btnDownloadConstPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('constNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('constCedula').value.trim() || 'SinCedula';
            const tipo = tipoSelect ? tipoSelect.value : 'Constancia';
            ClinicalDB.downloadPDF('#printableConstSheet', `Constancia_${tipo}_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintConst');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearConst');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar la constancia?')) {
                document.getElementById('formConstancia').reset();
                if (constFecha) constFecha.value = new Date().toISOString().slice(0, 10);
                updateCertificateTemplate();
                ClinicalDB.showToast('Constancia restablecida', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveConst');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('constNombre').value.trim();
            const ced = document.getElementById('constCedula').value.trim();
            const txt = document.getElementById('constTexto').value.trim();

            if (!nom || !ced || !txt) {
                alert('Complete Nombre, Cédula y Texto para guardar la constancia.');
                return;
            }

            const constData = {
                id: 'CONST-' + Date.now(),
                tipo: 'constancia_medica',
                tipoConstancia: tipoSelect ? tipoSelect.value : 'asistencia',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('constEdad').value,
                fecha: constFecha.value,
                texto: txt,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(constData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            const qrEl = document.getElementById('constQrCode');
            if (qrEl) qrEl.textContent = `CONST-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Constancia de ${nom} guardada con éxito`, 'success');
        });
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const cNom = document.getElementById('constNombre');
        if (cNom && !cNom.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) {
                cNom.value = p.nombre || 'Mariana Sofia Gomez';
                document.getElementById('constCedula').value = p.cedula || '25.489.123';
                document.getElementById('constEdad').value = p.edad || 28;
                document.getElementById('constSemanas').value = '34 semanas de gestación';
                if (tipoSelect) {
                    tipoSelect.value = 'embarazo_general';
                }
                updateCertificateTemplate();
            }
        }
    }, 150);
});
