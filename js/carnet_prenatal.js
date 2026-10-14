/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE LA CARTILLA FÍSICA / DIGITAL DE CONTROL PRENATAL
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Control de Pestañas de la Cartilla
    const tabBtns = document.querySelectorAll('.booklet-tab-btn');
    const pages = document.querySelectorAll('.booklet-page');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            tabBtns.forEach(b => b.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active-page'));

            btn.classList.add('active');
            const targetPage = document.getElementById(targetId);
            if (targetPage) targetPage.classList.add('active-page');
        });
    });

    // 2. Cargar Selector de Pacientes
    ClinicalDB.bindPatientSelector('selectPrenatalPatient', (patient) => {
        populateBooklet(patient);
    });

    // 3. Revisar Parámetros de URL o Cargar Paciente de Prueba
    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const found = ClinicalDB.getPatientByCedula(paramCed);
        if (found) populateBooklet(found);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateBooklet(testP);
    }

    // 4. Calculadores automáticos
    const bPeso = document.getElementById('bPeso');
    const bTalla = document.getElementById('bTalla');
    const bIMC = document.getElementById('bIMC');

    function updateIMC() {
        if (!bPeso || !bTalla || !bIMC) return;
        const res = ClinicalDB.calculateIMC(bPeso.value, bTalla.value);
        bIMC.value = res.value !== '--' ? `${res.value} (${res.label})` : '';
    }

    if (bPeso) bPeso.addEventListener('input', updateIMC);
    if (bTalla) bTalla.addEventListener('input', updateIMC);

    const bFUR = document.getElementById('bFUR');
    const coverFPP = document.getElementById('coverFPP');

    if (bFUR) {
        bFUR.addEventListener('change', () => {
            const naegele = ClinicalDB.calculateNaegele(bFUR.value);
            if (coverFPP && naegele.fpp) {
                coverFPP.value = naegele.fpp;
            }
        });
    }

    // 5. Botón Descargar PDF
    const btnPDF = document.getElementById('btnDownloadBookletPDF');
    const btnPrint = document.getElementById('btnPrintBooklet');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnPDF) btnPDF.click();
        });
    }
    if (btnPDF) {
        btnPDF.addEventListener('click', () => {
            const nom = document.getElementById('coverDe').value.trim() || document.getElementById('bNombre').value.trim() || 'Gestante';
            const ced = document.getElementById('bCedula').value.trim() || 'SC';

            // Mostrar todas las paginas de la cartilla temporalmente para el PDF
            const pages = document.querySelectorAll('.booklet-page');
            const prevDisplays = [];
            pages.forEach((p, idx) => {
                prevDisplays[idx] = p.style.display;
                p.style.display = 'block';
            });

            ClinicalDB.downloadPDF('.booklet-container', `Carnet_Control_Prenatal_${nom}_${ced}`);

            setTimeout(() => {
                pages.forEach((p, idx) => {
                    p.style.display = prevDisplays[idx];
                });
            }, 2000);
        });
    }

    // 6. Botón Guardar
    const btnSave = document.getElementById('btnSaveBooklet');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const ced = document.getElementById('bCedula').value.trim();
            const nom = document.getElementById('coverDe').value.trim() || document.getElementById('bNombre').value.trim();

            if (!ced) {
                alert('Por favor ingrese la cédula de la paciente antes de guardar.');
                return;
            }

            const data = {
                cedula: ced,
                nombre: nom,
                nombreApellido: nom,
                fpp: coverFPP ? coverFPP.value : '',
                peso: bPeso ? bPeso.value : '',
                talla: bTalla ? bTalla.value : '',
                fur: bFUR ? bFUR.value : '',
                edad: document.getElementById('bEdad') ? document.getElementById('bEdad').value : '',
                lugar: document.getElementById('bLugar') ? document.getElementById('bLugar').value : '',
                evolucion: document.getElementById('bEvolucion') ? document.getElementById('bEvolucion').value : ''
            };

            ClinicalDB.savePatient(data);
            ClinicalDB.showToast('Carnet de Control Prenatal guardado con éxito', 'success');
        });
    }

    function populateBooklet(p) {
        if (!p) return;
        const setVal = (id, v) => {
            const el = document.getElementById(id);
            if (el && v !== undefined) el.value = v;
        };

        const nom = p.nombre || p.nombreApellido || '';
        setVal('coverDe', nom);
        setVal('bNombre', nom);
        setVal('bCedula', p.cedula || '');
        setVal('bEdad', p.edad || '');
        setVal('bFn', p.fechaNacimiento || p.fechaNac || '');
        setVal('bLugar', p.lugarNacimiento || p.lugar || '');
        setVal('bPeso', p.peso || '');
        setVal('bTalla', p.talla || '');
        setVal('bCaptacion', p.fechaCaptacion || p.fecha || '');
        setVal('bFUR', p.gynFUR || p.fur || '');

        if (p.gynFUR || p.fur) {
            const naegele = ClinicalDB.calculateNaegele(p.gynFUR || p.fur);
            if (coverFPP && naegele.fpp) coverFPP.value = naegele.fpp;
        } else if (p.fpp && coverFPP) {
            coverFPP.value = p.fpp;
        }

        setVal('bMenarquia', p.gynMenarquia || '');
        setVal('bParejas', p.gynParejas || '');
        setVal('bITS', p.gynITS || '');
        setVal('bCiclo', p.gynCiclo || '');

        const gestas = p.aoGestas !== undefined ? `G:${p.aoGestas} ` : '';
        const partos = p.aoPartos !== undefined ? `P:${p.aoPartos} ` : '';
        const ces = p.aoCesareas !== undefined ? `C:${p.aoCesareas} ` : '';
        const abortos = p.aoAbortos !== undefined ? `A:${p.aoAbortos}` : '';
        setVal('bAO', `${gestas}${partos}${ces}${abortos}`.trim());

        updateIMC();
        ClinicalDB.showToast(`Carnet de ${nom} cargado`, 'info');
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si la portada está vacía
    setTimeout(() => {
        const coverDe = document.getElementById('coverDe');
        if (coverDe && !coverDe.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) populateBooklet(p);
        }
    }, 150);
});
