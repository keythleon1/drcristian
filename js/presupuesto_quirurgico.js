/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE PRESUPUESTO QUIRÚRGICO
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha actual
    const pqFecha = document.getElementById('pqFecha');
    if (pqFecha) pqFecha.value = new Date().toISOString().slice(0, 10);

    // 2. Sumatoria automática de montos
    const inputsCost = document.querySelectorAll('.budget-input');
    const totalLabel = document.getElementById('budgetTotalLabel');

    function calculateTotal() {
        let sum = 0;
        inputsCost.forEach(inp => {
            const val = parseFloat(inp.value) || 0;
            sum += val;
        });

        if (totalLabel) {
            totalLabel.textContent = `$${sum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
        }
    }

    inputsCost.forEach(inp => inp.addEventListener('input', calculateTotal));
    calculateTotal();

    function populatePQWithPatient(p) {
        if (!p) return;
        document.getElementById('pqNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('pqCedula').value = p.cedula || '';

        const elProc = document.getElementById('pqProcedimientoSelect');
        if (elProc) elProc.value = 'Cesárea Segmentaria + Salpingoclasia Bilateral';

        const elClinica = document.getElementById('pqClinica');
        if (elClinica) elClinica.value = 'Centro Médico Quirúrgico Valencia / Clínica La Viña';

        const elDiag = document.getElementById('pqDiagnostico');
        if (elDiag) elDiag.value = p.diagnostico || 'Gestación a término de 38-39 semanas. Feto en presentación cefálica. Cesárea electiva programada.';

        const elCir = document.getElementById('costCirujano');
        if (elCir && !elCir.value) elCir.value = '600';
        const elAyu = document.getElementById('costAyudante');
        if (elAyu && !elAyu.value) elAyu.value = '150';
        const elAnes = document.getElementById('costAnestesiologo');
        if (elAnes && !elAnes.value) elAnes.value = '200';
        const elPed = document.getElementById('costPediatra');
        if (elPed && !elPed.value) elPed.value = '150';
        calculateTotal();

        ClinicalDB.showToast(`Paciente ${p.nombre || ''} seleccionada en presupuesto`, 'info');
    }

    ClinicalDB.bindPatientSelector('pqPatientSelect', (p) => {
        populatePQWithPatient(p);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populatePQWithPatient(p);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populatePQWithPatient(testP);
    }

    const btnWaCirugia = document.getElementById('btnWaCirugiaReminder');
    if (btnWaCirugia) {
        btnWaCirugia.addEventListener('click', () => {
            const fecha = document.getElementById('pqFechaCirugia')?.value;
            const paciente = document.getElementById('pqNombre')?.value.trim();
            const cedula = document.getElementById('pqCedula')?.value.trim();
            const proc = document.getElementById('pqProcedimientoSelect')?.value || 'Intervención Quirúrgica';
            const clinica = document.getElementById('pqClinica')?.value || '';
            if (!fecha) {
                alert('Seleccione la fecha de programación quirúrgica primero.');
                return;
            }
            ClinicalDB.openWhatsAppReminder({
                paciente,
                cedula,
                fecha,
                tipo: 'cirugia',
                motivo: `${proc}${clinica ? ' en ' + clinica : ''}`
            });
        });
    }

    // 4. Botones de Acción
    const btnDownloadPDF = document.getElementById('btnDownloadPQPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('pqNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('pqCedula').value.trim() || 'SinCedula';
            ClinicalDB.downloadPDF('#printablePQSheet', `Presupuesto_Quirurgico_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintPQ');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearPQ');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el presupuesto quirúrgico?')) {
                document.getElementById('formPresupuestoQuirurgico').reset();
                if (pqFecha) pqFecha.value = new Date().toISOString().slice(0, 10);
                calculateTotal();
                ClinicalDB.showToast('Presupuesto restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSavePQ');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('pqNombre').value.trim();
            const ced = document.getElementById('pqCedula').value.trim();

            if (!nom || !ced) {
                alert('Complete Nombre y Cédula para guardar el presupuesto.');
                return;
            }

            const quoteData = {
                id: 'COT-' + Date.now(),
                tipo: 'presupuesto_quirurgico',
                nombre: nom,
                cedula: ced,
                fecha: pqFecha.value,
                procedimiento: document.getElementById('pqProcedimientoSelect').value,
                clinica: document.getElementById('pqClinica').value,
                diagnostico: document.getElementById('pqDiagnostico').value,
                total: totalLabel ? totalLabel.textContent : '$0.00 USD',
                createdAt: new Date().toISOString()
            };

            const quotes = JSON.parse(localStorage.getItem('liteMedicSurgicalQuotes') || '[]');
            quotes.unshift(quoteData);
            localStorage.setItem('liteMedicSurgicalQuotes', JSON.stringify(quotes));

            const qrEl = document.getElementById('pqQrCode');
            if (qrEl) qrEl.textContent = `COT-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Presupuesto para ${nom} guardado`, 'success');
        });
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const pqNom = document.getElementById('pqNombre');
        if (pqNom && !pqNom.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) {
                pqNom.value = p.nombre || 'Mariana Sofia Gomez';
                document.getElementById('pqCedula').value = p.cedula || '25.489.123';
                document.getElementById('pqClinica').value = 'Centro Médico Quirúrgico Los Ángeles';
                document.getElementById('pqDiagnostico').value = 'Embarazo a término de 38 semanas / Feto único vivo cefálico / Cesárea electiva programada';
                const fCirugia = document.getElementById('pqFechaCirugia');
                if (fCirugia) {
                    const cirDate = new Date();
                    cirDate.setDate(cirDate.getDate() + 14);
                    fCirugia.value = cirDate.toISOString().slice(0, 10);
                }
            }
        }
    }, 150);
});
