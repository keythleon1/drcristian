/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE HISTORIA CLÍNICA DUAL (OBSTETRICIA & GINECOLOGÍA)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentMode = 'prenatal'; // 'prenatal' o 'ginecologia'

    const btnModePrenatal = document.getElementById('btnModePrenatal');
    const btnModeGyn = document.getElementById('btnModeGyn');
    const sectionPrenatal = document.getElementById('sectionPrenatalOnly');
    const sectionGyn = document.getElementById('sectionGynOnly');
    const printTitle = document.getElementById('printRecordTypeTitle');

    // 1. Alternancia Dual de Modalidad
    function setMode(mode) {
        currentMode = mode;
        if (mode === 'prenatal') {
            btnModePrenatal.className = 'dual-btn active-dual-prenatal';
            btnModeGyn.className = 'dual-btn';
            if (sectionPrenatal) sectionPrenatal.style.display = 'block';
            if (sectionGyn) sectionGyn.style.display = 'none';
            if (printTitle) printTitle.textContent = 'HISTORIA CLÍNICA OBSTÉTRICA (CONTROL PRENATAL)';
        } else {
            btnModeGyn.className = 'dual-btn active-dual-gyn';
            btnModePrenatal.className = 'dual-btn';
            if (sectionPrenatal) sectionPrenatal.style.display = 'none';
            if (sectionGyn) sectionGyn.style.display = 'block';
            if (printTitle) printTitle.textContent = 'HISTORIA CLÍNICA GINECOLÓGICA';
        }
    }

    if (btnModePrenatal) btnModePrenatal.addEventListener('click', () => setMode('prenatal'));
    if (btnModeGyn) btnModeGyn.addEventListener('click', () => setMode('ginecologia'));

    // 2. Calculadores en Vivo (IMC, Edad, Naegele)
    const pPeso = document.getElementById('pPeso');
    const pTalla = document.getElementById('pTalla');
    const badgeIMC = document.getElementById('badgeIMC');

    function updateIMC() {
        if (!pPeso || !pTalla || !badgeIMC) return;
        const result = ClinicalDB.calculateIMC(pPeso.value, pTalla.value);
        badgeIMC.className = `calc-badge ${result.class}`;
        badgeIMC.textContent = result.value !== '--' ? `${result.value} (${result.label})` : '-- (Sin calcular)';
    }

    if (pPeso) pPeso.addEventListener('input', updateIMC);
    if (pTalla) pTalla.addEventListener('input', updateIMC);

    // Cálculo de Edad según fecha de nacimiento
    const pFechaNac = document.getElementById('pFechaNac');
    const pEdad = document.getElementById('pEdad');
    if (pFechaNac && pEdad) {
        pFechaNac.addEventListener('change', () => {
            const age = ClinicalDB.calculateAge(pFechaNac.value);
            if (age !== '') pEdad.value = age;
        });
    }

    // Cálculo Regla de Naegele y Semanas Gestacionales
    const gynFUR = document.getElementById('gynFUR');
    const prenatalFPP = document.getElementById('prenatalFPP');
    const badgeEG = document.getElementById('badgeEG');

    function updateGestationalCalc() {
        if (!gynFUR || !prenatalFPP || !badgeEG) return;
        const calc = ClinicalDB.calculateNaegele(gynFUR.value);
        if (calc.fpp) {
            prenatalFPP.value = calc.fpp;
            badgeEG.textContent = calc.egTexto ? `${calc.egTexto} (FPP: ${calc.fppFormatted})` : `FPP: ${calc.fppFormatted}`;
            badgeEG.className = 'calc-badge status-normal';
        } else {
            badgeEG.textContent = 'Ingrese FUR para calcular';
            badgeEG.className = 'calc-badge';
        }
    }

    if (gynFUR) gynFUR.addEventListener('change', updateGestationalCalc);

    // 3. Tablas Dinámicas (Agregar filas)
    const btnAddConsulta = document.getElementById('btnAddRowConsulta');
    const tableConsultas = document.getElementById('tableConsultas');
    if (btnAddConsulta && tableConsultas) {
        btnAddConsulta.addEventListener('click', () => {
            const tbody = tableConsultas.querySelector('tbody');
            const tr = document.createElement('tr');
            const todayStr = new Date().toISOString().slice(0, 10);
            tr.innerHTML = `
                <td><input type="date" value="${todayStr}"></td>
                <td><input type="text" placeholder="65.0"></td>
                <td><input type="text" placeholder="110/70"></td>
                <td><input type="text" placeholder="80"></td>
                <td><input type="text" placeholder="36.5"></td>
                <td><input type="text" placeholder="99"></td>
                <td><input type="text" placeholder="24"></td>
                <td><input type="text" placeholder="140"></td>
                <td><input type="text" placeholder="Cefálica"></td>
                <td><input type="text" placeholder="No"></td>
                <td><input type="text" placeholder="Normal"></td>
                <td><input type="text" placeholder="Sem"></td>
                <td class="no-print"><button type="button" class="btn-row-del" onclick="deleteTableRow(this)"><i class="far fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    const btnAddLab = document.getElementById('btnAddRowLab');
    const tableLabs = document.getElementById('tableLabs');
    if (btnAddLab && tableLabs) {
        btnAddLab.addEventListener('click', () => {
            const tbody = tableLabs.querySelector('tbody');
            const tr = document.createElement('tr');
            const todayStr = new Date().toISOString().slice(0, 10);
            tr.innerHTML = `
                <td><input type="date" value="${todayStr}"></td>
                <td><input type="text" placeholder="12.0"></td>
                <td><input type="text" placeholder="36"></td>
                <td><input type="text" placeholder="7.500"></td>
                <td><input type="text" placeholder="220.000"></td>
                <td><input type="text" placeholder="NR"></td>
                <td><input type="text" placeholder="NR"></td>
                <td><input type="text" placeholder="80"></td>
                <td><input type="text" placeholder="22"></td>
                <td><input type="text" placeholder="0.7"></td>
                <td><input type="text" placeholder="Norm"></td>
                <td><input type="text" placeholder="-"></td>
                <td class="no-print"><button type="button" class="btn-row-del" onclick="deleteTableRow(this)"><i class="far fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    const btnAddEco = document.getElementById('btnAddRowEco');
    const tableEcos = document.getElementById('tableEcos');
    if (btnAddEco && tableEcos) {
        btnAddEco.addEventListener('click', () => {
            const tbody = tableEcos.querySelector('tbody');
            const tr = document.createElement('tr');
            const todayStr = new Date().toISOString().slice(0, 10);
            tr.innerHTML = `
                <td><input type="date" value="${todayStr}"></td>
                <td><input type="text" placeholder="DBP"></td>
                <td><input type="text" placeholder="CC"></td>
                <td><input type="text" placeholder="CA"></td>
                <td><input type="text" placeholder="LF"></td>
                <td><input type="text" placeholder="Normo"></td>
                <td><input type="text" placeholder="Norm"></td>
                <td><input type="text" placeholder="Norm"></td>
                <td><input type="text" placeholder="cm"></td>
                <td><input type="text" placeholder="g"></td>
                <td><input type="text" placeholder="8/8"></td>
                <td><input type="text" placeholder="sem"></td>
                <td class="no-print"><button type="button" class="btn-row-del" onclick="deleteTableRow(this)"><i class="far fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. Revisar Parámetros URL al Iniciar
    const urlParams = new URLSearchParams(window.location.search);
    const paramCedula = urlParams.get('cedula');
    const paramNombre = urlParams.get('nombre');
    const paramTipo = urlParams.get('tipo');

    if (paramTipo === 'ginecologia') setMode('ginecologia');
    else setMode('prenatal');

    if (paramCedula) {
        const found = ClinicalDB.getPatientByCedula(paramCedula);
        if (found) {
            loadPatientData(found);
        } else {
            const elCed = document.getElementById('pCedula');
            const elNom = document.getElementById('pNombre');
            if (elCed) elCed.value = paramCedula;
            if (elNom && paramNombre) elNom.value = paramNombre;
        }
    } else {
        // Cargar paciente de prueba oficial preestablecido
        const testP = ClinicalDB.getTestPatient();
        if (testP) loadPatientData(testP);
    }

    // 5. Botones de Acción (Formulario / Elaborar Historia)
    const btnSave = document.getElementById('btnSaveRecord');
    if (btnSave) {
        btnSave.addEventListener('click', saveClinicalRecord);
    }

    const btnPDF = document.getElementById('btnDownloadPDF');
    if (btnPDF) {
        btnPDF.addEventListener('click', () => {
            syncHistoryToDossier();
            const nom = getVal('pNombre') || 'Paciente';
            const ced = getVal('pCedula') || 'SC';
            const modeName = currentMode === 'prenatal' ? 'Obstetrica_Prenatal' : 'Ginecologica';
            ClinicalDB.downloadPDF('#printableHistoryDossier', `Historia_${modeName}_${nom}_${ced}`);
        });
    }

    const btnPDFSeg = document.getElementById('btnDownloadPDFSeg');
    if (btnPDFSeg && btnPDF) {
        btnPDFSeg.addEventListener('click', () => btnPDF.click());
    }

    const btnSaveSeg = document.getElementById('btnSaveRecordSeg');
    if (btnSaveSeg && btnSave) {
        btnSaveSeg.addEventListener('click', () => btnSave.click());
    }

    const btnPrint = document.getElementById('btnPrintRecord');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnPDF) btnPDF.click();
        });
    }

    function syncHistoryToDossier() {
        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt || '---';
        };
        const setHTML = (id, html) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html || '---';
        };

        const nom = getVal('pNombre') || 'Mariana Sofia Gomez';
        const ced = getVal('pCedula') || '25.489.123';
        const edad = getVal('pEdad') || '28';
        const fn = getVal('pFechaNac') || '1998-05-14';
        const lugar = getVal('pLugarNac') || 'Caracas, Dtto. Capital';
        const telf = getVal('pTelefono') || '0414-1234567';
        const sangre = getVal('pTipoSangre') || 'O Positivo (O+)';
        const peso = getVal('pPeso') || '64.5';
        const talla = getVal('pTalla') || '1.65';
        const imcBadge = document.getElementById('badgeIMC');
        const imcTxt = imcBadge ? imcBadge.textContent : '23.7 (Normal)';
        const capt = getVal('pFechaCaptacion') || new Date().toISOString().slice(0, 10);
        const vac = getVal('pVacunacion') || 'Toxoide al día, Influenza, Covid (3 dosis)';
        const motivo = getVal('pMotivoConsulta') || 'Control Prenatal - Evaluación Semana 24';

        setTxt('dossierNombre', nom);
        setTxt('dossierCedula', `V-${ced}`);
        setTxt('dossierEdadFn', `${edad} años (${ClinicalDB.formatReadableDate(fn)})`);
        setTxt('dossierLugar', lugar);
        setTxt('dossierTelefono', telf);
        setTxt('dossierSangre', sangre);
        setTxt('dossierAntropo', `Peso: ${peso} kg | Talla: ${talla} m | IMC: ${imcTxt}`);
        setTxt('dossierCaptacionVacunas', `${ClinicalDB.formatReadableDate(capt)} • ${vac}`);
        setTxt('dossierMotivo', motivo);

        const antEnf = getVal('antEnfermedad') || 'Niega patologías crónicas de base (no HTA, no Diabetes)';
        const antQuir = getVal('antQuirurgicos') || 'Apendicectomía en 2018';
        const antAlerg = getVal('antAlergias') || 'Niega alergias medicamentosas o alimentarias';
        const antErup = getVal('antEruptivas') || 'Varicela en la infancia sin secuelas';
        const antTransf = getVal('antTransfusiones') || 'Niega transfusiones sanguíneas';
        const famMadre = getVal('famMadre') || 'Madre viva con HTA controlada';
        const famPadre = getVal('famPadre') || 'Padre vivo aparentemente sano';
        const famEsposo = getVal('famEsposo') || 'Pareja viva de 30 años sana';

        setTxt('dossierAntEnfermedad', antEnf);
        setTxt('dossierAntQuirurgAlerg', `${antQuir}. Alergias: ${antAlerg}.`);
        setTxt('dossierAntErupTransf', `${antErup}. Transfusiones: ${antTransf}.`);
        setTxt('dossierAntFamiliares', `Madre: ${famMadre}. Padre: ${famPadre}. Pareja: ${famEsposo}.`);

        const men = getVal('gynMenarquia') || '12';
        const ciclo = getVal('gynCiclo') || '28/4 regular';
        const par = getVal('gynParejas') || '1';
        const its = getVal('gynITS') || 'Niega';
        const cito = getVal('gynCitologia') || '03/2026 Negativa para LIE';
        const antCons = getVal('gynAnticonceptivos') || 'Barrera / Preservativo previo al embarazo';
        const pmf = getVal('gynPMF') || 'Deseo Gestacional Cumplido';

        setTxt('dossierGynDatos', `Menarquia: ${men} años • Ciclos: ${ciclo} • Parejas: ${par} • ITS: ${its} • Citología: ${cito}`);
        setTxt('dossierGynAnticoncep', `Anticoncepción previa: ${antCons}. Planificación: ${pmf}.`);

        const g = parseInt(getVal('aoGestas') || '1', 10);
        const p = parseInt(getVal('aoPartos') || '0', 10);
        const c = parseInt(getVal('aoCesareas') || '0', 10);
        const a = parseInt(getVal('aoAbortos') || '0', 10);

        setTxt('dossierG', g);
        setTxt('dossierP', p);
        setTxt('dossierC', c);
        setTxt('dossierA', a);
        setTxt('dossierParidadTipo', g <= 1 ? 'PRIMIGESTA' : `MULTIGESTA (G:${g} P:${p} C:${c} A:${a})`);

        // Datos del Dossier Página 2
        const fur = getVal('gynFUR') || '2026-04-27';
        const naegele = ClinicalDB.calculateNaegele(fur);
        const fpp = naegele.fpp || '2027-02-04';
        const eg = naegele.egTexto || '24 sem + 1 día';

        setTxt('dossierFurFpp', `FUR: ${ClinicalDB.formatReadableDate(fur)} • FPP: ${ClinicalDB.formatReadableDate(fpp)}`);
        setTxt('dossierEG', eg);

        // Signos vitales actuales
        const row1 = document.querySelector('#tableConsultas tbody tr');
        let pa = '110/70 mmHg', fc = '76 lpm', temp = '36.5 °C', spo2 = '99%', au = '31 cm', fcf = '142 lpm', pres = 'Cefálica';
        if (row1) {
            const inputs = row1.querySelectorAll('input');
            if (inputs.length >= 10) {
                if (inputs[2]?.value) pa = inputs[2].value + ' mmHg';
                if (inputs[3]?.value) fc = inputs[3].value + ' lpm';
                if (inputs[4]?.value) temp = inputs[4].value + ' °C';
                if (inputs[5]?.value) spo2 = inputs[5].value + '%';
                if (inputs[6]?.value) au = inputs[6].value + ' cm';
                if (inputs[7]?.value) fcf = inputs[7].value + ' lpm';
                if (inputs[8]?.value) pres = inputs[8].value;
            }
        }
        setTxt('dossierSignosVitales', `T.A: ${pa} • F.C: ${fc} • Temp: ${temp} • SpO2: ${spo2}`);
        setTxt('dossierEvaluacionFetal', `A.U: ${au} • FCF: ${fcf} • Presentación: ${pres} • Movimientos Fetales: Activos y presentes`);

        // Paraclínicos
        const toxo = getVal('testToxo') || 'IgG (+) 42 UI/ml, IgM (-) No reactivo';
        const cmv = getVal('testCMV') || 'IgG (+) protector, IgM (-) Negativo';
        const hep = getVal('testHep') || 'HBsAg No reactivo / VHC No reactivo';
        const dmg = getVal('testDMG') || 'Basal: 82, 1h: 124, 2h: 108 mg/dl (Normal)';
        const uro = getVal('testUrocultivo') || 'Negativo (Sin desarrollo bacteriano a las 48h)';
        setTxt('dossierParaclinicos', `Toxoplasmosis: ${toxo} • CMV: ${cmv} • Hepatitis: ${hep} • Despistaje DMG: ${dmg} • Urocultivo: ${uro}`);

        const eco = getVal('prenatalEstudios') || 'Ecografía Doppler Materno-Fetal: Biometría acorde a edad gestacional. Líquido amniótico normal. Perfil Biofísico 10/10.';
        setTxt('dossierEcografias', eco);

        const evol = getVal('prenatalEvolucion') || 'Paciente acude a control prenatal. Adecuada condición clínica materna y vitalidad fetal demostrada. Sin pérdidas ni contracciones.';
        setTxt('dossierEvolucion', evol);

        const diag = (currentMode === 'prenatal' ? getVal('prenatalEstudios') : getVal('gynDiagnostico')) || `1. GESTACIÓN SIMPLE ACTIVA DE ${eg.toUpperCase()} POR FUR Y ECOGRAFÍA.\n2. FETO ÚNICO VIVO EN PRESENTACIÓN CEFÁLICA.\n3. EVOLUCIÓN OBSTÉTRICA SATISFACTORIA.`;
        setHTML('dossierDiagnostico', (diag || '').replace(/\n/g, '<br>'));

        const trat = (currentMode === 'prenatal' ? getVal('prenatalTratamiento') : getVal('gynIndicacionesTratamiento')) || 'Polivitamínico prenatal, Sulfato Ferroso + Ácido Fólico VO OD, Calcio 600mg diario. Reposo relativo.';
        setTxt('dossierTratamiento', trat);

        const prox = (currentMode === 'prenatal' ? getVal('prenatalProximaCita') : getVal('gynProximaCita')) || '09/11/2026';
        setTxt('dossierProximaCita', ClinicalDB.formatReadableDate(prox));

        const code = `REC-${ced}-${new Date().getFullYear()}`;
        setTxt('dossierVerifyCode', code);
        setTxt('dossierMetaLine', `C.I: ${ced} • Emisión: ${ClinicalDB.formatReadableDate(new Date().toISOString().slice(0, 10))}`);
        setTxt('dossierContPatient', `Paciente: ${nom} • C.I: ${ced}`);

        const mainTitle = document.getElementById('dossierMainTitle');
        if (mainTitle) {
            mainTitle.textContent = currentMode === 'prenatal' ? 'HISTORIA CLÍNICA OBSTÉTRICA' : 'HISTORIA CLÍNICA GINECOLÓGICA';
        }
    }
    window.syncHistoryToDossier = syncHistoryToDossier;

    const btnClear = document.getElementById('btnClearForm');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar todos los campos del formulario?')) {
                document.getElementById('clinicalHistoryForm').reset();
                updateIMC();
                updateGestationalCalc();
                ClinicalDB.showToast('Formulario restablecido', 'info');
            }
        });
    }

    // Botones de Recordatorio WhatsApp
    const btnWaPrenatal = document.getElementById('btnWaPrenatalReminder');
    if (btnWaPrenatal) {
        btnWaPrenatal.addEventListener('click', () => {
            const fecha = getVal('prenatalProximaCita');
            const paciente = getVal('pNombre');
            const cedula = getVal('pCedula');
            const telefono = getVal('pTelefono');
            if (!fecha) {
                alert('Seleccione la fecha de la próxima cita de control prenatal primero.');
                return;
            }
            ClinicalDB.openWhatsAppReminder({
                paciente,
                cedula,
                telefono,
                fecha,
                tipo: 'prenatal',
                motivo: 'Control Prenatal de Seguimiento'
            });
        });
    }

    const btnWaGyn = document.getElementById('btnWaGynReminder');
    if (btnWaGyn) {
        btnWaGyn.addEventListener('click', () => {
            const fecha = getVal('gynProximaCita');
            const paciente = getVal('pNombre');
            const cedula = getVal('pCedula');
            const telefono = getVal('pTelefono');
            if (!fecha) {
                alert('Seleccione la fecha de la próxima consulta ginecológica primero.');
                return;
            }
            ClinicalDB.openWhatsAppReminder({
                paciente,
                cedula,
                telefono,
                fecha,
                tipo: 'ginecologia',
                motivo: 'Consulta Ginecológica de Control'
            });
        });
    }

    // Función para Cargar Datos de Paciente
    function loadPatientData(p) {
        if (!p) return;
        setVal('pNombre', p.nombre || p.nombreApellido || '');
        setVal('pCedula', p.cedula || '');
        setVal('pFechaNac', p.fechaNacimiento || p.fechaNac || '');
        setVal('pEdad', p.edad || ClinicalDB.calculateAge(p.fechaNacimiento));
        setVal('pLugarNac', p.lugarNacimiento || p.lugar || '');
        setVal('pPeso', p.peso || '');
        setVal('pTalla', p.talla || '');
        setVal('pTipoSangre', p.tipoSangre || p.grupoSanguineo || '');
        setVal('pFechaCaptacion', p.fechaCaptacion || p.fecha || '');
        setVal('pTelefono', p.telefono || '');
        setVal('pVacunacion', p.vacunacion || '');
        setVal('pMotivoConsulta', p.motivoConsulta || p.motivo || '');

        // Antecedentes Personales
        setVal('antEnfermedad', p.antEnfermedad || '');
        setVal('antEruptivas', p.antEruptivas || '');
        setVal('antAlergias', p.antAlergias || '');
        setVal('antTraumatismos', p.antTraumatismos || '');
        setVal('antQuirurgicos', p.antQuirurgicos || '');
        setVal('antTransfusiones', p.antTransfusiones || '');
        setVal('antComplicaciones', p.antComplicaciones || '');

        // Antecedentes Ginecológicos
        setVal('gynMenarquia', p.gynMenarquia || '');
        setVal('gynParejas', p.gynParejas || '');
        setVal('gynAnticonceptivos', p.gynAnticonceptivos || '');
        setVal('gynITS', p.gynITS || '');
        setVal('gynCitologia', p.gynCitologia || '');
        setVal('gynFUR', p.gynFUR || p.fur || '');
        setVal('gynCiclo', p.gynCiclo || '');
        setVal('gynPMF', p.gynPMF || '');

        setVal('aoGestas', p.aoGestas || '');
        setVal('aoPartos', p.aoPartos || '');
        setVal('aoCesareas', p.aoCesareas || '');
        setVal('aoAbortos', p.aoAbortos || '');
        setVal('aoOtros', p.aoOtros || '');
        setVal('aoEmbarazoAnt', p.aoEmbarazoAnt || '');
        setVal('aoComplicacionesAnt', p.aoComplicacionesAnt || '');

        // Familiares
        setVal('famMadre', p.famMadre || '');
        setVal('famPadre', p.famPadre || '');
        setVal('famEsposo', p.famEsposo || '');
        setVal('famHermanos', p.famHermanos || '');
        setVal('famHijos', p.famHijos || '');
        setVal('famGrupoSangrePadre', p.famGrupoSangrePadre || '');

        // Secciones Obstétricas / Ginecológicas
        setVal('prenatalEstudios', p.prenatalEstudios || '');
        setVal('prenatalTratamiento', p.prenatalTratamiento || '');
        setVal('prenatalProximaCita', p.prenatalProximaCita || '');
        setVal('prenatalMaduracion', p.prenatalMaduracion || '');
        setVal('prenatalEvolucion', p.prenatalEvolucion || '');
        setVal('gynExamenFisico', p.gynExamenFisico || '');
        setVal('gynDiagnostico', p.gynDiagnostico || '');
        setVal('gynIndicacionesTratamiento', p.gynIndicacionesTratamiento || '');
        setVal('gynProximaCita', p.gynProximaCita || '');
        setVal('gynEcoMamaria', p.gynEcoMamaria || '');
        setVal('gynEcoPelvica', p.gynEcoPelvica || '');
        setVal('gynEcoTransvaginal', p.gynEcoTransvaginal || '');
        setVal('gynCitologiaResult', p.gynCitologiaResult || '');
        setVal('gynColposcopiaResult', p.gynColposcopiaResult || '');

        // Recalcular
        updateIMC();
        updateGestationalCalc();
        syncHistoryToDossier();

        ClinicalDB.showToast(`Datos de ${p.nombre || p.nombreApellido || 'paciente'} cargados`, 'info');
    }

    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }

    function getVal(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    // 6. Función para Guardar Historia Clínica
    function saveClinicalRecord() {
        const cedula = getVal('pCedula');
        const nombre = getVal('pNombre');

        if (!cedula || !nombre) {
            alert('Por favor ingrese al menos el Nombre y la Cédula de la paciente para guardar.');
            return;
        }

        const patientRecord = {
            cedula,
            nombre,
            nombreApellido: nombre,
            fechaNacimiento: getVal('pFechaNac'),
            edad: getVal('pEdad'),
            lugarNacimiento: getVal('pLugarNac'),
            peso: getVal('pPeso'),
            talla: getVal('pTalla'),
            tipoSangre: getVal('pTipoSangre'),
            fechaCaptacion: getVal('pFechaCaptacion'),
            telefono: getVal('pTelefono'),
            vacunacion: getVal('pVacunacion'),
            motivoConsulta: getVal('pMotivoConsulta'),

            antEnfermedad: getVal('antEnfermedad'),
            antEruptivas: getVal('antEruptivas'),
            antAlergias: getVal('antAlergias'),
            antTraumatismos: getVal('antTraumatismos'),
            antQuirurgicos: getVal('antQuirurgicos'),
            antTransfusiones: getVal('antTransfusiones'),
            antComplicaciones: getVal('antComplicaciones'),

            gynMenarquia: getVal('gynMenarquia'),
            gynParejas: getVal('gynParejas'),
            gynAnticonceptivos: getVal('gynAnticonceptivos'),
            gynITS: getVal('gynITS'),
            gynCitologia: getVal('gynCitologia'),
            gynFUR: getVal('gynFUR'),
            gynCiclo: getVal('gynCiclo'),
            gynPMF: getVal('gynPMF'),

            aoGestas: getVal('aoGestas'),
            aoPartos: getVal('aoPartos'),
            aoCesareas: getVal('aoCesareas'),
            aoAbortos: getVal('aoAbortos'),
            aoOtros: getVal('aoOtros'),
            aoEmbarazoAnt: getVal('aoEmbarazoAnt'),
            aoComplicacionesAnt: getVal('aoComplicacionesAnt'),

            famMadre: getVal('famMadre'),
            famPadre: getVal('famPadre'),
            famEsposo: getVal('famEsposo'),
            famHermanos: getVal('famHermanos'),
            famHijos: getVal('famHijos'),
            famGrupoSangrePadre: getVal('famGrupoSangrePadre'),

            prenatalEstudios: getVal('prenatalEstudios'),
            prenatalTratamiento: getVal('prenatalTratamiento'),
            prenatalProximaCita: getVal('prenatalProximaCita'),
            prenatalMaduracion: getVal('prenatalMaduracion'),
            prenatalEvolucion: getVal('prenatalEvolucion'),

            gynExamenFisico: getVal('gynExamenFisico'),
            gynDiagnostico: getVal('gynDiagnostico'),
            gynIndicacionesTratamiento: getVal('gynIndicacionesTratamiento'),
            gynProximaCita: getVal('gynProximaCita'),
            gynEcoMamaria: getVal('gynEcoMamaria'),
            gynEcoPelvica: getVal('gynEcoPelvica'),
            gynEcoTransvaginal: getVal('gynEcoTransvaginal'),
            gynCitologiaResult: getVal('gynCitologiaResult'),
            gynColposcopiaResult: getVal('gynColposcopiaResult'),

            mode: currentMode,
            updatedAt: new Date().toISOString()
        };

        // Guardar en la base de pacientes
        ClinicalDB.savePatient(patientRecord);

        // Guardar ficha individual en localStorage
        localStorage.setItem(`liteMedicClinicalRecord_${cedula}`, JSON.stringify(patientRecord));

        // Guardar en la lista global de historias clínicas / expedientes
        const allRecords = getRecords();
        const existingIdx = allRecords.findIndex(r => String(r.cedula).trim() === String(cedula).trim());
        const recordEntry = {
            id: existingIdx >= 0 ? allRecords[existingIdx].id : `REC-${cedula}-${Date.now()}`,
            cedula,
            nombre,
            fecha: getVal('pFechaCaptacion') || new Date().toISOString().slice(0, 10),
            edad: getVal('pEdad'),
            telefono: getVal('pTelefono'),
            mode: currentMode,
            modeLabel: currentMode === 'prenatal' ? 'Control Prenatal' : 'Ginecología General',
            motivo: getVal('pMotivoConsulta') || (currentMode === 'prenatal' ? 'Control Obstétrico' : 'Consulta Ginecológica'),
            diagnostico: (currentMode === 'prenatal' ? getVal('prenatalEstudios') : getVal('gynDiagnostico')) || 'Evaluación Médica Preventiva',
            fullData: patientRecord,
            updatedAt: new Date().toISOString()
        };

        if (existingIdx >= 0) {
            allRecords[existingIdx] = recordEntry;
        } else {
            allRecords.unshift(recordEntry);
        }
        localStorage.setItem('liteMedicClinicalRecords', JSON.stringify(allRecords));

        // Actualizar código de verificación impreso
        const codeEl = document.getElementById('printVerifyCode');
        if (codeEl) codeEl.textContent = `REC-${cedula}-${new Date().getFullYear()}`;

        ClinicalDB.showToast(`Historia clínica de ${nombre} guardada con éxito en el sistema`, 'success');
    }

    // 7. Base de Datos / Registro de Historias Clínicas
    function getDemoRecords() {
        return [
            {
                id: 'REC-25.489.123-DEMO1',
                cedula: '25.489.123',
                nombre: 'Mariana Sofia Gomez',
                fecha: '2026-10-12',
                edad: '28',
                telefono: '0414-1234567',
                mode: 'prenatal',
                modeLabel: 'Control Prenatal',
                motivo: 'Control Prenatal - Evaluación Semana 24',
                diagnostico: 'Embarazo simple de 24 sem por FUR. Feto único vivo en situación longitudinal cefálica, biometría acorde a edad gestacional.',
                fullData: {
                    nombre: 'Mariana Sofia Gomez',
                    cedula: '25.489.123',
                    fechaNacimiento: '1998-05-14',
                    edad: '28',
                    lugarNacimiento: 'Caracas, Dtto. Capital',
                    peso: '64.5',
                    talla: '1.65',
                    tipoSangre: 'O Positivo (O+)',
                    fechaCaptacion: '2026-05-10',
                    telefono: '0414-1234567',
                    vacunacion: 'Toxoide al día, Influenza, Covid (3 dosis)',
                    motivoConsulta: 'Control Prenatal - Evaluación Semana 24',
                    antEnfermedad: 'Niega patologías crónicas de base',
                    antEruptivas: 'Varicela en la infancia',
                    antAlergias: 'Niega alergias a medicamentos',
                    antTraumatismos: 'Niega',
                    antQuirurgicos: 'Apendicectomía en 2018',
                    antTransfusiones: 'Niega',
                    antComplicaciones: 'Niega',
                    gynMenarquia: '12',
                    gynParejas: '1',
                    gynAnticonceptivos: 'Barrera / Preservativo previo al embarazo',
                    gynITS: 'Niega',
                    gynCitologia: '03/2026 Negativa para malignidad / LIE',
                    gynFUR: '2026-04-27',
                    gynCiclo: '28/4 Regular',
                    gynPMF: 'Deseo Gestacional Cumplido',
                    aoGestas: '1',
                    aoPartos: '0',
                    aoCesareas: '0',
                    aoAbortos: '0',
                    aoOtros: 'Ninguno',
                    famMadre: 'Viva, 56 años, HTA controlada',
                    famPadre: 'Vivo, 60 años, Aparentemente sano',
                    famEsposo: 'Vivo, 30 años, Sano',
                    famGrupoSangrePadre: 'O Positivo (O+)',
                    prenatalEstudios: 'Eco Doppler feto-placentario normal. Longitud cervical 36mm.',
                    prenatalTratamiento: 'Polivitamínico prenatal, Ácido Fólico 5mg, Calcio 600mg diario.',
                    prenatalProximaCita: '2026-11-09',
                    mode: 'prenatal'
                }
            },
            {
                id: 'REC-21.890.345-DEMO2',
                cedula: '21.890.345',
                nombre: 'Valeria C. Hernandez',
                fecha: '2026-10-10',
                edad: '32',
                telefono: '0424-9876543',
                mode: 'ginecologia',
                modeLabel: 'Ginecología General',
                motivo: 'Chequeo Ginecológico Anual y Colposcopia',
                diagnostico: 'Evaluación ginecológica satisfactoria. Ectropion fisiológico leve, prueba de Lugol positiva homogénea.',
                fullData: {
                    nombre: 'Valeria C. Hernandez',
                    cedula: '21.890.345',
                    fechaNacimiento: '1994-08-20',
                    edad: '32',
                    lugarNacimiento: 'Valencia, Carabobo',
                    peso: '58.0',
                    talla: '1.62',
                    tipoSangre: 'A Positivo (A+)',
                    fechaCaptacion: '2026-10-10',
                    telefono: '0424-9876543',
                    vacunacion: 'Esquema completo',
                    motivoConsulta: 'Chequeo Ginecológico Anual y Colposcopia',
                    antEnfermedad: 'Niega',
                    antAlergias: 'Penicilina (urticaria leve)',
                    antQuirurgicos: 'Niega',
                    gynMenarquia: '13',
                    gynParejas: '2',
                    gynAnticonceptivos: 'DIU de Cobre (retirado)',
                    gynITS: 'Niega',
                    gynCitologia: '10/2026 Negativa para LIE',
                    gynFUR: '2026-09-28',
                    gynCiclo: '30/5 Regular',
                    gynPMF: 'Anticoncepción oral monofásica',
                    aoGestas: '1',
                    aoPartos: '1',
                    aoCesareas: '0',
                    aoAbortos: '0',
                    famMadre: 'Viva, sana',
                    famPadre: 'Fallecido por infarto agudo',
                    gynExamenFisico: 'Mamas simétricas sin nódulos. Genitales externos normoconfigurados. Cérvix epitelizado.',
                    gynDiagnostico: '1. Examen ginecológico normal preventivo. 2. Ectropion leve sin atipias.',
                    gynIndicacionesTratamiento: 'Seguimiento citológico en 12 meses. Hábitos higiénicos adecuados.',
                    gynProximaCita: '2027-10-10',
                    mode: 'ginecologia'
                }
            },
            {
                id: 'REC-27.123.456-DEMO3',
                cedula: '27.123.456',
                nombre: 'Daniela Rivas Morales',
                fecha: '2026-10-08',
                edad: '24',
                telefono: '0412-5551234',
                mode: 'ginecologia',
                modeLabel: 'Ginecología General',
                motivo: 'Consulta Ginecológica y Asesoría Anticonceptiva',
                diagnostico: 'Paciente sana en edad fértil. Inicio de método anticonceptivo oral combinado.',
                fullData: {
                    nombre: 'Daniela Rivas Morales',
                    cedula: '27.123.456',
                    fechaNacimiento: '2002-03-11',
                    edad: '24',
                    lugarNacimiento: 'Maracay, Aragua',
                    peso: '54.0',
                    talla: '1.58',
                    tipoSangre: 'O Positivo (O+)',
                    fechaCaptacion: '2026-10-08',
                    telefono: '0412-5551234',
                    vacunacion: 'Al día',
                    motivoConsulta: 'Consulta Ginecológica y Asesoría Anticonceptiva',
                    antEnfermedad: 'Rinitis alérgica estacional',
                    antAlergias: 'Polvo y polen',
                    gynMenarquia: '12',
                    gynParejas: '1',
                    gynAnticonceptivos: 'Ninguno actual',
                    gynITS: 'Niega',
                    gynCitologia: 'Pendiente resultado',
                    gynFUR: '2026-09-22',
                    gynCiclo: '28/3 Regular',
                    gynPMF: 'Inicio de ACO (Drospirenona + Etinilestradiol)',
                    aoGestas: '0',
                    aoPartos: '0',
                    aoCesareas: '0',
                    aoAbortos: '0',
                    famMadre: 'Viva, sana',
                    famPadre: 'Vivo, sano',
                    gynExamenFisico: 'Mamas sin lesiones palpables. Especuloscopia cérvix rosado con orificio puntiforme.',
                    gynDiagnostico: 'Examen preventivo ginecológico satisfactorio.',
                    gynIndicacionesTratamiento: 'Iniciar blíster en día 1 del ciclo menstrual regular.',
                    gynProximaCita: '2027-04-10',
                    mode: 'ginecologia'
                }
            }
        ];
    }

    function getRecords() {
        try {
            const raw = localStorage.getItem('liteMedicClinicalRecords');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
            const initial = getDemoRecords();
            localStorage.setItem('liteMedicClinicalRecords', JSON.stringify(initial));
            return initial;
        } catch (e) {
            console.error('Error al cargar expedientes:', e);
            return [];
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderHistoryTable(list) {
        const tbody = document.getElementById('historyTableBody');
        const emptyState = document.getElementById('emptyState');
        if (!tbody) return;

        const records = list !== undefined ? list : getRecords();

        if (!records || records.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        tbody.innerHTML = '';

        records.forEach(r => {
            const tr = document.createElement('tr');
            const isPrenatal = r.mode === 'prenatal';
            const badgeIcon = isPrenatal ? 'fa-baby' : 'fa-venus';
            const badgeLabel = isPrenatal ? 'Control Prenatal' : 'Ginecología General';

            tr.innerHTML = `
                <td><strong>${escapeHtml(r.fecha || 'Sin fecha')}</strong></td>
                <td>
                    <div style="font-weight: 600; color: #0f172a;">${escapeHtml(r.nombre || 'Paciente')}</div>
                    <div style="font-size: 0.78rem; color: #64748b;">
                        ${r.edad ? escapeHtml(r.edad) + ' años' : ''} ${r.telefono ? '&bull; ' + escapeHtml(r.telefono) : ''}
                    </div>
                </td>
                <td><code>${escapeHtml(r.cedula || 'S/C')}</code></td>
                <td>
                    <span class="badge-tag">
                        <i class="fas ${badgeIcon}"></i> ${badgeLabel}
                    </span>
                </td>
                <td>
                    <div style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #334155; font-size: 0.88rem;" title="${escapeHtml(r.diagnostico || r.motivo || '')}">
                        ${escapeHtml(r.diagnostico || r.motivo || 'Evaluación médica')}
                    </div>
                </td>
                <td style="text-align: center;">
                    <div class="action-btn-group">
                        <button type="button" class="action-btn" title="Cargar y editar historia clínica" onclick="loadRecordToForm('${escapeHtml(r.cedula)}')">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="action-btn" title="Imprimir historia clínica" onclick="printRecordDirect('${escapeHtml(r.cedula)}')">
                            <i class="fas fa-print"></i>
                        </button>
                        <button type="button" class="action-btn" title="Descargar PDF" onclick="downloadRecordDirect('${escapeHtml(r.cedula)}')">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button type="button" class="action-btn" style="color: #ef4444;" title="Eliminar registro" onclick="deleteClinicalRecord('${escapeHtml(r.cedula)}')">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Buscador en Tiempo Real de Expedientes
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const all = getRecords();
            if (!query) {
                renderHistoryTable(all);
                return;
            }
            const filtered = all.filter(r => {
                const nom = (r.nombre || '').toLowerCase();
                const ced = (r.cedula || '').toLowerCase();
                const mot = (r.motivo || '').toLowerCase();
                const diag = (r.diagnostico || '').toLowerCase();
                const mod = (r.modeLabel || '').toLowerCase();
                return nom.includes(query) || ced.includes(query) || mot.includes(query) || diag.includes(query) || mod.includes(query);
            });
            renderHistoryTable(filtered);
        });
    }

    // 8. Control de Pestañas (Historia Clínica vs Evolución y Citas vs Base de Datos)
    window.loadView = function (viewName) {
        const tabNuevo = document.getElementById('tabNuevo');
        const tabSeguimiento = document.getElementById('tabSeguimiento');
        const tabHistorial = document.getElementById('tabHistorial');
        const viewNuevo = document.getElementById('viewNuevo');
        const viewSeguimiento = document.getElementById('viewSeguimiento');
        const viewHistorial = document.getElementById('viewHistorial');

        // Resetear pestañas
        if (tabNuevo) tabNuevo.classList.remove('active-tab', 'active');
        if (tabSeguimiento) tabSeguimiento.classList.remove('active-tab', 'active');
        if (tabHistorial) tabHistorial.classList.remove('active-tab', 'active');

        // Ocultar todas las vistas
        if (viewNuevo) viewNuevo.style.display = 'none';
        if (viewSeguimiento) viewSeguimiento.style.display = 'none';
        if (viewHistorial) viewHistorial.style.display = 'none';

        if (viewName === 'historial') {
            if (tabHistorial) tabHistorial.classList.add('active-tab', 'active');
            if (viewHistorial) {
                viewHistorial.style.display = 'block';
                renderHistoryTable();
            }
        } else if (viewName === 'seguimiento') {
            if (tabSeguimiento) tabSeguimiento.classList.add('active-tab', 'active');
            if (viewSeguimiento) {
                viewSeguimiento.style.display = 'block';
                const pBadge = document.getElementById('seguimientoPatientBadge');
                if (pBadge) {
                    const nom = getVal('pNombre') || 'Mariana Sofia Gomez';
                    const ced = getVal('pCedula') || '25.489.123';
                    pBadge.textContent = `${nom} • C.I: ${ced}`;
                }
            }
        } else {
            if (tabNuevo) tabNuevo.classList.add('active-tab', 'active');
            if (viewNuevo) viewNuevo.style.display = 'block';
        }
    };
    window.switchView = window.loadView;

    // Métodos globales accesibles desde la tabla
    window.loadRecordToForm = function (cedula) {
        const records = getRecords();
        const r = records.find(item => String(item.cedula).trim() === String(cedula).trim());
        if (!r) {
            alert('No se encontró el registro solicitado.');
            return;
        }

        setMode(r.mode || 'prenatal');
        loadPatientData(r.fullData || r);
        window.loadView('nuevo');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        ClinicalDB.showToast(`Expediente de ${r.nombre} cargado en el formulario`, 'info');
    };

    window.printRecordDirect = function (cedula) {
        window.loadRecordToForm(cedula);
        setTimeout(() => {
            syncHistoryToDossier();
            window.print();
        }, 300);
    };

    window.downloadRecordDirect = function (cedula) {
        window.loadRecordToForm(cedula);
        setTimeout(() => {
            syncHistoryToDossier();
            const nom = document.getElementById('pNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('pCedula').value.trim() || 'SC';
            const modeName = currentMode === 'prenatal' ? 'Obstetrica_Prenatal' : 'Ginecologica';
            ClinicalDB.downloadPDF('#printableHistoryDossier', `Historia_${modeName}_${nom}_${ced}`);
        }, 300);
    };

    window.deleteClinicalRecord = function (cedula) {
        const records = getRecords();
        const r = records.find(item => String(item.cedula).trim() === String(cedula).trim());
        const nombre = r ? r.nombre : 'este paciente';

        if (confirm(`¿Está seguro de eliminar el expediente clínico de ${nombre}?`)) {
            const updated = records.filter(item => String(item.cedula).trim() !== String(cedula).trim());
            localStorage.setItem('liteMedicClinicalRecords', JSON.stringify(updated));
            localStorage.removeItem(`liteMedicClinicalRecord_${cedula}`);
            renderHistoryTable();
            ClinicalDB.showToast(`Expediente clínico eliminado`, 'info');
        }
    };

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const pNombreEl = document.getElementById('pNombre');
        if (pNombreEl && !pNombreEl.value) {
            window.loadRecordToForm('25.489.123');

            // Llenar fila prenatal de prueba
            const row1 = document.querySelector('#tableConsultas tbody tr');
            if (row1) {
                const inputs = row1.querySelectorAll('input');
                if (inputs.length >= 12) {
                    inputs[0].value = new Date().toISOString().slice(0, 10);
                    inputs[1].value = '64.5';
                    inputs[2].value = '110/70';
                    inputs[3].value = '76';
                    inputs[4].value = '36.5';
                    inputs[5].value = '99';
                    inputs[6].value = '31';
                    inputs[7].value = '142';
                    inputs[8].value = 'Cefálica';
                    inputs[9].value = 'No';
                    inputs[10].value = 'Normal';
                    inputs[11].value = '34 sem';
                }
            }

            // Llenar paraclínicos prenatales de prueba
            setVal('testToxo', 'IgG (+) 42 UI/ml, IgM (-) No reactivo');
            setVal('testCMV', 'IgG (+) protector, IgM (-) Negativo');
            setVal('testHep', 'HBsAg No reactivo / VHC No reactivo');
            setVal('testDMG', 'Basal: 82 mg/dl, 1h: 124 mg/dl, 2h: 108 mg/dl (Normal)');
            setVal('testStrepto', 'Programado toma de muestra semana 35-36');
            setVal('testUrocultivo', 'Negativo (Sin desarrollo bacteriano a las 48h)');
            setVal('testFlujo', 'Flora bacilar habitual de Döderlein. Negativo para micosis/vaginosis.');
        }
    }, 120);
});

// Función global para eliminar filas de tablas dinámicas
window.deleteTableRow = function (btn) {
    const row = btn.closest('tr');
    if (row) {
        row.style.background = '#fee2e2';
        setTimeout(() => row.remove(), 150);
    }
};
