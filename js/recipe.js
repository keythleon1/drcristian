/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE RÉCIPE MÉDICO E INDICACIONES CONECTADO A LITEFARMA
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const recFecha = document.getElementById('recFecha');
    if (recFecha) recFecha.value = new Date().toISOString().slice(0, 10);

    // Crear datalist del Vademécum LiteFarma para autocompletar medicamentos
    const storedMeds = JSON.parse(localStorage.getItem('liteFarma_medicamentos') || '[]');
    let dataList = document.getElementById('vademecumList');
    if (!dataList) {
        dataList = document.createElement('datalist');
        dataList.id = 'vademecumList';
        storedMeds.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.nombre;
            opt.label = `${m.presentacion || ''} — ${m.dosis || ''}`;
            dataList.appendChild(opt);
        });
        document.body.appendChild(dataList);
    }

    function bindMedicationAutocomplete(card) {
        const nameInput = card.querySelector('.med-nombre');
        const presInput = card.querySelector('.med-presentacion');
        const viaInput = card.querySelector('.med-via');
        if (!nameInput) return;

        nameInput.setAttribute('list', 'vademecumList');
        nameInput.addEventListener('change', () => {
            const found = storedMeds.find(m => (m.nombre || '').toLowerCase() === nameInput.value.trim().toLowerCase());
            if (found) {
                if (presInput && !presInput.value) presInput.value = found.presentacion || '';
                if (viaInput && !viaInput.value) {
                    viaInput.value = (found.dosis || '').toLowerCase().includes('vaginal') ? 'Vía Vaginal'
                        : (found.dosis || '').toLowerCase().includes('im') ? 'Vía Intramuscular' : 'Vía Oral';
                }
                const indArea = document.getElementById('recIndicaciones');
                if (indArea && found.dosis) {
                    const line = `• ${found.nombre} (${found.presentacion || ''}): ${found.dosis}.`;
                    if (!indArea.value.includes(found.nombre)) {
                        indArea.value = indArea.value.trim() ? `${indArea.value.trim()}\n${line}` : line;
                    }
                }
            }
        });
    }

    document.querySelectorAll('.med-item-card').forEach(bindMedicationAutocomplete);

    function populateRecipeWithPatient(p) {
        if (!p) return;
        document.getElementById('recNombre').value = p.nombre || p.nombreApellido || '';
        document.getElementById('recCedula').value = p.cedula || '';
        document.getElementById('recEdad').value = p.edad || ClinicalDB.calculateAge(p.fechaNacimiento);

        const elDiag = document.getElementById('recDiag');
        if (elDiag) elDiag.value = p.diagnostico || 'Gestación simple activa de 34 semanas por FUR. Control prenatal.';

        const elInd = document.getElementById('recIndicaciones');
        if (elInd && p.recipeIndicaciones) elInd.value = p.recipeIndicaciones;

        const elRec = document.getElementById('recRecomendaciones');
        if (elRec && p.recipeRecomendaciones) elRec.value = p.recipeRecomendaciones;

        if (p.recipeMeds && Array.isArray(p.recipeMeds)) {
            const container = document.getElementById('medListContainer');
            if (container) {
                container.innerHTML = '';
                p.recipeMeds.forEach(m => {
                    const card = document.createElement('div');
                    card.className = 'med-item-card fade-in-up';
                    card.innerHTML = `
                        <button type="button" class="btn-remove-med" onclick="removeMedCard(this)" title="Eliminar">&times;</button>
                        <div class="form-grid">
                            <div class="form-field col-8">
                                <label>Fármaco / Principio Activo</label>
                                <input type="text" class="med-nombre" list="vademecumList" value="${m.nombre || ''}">
                            </div>
                            <div class="form-field col-4">
                                <label>Presentación</label>
                                <input type="text" class="med-presentacion" value="${m.presentacion || ''}">
                            </div>
                            <div class="form-field col-6">
                                <label>Cantidad / Unidades</label>
                                <input type="text" class="med-cantidad" value="${m.cantidad || ''}">
                            </div>
                            <div class="form-field col-6">
                                <label>Vía de Administración</label>
                                <input type="text" class="med-via" value="${m.via || 'Vía Oral'}">
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                    bindMedicationAutocomplete(card);
                });
            }
        }
    }

    ClinicalDB.bindPatientSelector('recipePatientSelect', (p) => {
        populateRecipeWithPatient(p);
        ClinicalDB.showToast(`Paciente ${p.nombre || ''} seleccionada`, 'info');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const paramCed = urlParams.get('cedula');
    if (paramCed) {
        const p = ClinicalDB.getPatientByCedula(paramCed);
        if (p) populateRecipeWithPatient(p);
    } else {
        const testP = ClinicalDB.getTestPatient();
        if (testP) populateRecipeWithPatient(testP);
    }

    // Si viene desde LiteFarma con ?medNombre=...
    const paramMed = urlParams.get('medNombre');
    if (paramMed) {
        const firstCard = document.querySelector('.med-item-card');
        if (firstCard) {
            const nInput = firstCard.querySelector('.med-nombre');
            const pInput = firstCard.querySelector('.med-presentacion');
            if (nInput) nInput.value = paramMed;
            if (pInput && urlParams.get('medPres')) pInput.value = urlParams.get('medPres');
            const indArea = document.getElementById('recIndicaciones');
            if (indArea && urlParams.get('medDosis')) {
                indArea.value = `1. ${paramMed}: ${urlParams.get('medDosis')}.`;
            }
        }
    }

    const btnAddMed = document.getElementById('btnAddMed');
    const container = document.getElementById('medListContainer');
    if (btnAddMed && container) {
        btnAddMed.addEventListener('click', () => {
            const card = document.createElement('div');
            card.className = 'med-item-card fade-in-up';
            card.innerHTML = `
                <button type="button" class="btn-remove-med" onclick="removeMedCard(this)" title="Eliminar">&times;</button>
                <div class="form-grid">
                    <div class="form-field col-8">
                        <label>Fármaco / Principio Activo</label>
                        <input type="text" class="med-nombre" list="vademecumList" placeholder="Nombre del medicamento">
                    </div>
                    <div class="form-field col-4">
                        <label>Presentación</label>
                        <input type="text" class="med-presentacion" placeholder="Dosis / Forma">
                    </div>
                    <div class="form-field col-6">
                        <label>Cantidad / Unidades</label>
                        <input type="text" class="med-cantidad" placeholder="Caja / Frasco">
                    </div>
                    <div class="form-field col-6">
                        <label>Vía de Administración</label>
                        <input type="text" class="med-via" placeholder="Vía Oral / Tópica">
                    </div>
                </div>
            `;
            container.appendChild(card);
            bindMedicationAutocomplete(card);
        });
    }

    const btnPDF = document.getElementById('btnDownloadRecipePDF');
    if (btnPDF) {
        btnPDF.addEventListener('click', () => {
            const nom = document.getElementById('recNombre').value.trim() || 'Paciente';
            const ced = document.getElementById('recCedula').value.trim() || 'SC';
            ClinicalDB.downloadPDF('#printableRecipeSheet', `Recipe_Medico_${nom}_${ced}`);
        });
    }

    const btnPrint = document.getElementById('btnPrintRecipe');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (btnPDF) btnPDF.click();
        });
    }

    const btnClear = document.getElementById('btnClearRecipe');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Desea limpiar el récipe?')) {
                document.getElementById('recNombre').value = '';
                document.getElementById('recCedula').value = '';
                document.getElementById('recEdad').value = '';
                document.getElementById('recDiag').value = '';
                document.getElementById('recIndicaciones').value = '';
                document.getElementById('recRecomendaciones').value = '';
                ClinicalDB.showToast('Récipe restablecido', 'info');
            }
        });
    }

    const btnSave = document.getElementById('btnSaveRecipe');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const nom = document.getElementById('recNombre').value.trim();
            const ced = document.getElementById('recCedula').value.trim();
            if (!nom || !ced) {
                alert('Ingrese nombre y cédula de la paciente antes de guardar');
                return;
            }

            const meds = [];
            document.querySelectorAll('.med-item-card').forEach(c => {
                const n = c.querySelector('.med-nombre')?.value.trim() || '';
                const p = c.querySelector('.med-presentacion')?.value.trim() || '';
                const q = c.querySelector('.med-cantidad')?.value.trim() || '';
                const v = c.querySelector('.med-via')?.value.trim() || '';
                if (n) meds.push({ nombre: n, presentacion: p, cantidad: q, via: v });
            });

            const recipeData = {
                id: 'REC-' + Date.now(),
                nombre: nom,
                cedula: ced,
                edad: document.getElementById('recEdad').value,
                fecha: recFecha.value,
                diagnostico: document.getElementById('recDiag').value,
                medicamentos: meds,
                indicaciones: document.getElementById('recIndicaciones').value,
                recomendaciones: document.getElementById('recRecomendaciones').value
            };

            const allRecipes = JSON.parse(localStorage.getItem('liteMedicRecipes') || '[]');
            allRecipes.unshift(recipeData);
            localStorage.setItem('liteMedicRecipes', JSON.stringify(allRecipes));

            const qrEl = document.getElementById('recQrCode');
            if (qrEl) qrEl.textContent = `RX-${ced}-${new Date().getFullYear()}`;

            ClinicalDB.showToast(`Récipe de ${nom} guardado exitosamente`, 'success');
        });
    }

    // Cargar paciente de prueba por defecto (Mariana Sofía Gómez) si el formulario está vacío
    setTimeout(() => {
        const nomInput = document.getElementById('recNombre');
        if (nomInput && !nomInput.value) {
            const p = ClinicalDB.getPatientByCedula('25.489.123') || ClinicalDB.getPatients()[0];
            if (p) {
                nomInput.value = p.nombre || 'Mariana Sofia Gomez';
                document.getElementById('recCedula').value = p.cedula || '25.489.123';
                document.getElementById('recEdad').value = p.edad || 28;
                document.getElementById('recDiag').value = 'Control Prenatal - Gestación de 34 semanas por FUR / Suplementación materna';

                const card1 = document.querySelector('.med-item-card');
                if (card1) {
                    card1.querySelector('.med-nombre').value = 'Sulfato Ferroso + Ácido Fólico';
                    card1.querySelector('.med-presentacion').value = 'Tabletas 200mg / 1mg';
                    card1.querySelector('.med-cantidad').value = 'Caja #1 (30 tabletas)';
                    card1.querySelector('.med-via').value = 'Vía Oral';
                }

                document.getElementById('recIndicaciones').value = '1. Tomar 1 tableta de Sulfato Ferroso + Ácido Fólico cada 24 horas en las mañanas con abundante agua o jugo de naranja (evitar lácteos 2h antes y después).\n2. Tomar 1 tableta de Calcio 600mg con el almuerzo.\n3. Mantener ingesta de al menos 2.5 litros de agua al día.';
                document.getElementById('recRecomendaciones').value = 'Reposo relativo, evitar esfuerzos físicos pesados. Cumplir con la suplementación diaria. Acudir de inmediato a urgencias ante cualquier sangrado genital, pérdida de líquido o disminución de movimientos fetales.';
            }
        }
    }, 150);
});

window.removeMedCard = function (btn) {
    const card = btn.closest('.med-item-card');
    if (card) card.remove();
};
