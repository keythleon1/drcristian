/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE INFORME ECOGRÁFICO INTEGRAL (GINECOLÓGICO, OBSTÉTRICO Y MAMARIO)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const ecoFecha = document.getElementById('ecoFecha');
    if (ecoFecha) ecoFecha.value = new Date().toISOString().slice(0, 10);

    const selectTipo = document.getElementById('ecoTipoEstudio');
    const secUtero = document.getElementById('secEcoUtero');
    const secAnexos = document.getElementById('secEcoAnexos');
    const secObs = document.getElementById('secEcoObstetrica');
    const secMama = document.getElementById('secEcoMama');
    const reportTitle = document.getElementById('ecoReportTitle');

    function updateStudyType() {
        if (!selectTipo) return;
        const val = selectTipo.value;

        if (val === 'mamaria') {
            if (secUtero) secUtero.style.display = 'none';
            if (secAnexos) secAnexos.style.display = 'none';
            if (secObs) secObs.style.display = 'none';
            if (secMama) secMama.style.display = 'block';
            if (reportTitle) reportTitle.textContent = 'INFORME DE ECOGRAFÍA MAMARIA BILATERAL';
        } else if (val === 'obstetrica') {
            if (secUtero) secUtero.style.display = 'none';
            if (secAnexos) secAnexos.style.display = 'none';
            if (secObs) secObs.style.display = 'block';
            if (secMama) secMama.style.display = 'none';
            if (reportTitle) reportTitle.textContent = 'INFORME DE ECOGRAFÍA OBSTÉTRICA MATERNO-FETAL';
        } else {
            if (secUtero) secUtero.style.display = 'block';
            if (secAnexos) secAnexos.style.display = 'block';
            if (secObs) secObs.style.display = 'none';
            if (secMama) secMama.style.display = 'none';
            if (reportTitle) {
                reportTitle.textContent = val === 'transvaginal'
                    ? 'INFORME DE ECOGRAFÍA TRANSVAGINAL'
                    : 'INFORME DE ECOGRAFÍA PÉLVICA GINECOLÓGICA';
            }
        }
    }

    if (selectTipo) {
        selectTipo.addEventListener('change', updateStudyType);
        updateStudyType();
    }

    // Cálculo automático de volumen uterino (L x AP x T x 0.523 / 1000)
    const inputMedidas = document.getElementById('ecoUteroMedidas');
    const inputVol = document.getElementById('ecoUteroVol');
    if (inputMedidas && inputVol) {
        inputMedidas.addEventListener('input', () => {
            const nums = inputMedidas.value.match(/(\d+(\.\d+)?)/g);
            if (nums && nums.length >= 3) {
                const l = parseFloat(nums[0]);
                const ap = parseFloat(nums[1]);
                const t = parseFloat(nums[2]);
                const vol = ((l * ap * t * 0.523) / 1000).toFixed(1);
                inputVol.value = `${vol} cc`;
            }
        });
    }

    // Cálculo automático de Edad Gestacional cuando se ingresa FUR
    const ecoFUR = document.getElementById('ecoFUR');
    const ecoObsEGE = document.getElementById('ecoObsEGE');
    if (ecoFUR) {
        ecoFUR.addEventListener('change', () => {
            const calc = ClinicalDB.calculateNaegele(ecoFUR.value);
            if (calc.egTexto && ecoObsEGE && !ecoObsEGE.value) {
                ecoObsEGE.value = calc.egTexto;
            }
        });
    }

    // Botón de Plantilla Normal Inteligente
    const btnFillNormal = document.getElementById('btnFillNormalEco');
    if (btnFillNormal) {
        btnFillNormal.addEventListener('click', () => {
            const val = selectTipo ? selectTipo.value : 'transvaginal';
            const concl = document.getElementById('ecoConclusion');
            const sug = document.getElementById('ecoSugerencias');

            if (val === 'mamaria') {
                document.getElementById('ecoMamaDer').value = 'Piel y complejo areola-pezón conservados. Parénquima mamario fibroglandular homogéneo sin lesiones nodulares sólidas ni quísticas. Conductos galactóforos no dilatados. Región axilar libre.';
                document.getElementById('ecoMamaIzq').value = 'Piel y complejo areola-pezón normales. Tejido fibroglandular simétrico sin imágenes focales ni distorsiones de la arquitectura. Región axilar sin adenopatías.';
                document.getElementById('ecoBirads').value = 'BI-RADS 1';
                concl.value = '1. ESTUDIO ECOGRÁFICO MAMARIO BILATERAL NORMAL.\n2. CLASIFICACIÓN ACR BI-RADS 1.';
                sug.value = 'Control ecográfico mamario anual preventivo.';
            } else if (val === 'obstetrica') {
                document.getElementById('ecoObsVitalidad').value = 'Feto único vivo con adecuada reactividad motora';
                document.getElementById('ecoObsFCF').value = '144 lpm (Rítmico)';
                document.getElementById('ecoObsPlacenta').value = 'Corporal anterior normoinserta, sin hematomas retroplacentarios';
                document.getElementById('ecoObsLA').value = 'Líquido amniótico en cantidad normal para la edad gestacional';
                document.getElementById('ecoObsPBF').value = 'Perfil Biofísico 8/8 puntos • Cérvix cerrado de longitud conservada';
                document.getElementById('ecoObsDoppler').value = 'Anatomía fetal evaluada sin alteraciones morfológicas evidentes. Flujometría Doppler materno-fetal dentro de percentiles fisiológicos.';
                const eg = document.getElementById('ecoObsEGE').value || 'acorde a FUR';
                concl.value = `1. GESTACIÓN SIMPLE ACTIVA (${eg.toUpperCase()}).\n2. CRECIMIENTO FETAL, LÍQUIDO AMNIÓTICO Y HEMODINAMIA DOPPLER DENTRO DE LÍMITES NORMALES.`;
                sug.value = 'Continuar control prenatal periódico y suplementación vitamínica.';
            } else {
                document.getElementById('ecoUteroMedidas').value = '74 x 42 x 38 mm';
                document.getElementById('ecoUteroVol').value = '61.8 cc';
                document.getElementById('ecoMiometrio').value = 'Homogéneo, contornos regulares, sin lesiones focales';
                document.getElementById('ecoEndometrioEspesor').value = '7.2 mm';
                document.getElementById('ecoEndometrioPatron').value = 'Trilaminar, homogéneo, interfase endo-miometrial conservada';
                document.getElementById('ecoOvarioDer').value = '31 x 19 x 18 mm (Vol: 5.5 cc). Morfología y desarrollo folicular conservados.';
                document.getElementById('ecoOvarioIzq').value = '30 x 18 x 17 mm (Vol: 4.8 cc). Ecoestructura normal sin masas anexiales.';
                document.getElementById('ecoDouglas').value = 'Fondo de saco de Douglas libre de colecciones.';
                concl.value = '1. ÚTERO, ENDOMETRIO Y AMBOS OVARIOS ECOGRÁFICAMENTE NORMALES.\n2. FONDO DE SACO DE DOUGLAS LIBRE.';
                sug.value = 'Control ginecológico y ecográfico anual de rutina.';
            }
            ClinicalDB.showToast('Plantilla de hallazgos normales aplicada', 'info');
        });
    }

    ClinicalDB.bindPatientSelector('ecoPatientSelect', (p) => {
        populateEcoWithPatient(p);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateEcoWithPatient(p);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateEcoWithPatient(testP);
    }

    function populateEcoWithPatient(p) {
        if (!p) return;
        document.getElementById('ecoNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('ecoCedula').value = p.cedula || '';
        document.getElementById('ecoEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);

        if (selectTipo) {
            selectTipo.value = 'obstetrica';
            updateStudyType();
        }

        if (p.gynFUR || p.fur) {
            document.getElementById('ecoFUR').value = p.gynFUR || p.fur;
            const calc = ClinicalDB.calculateNaegele(p.gynFUR || p.fur);
            if (calc.egTexto && ecoObsEGE) ecoObsEGE.value = calc.egTexto;
        }

        const elMot = document.getElementById('ecoMotivo');
        if (elMot) elMot.value = p.motivoConsulta || 'Control Prenatal - Evaluación Ecográfica de III Trimestre';

        // Llenar parámetros obstétricos
        const setValId = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
        setValId('ecoObsVitalidad', 'Feto único vivo activo');
        setValId('ecoObsPresentacion', 'cefalica');
        setValId('ecoObsDorso', 'izquierdo');
        setValId('ecoObsFCF', '142 lpm (Rítmico)');
        setValId('ecoObsDBP', '85 mm');
        setValId('ecoObsCC', '310 mm');
        setValId('ecoObsCA', '300 mm');
        setValId('ecoObsLF', '66 mm');
        setValId('ecoObsPeso', '2.350 g (Percentil 50)');
        setValId('ecoObsEGE', '34 sem + 1 d');
        setValId('ecoObsPlacenta', 'Fúndica posterior normoinserta, Grado II/III');
        setValId('ecoObsLA', 'Volumen adecuado, ILA: 13.8 cm');
        setValId('ecoObsPBF', 'PBF 10/10 puntos • Cérvix: 38 mm cerrado');
        setValId('ecoObsDoppler', 'Doppler materno-fetal dentro de percentiles normales. Flujo anterógrado continuo en arteria umbilical sin resistencias patológicas.');
        setValId('ecoConclusion', '1. GESTACIÓN INTRAUTERINA SIMPLE ACTIVA DE 34 SEMANAS POR BIOMETRÍA FETAL ARMÓNICA CON FUM.\n2. CRECIMIENTO FETAL EN PERCENTIL 50 (HADLOCK).\n3. ANATOMÍA FETAL Y PERFIL BIOFÍSICO 10/10 SIN ALTERACIONES. BIENESTAR FETAL CONSERVADO.');
        setValId('ecoSugerencias', 'Continuar control prenatal habitual. Próxima evaluación en 2 semanas.');

        ClinicalDB.showToast(`Datos de ${p.nombre || 'paciente'} cargados en ecografía`, 'info');
    }

    const btnDownloadPDF = document.getElementById('btnDownloadEcoPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const nom = document.getElementById('ecoNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('ecoCedula').value.trim() || 'SinCedula';
            const tipo = selectTipo ? selectTipo.value : 'Ecografia';
            ClinicalDB.downloadPDF('#printableEcoSheet', `Informe_Ecografico_${tipo}_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintEco');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnDownloadPDF) btnDownloadPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearEco');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el formulario de ecografía?')) {
                document.getElementById('formEcoReport').reset();
                if (ecoFecha) ecoFecha.value = new Date().toISOString().slice(0, 10);
                updateStudyType();
                ClinicalDB.showToast('Formulario restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveEco');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('ecoNombre').value.trim();
            const ced = document.getElementById('ecoCedula').value.trim();
            const concl = document.getElementById('ecoConclusion').value.trim();

            if (!nom || !ced || !concl) {
                alert('Complete Nombre, Cédula y Conclusión para guardar el informe ecográfico.');
                return;
            }

            const ecoData = {
                id: 'ECO-' + Date.now(),
                tipo: 'informe_ecografico',
                modalidad: selectTipo ? selectTipo.value : 'transvaginal',
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('ecoEdad').value,
                fecha: ecoFecha.value,
                fur: document.getElementById('ecoFUR').value,
                motivo: document.getElementById('ecoMotivo').value,
                uteroPosicion: document.getElementById('ecoUteroPosicion')?.value || '',
                uteroMedidas: document.getElementById('ecoUteroMedidas')?.value || '',
                uteroVol: document.getElementById('ecoUteroVol')?.value || '',
                miometrio: document.getElementById('ecoMiometrio')?.value || '',
                endometrioEspesor: document.getElementById('ecoEndometrioEspesor')?.value || '',
                endometrioPatron: document.getElementById('ecoEndometrioPatron')?.value || '',
                ovarioDer: document.getElementById('ecoOvarioDer')?.value || '',
                ovarioIzq: document.getElementById('ecoOvarioIzq')?.value || '',
                douglas: document.getElementById('ecoDouglas')?.value || '',
                obsVitalidad: document.getElementById('ecoObsVitalidad')?.value || '',
                obsPresentacion: document.getElementById('ecoObsPresentacion')?.value || '',
                obsFCF: document.getElementById('ecoObsFCF')?.value || '',
                obsDBP: document.getElementById('ecoObsDBP')?.value || '',
                obsCC: document.getElementById('ecoObsCC')?.value || '',
                obsCA: document.getElementById('ecoObsCA')?.value || '',
                obsLF: document.getElementById('ecoObsLF')?.value || '',
                obsPeso: document.getElementById('ecoObsPeso')?.value || '',
                obsEGE: document.getElementById('ecoObsEGE')?.value || '',
                obsPlacenta: document.getElementById('ecoObsPlacenta')?.value || '',
                obsLA: document.getElementById('ecoObsLA')?.value || '',
                obsPBF: document.getElementById('ecoObsPBF')?.value || '',
                obsDoppler: document.getElementById('ecoObsDoppler')?.value || '',
                mamaDer: document.getElementById('ecoMamaDer')?.value || '',
                mamaIzq: document.getElementById('ecoMamaIzq')?.value || '',
                birads: document.getElementById('ecoBirads')?.value || '',
                conclusion: concl,
                sugerencias: document.getElementById('ecoSugerencias').value,
                createdAt: new Date().toISOString()
            };

            const reports = JSON.parse(localStorage.getItem('liteMedicReports') || '[]');
            reports.unshift(ecoData);
            localStorage.setItem('liteMedicReports', JSON.stringify(reports));

            const qrEl = document.getElementById('ecoQrCode');
            if (qrEl) qrEl.textContent = `ECO-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Informe ecográfico de ${nom} guardado`, 'success');
        });
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const nomInput = document.getElementById('ecoNombre');
        if (nomInput && !nomInput.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) {
                nomInput.value = p.nombre || 'Mariana Sofia Gomez';
                document.getElementById('ecoCedula').value = p.cedula || '25.489.123';
                document.getElementById('ecoEdad').value = p.edad || 28;
                document.getElementById('ecoFUR').value = p.gynFUR || '2026-04-27';
                document.getElementById('ecoMotivo').value = 'Evaluación de Crecimiento Fetal y Flujometría Doppler (Semana 34)';
                if (selectTipo) {
                    selectTipo.value = 'obstetrica';
                    updateStudyType();
                }
                const btnNormal = document.getElementById('btnFillNormalEco');
                if (btnNormal) btnNormal.click();
            }
        }
    }, 150);
});
