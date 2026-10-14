/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE INFORME MÉDICO CLÍNICO
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha por defecto hoy
    const infFecha = document.getElementById('infFecha');
    if (infFecha) infFecha.value = new Date().toISOString().slice(0, 10);

    // 2. Vincular selector de paciente
    ClinicalDB.bindPatientSelector('infPatientSelect', (p) => {
        populateReportWithPatient(p);
    });

    // 3. Revisar Parámetros URL o Cargar Paciente de Prueba por Defecto
    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateReportWithPatient(p);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateReportWithPatient(testP);
    }

    function populateReportWithPatient(p) {
        if (!p) return;
        document.getElementById('infNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('infCedula').value = p.cedula || '';
        document.getElementById('infEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);

        const elDir = document.getElementById('infDirigido');
        if (elDir) elDir.value = p.informeDirigido || 'A Quien Pueda Interesar / Medicina Ocupacional';

        const elEA = document.getElementById('infEnfermedadActual');
        if (elEA) elEA.value = p.informeEnfermedadActual || p.motivoConsulta || '';

        // Armar antecedentes automáticos
        let antText = '';
        if (p.gynMenarquia) antText += `Menarquia: ${p.gynMenarquia} años. `;
        if (p.gynFUR) antText += `FUR: ${p.gynFUR}. `;
        if (p.aoGestas !== undefined) antText += `G:${p.aoGestas} P:${p.aoPartos || 0} C:${p.aoCesareas || 0} A:${p.aoAbortos || 0}. `;
        if (p.antEnfermedad) antText += `Patológicos: ${p.antEnfermedad}. `;
        if (p.antAlergias) antText += `Alergias: ${p.antAlergias}. `;
        if (p.antQuirurgicos) antText += `Quirúrgicos: ${p.antQuirurgicos}. `;

        const elAnt = document.getElementById('infAntecedentes');
        if (elAnt) elAnt.value = antText.trim();

        const elEF = document.getElementById('infExamenFisico');
        if (elEF) elEF.value = p.informeExamenFisico || 'Paciente en estables condiciones generales, normotensa. Examen cardiopulmonar y abdominal dentro de límites normales.';

        const elEst = document.getElementById('infEstudios');
        if (elEst) elEst.value = p.prenatalEstudios || 'Ecografía Doppler materno-fetal normal. ILA y perfil biofísico adecuados.';

        const elDiag = document.getElementById('infDiagnostico');
        if (elDiag) elDiag.value = p.diagnostico || 'Gestación simple activa en evolución satisfactoria.';

        const elPlan = document.getElementById('infPlan');
        if (elPlan) elPlan.value = p.informePlan || p.prenatalTratamiento || '1. Reposo relativo.\n2. Continuar control prenatal.';

        ClinicalDB.showToast(`Datos de ${p.nombre || 'paciente'} cargados en el informe`, 'info');
    }

    // 4. Botones de Acción
    const btnPDF = document.getElementById('btnDownloadReportPDF');
    if (btnPDF) {
        btnPDF.addEventListener('click', () => {
            const nom = document.getElementById('infNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('infCedula').value.trim() || 'SC';
            ClinicalDB.downloadPDF('#printableReportSheet', `Informe_Medico_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintReport');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnPDF) btnPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearReport');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar los campos del informe?')) {
                document.getElementById('formMedicalReport').reset();
                if (infFecha) infFecha.value = new Date().toISOString().slice(0, 10);
                ClinicalDB.showToast('Informe restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveReport');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('infNombre').value.trim();
            const ced = document.getElementById('infCedula').value.trim();
            const diag = document.getElementById('infDiagnostico').value.trim();

            if (!nom || !ced || !diag) {
                alert('Por favor complete Nombre, Cédula y Diagnóstico para guardar el informe.');
                return;
            }

            const reportData = {
                id: 'INF-' + Date.now(),
                tipo: 'informe_medico',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('infEdad').value,
                fecha: infFecha.value,
                dirigido: document.getElementById('infDirigido').value,
                enfermedadActual: document.getElementById('infEnfermedadActual').value,
                antecedentes: document.getElementById('infAntecedentes').value,
                examenFisico: document.getElementById('infExamenFisico').value,
                estudios: document.getElementById('infEstudios').value,
                diagnostico: diag,
                plan: document.getElementById('infPlan').value,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(reportData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            // Actualizar código de verificación
            const qrCodeEl = document.getElementById('infQrCode');
            if (qrCodeEl) qrCodeEl.textContent = `INF-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Informe de ${nom} guardado con éxito`, 'success');
        });
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const infNom = document.getElementById('infNombre');
        if (infNom && !infNom.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) {
                populateReportWithPatient(p);
                document.getElementById('infDirigido').value = 'A QUIEN PUEDA INTERESAR / CONTROL MÉDICO OBSTÉTRICO';
                document.getElementById('infEnfermedadActual').value = 'Paciente femenina de 28 años de edad, cursando con gestación activa de 34 semanas por FUR y ecografía del I trimestre. Acude para evaluación y control clínico prenatal.';
                document.getElementById('infExamenFisico').value = 'Paciente en buenas condiciones generales, afebril, hidratada, eupneica. T.A: 110/70 mmHg, F.C: 76 lpm. Abdomen grávido, altura uterina de 31 cm acorde a edad gestacional. Feto único vivo en situación longitudinal, presentación cefálica, FCF: 142 lpm. Movimientos fetales activos. No se palpan contracciones uterinas. Miembros inferiores sin edemas.';
                document.getElementById('infEstudios').value = 'Ecografía Doppler Materno-Fetal (Semana 34): Crecimiento fetal percentil 50 (PFE 2280g). Índice de líquido amniótico normal. Perfil hemodinámico sin alteraciones. Perfil Biofísico 10/10.';
                document.getElementById('infDiagnostico').value = '1. GESTACIÓN SIMPLE ACTIVA DE 34 SEMANAS POR FUR Y BIOMETRÍA ECOGRÁFICA.\n2. FETO ÚNICO VIVO EN PRESENTACIÓN CEFÁLICA.\n3. EVOLUCIÓN OBSTÉTRICA SATISFACTORIA.';
                document.getElementById('infPlan').value = '1. Continuar suplementación prenatal: Sulfato Ferroso + Ácido Fólico 1 tableta VO diaria y Calcio 600mg VO diario.\n2. Mantener reposo relativo, evitar esfuerzos físicos intensos e hidratación adecuada (mínimo 2.5 litros de agua al día).\n3. Próximo control prenatal en 2 semanas con ecografía Doppler de control.';
            }
        }
    }, 150);
});
