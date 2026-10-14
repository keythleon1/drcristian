/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DE CATÁLOGO LITEFARMA (VADEMÉCUM)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('medsTableBody');
    const searchInput = document.getElementById('searchMedInput');
    const countAll = document.getElementById('countMedsAll');
    let currentFilter = 'all';

    function getMeds() {
        const stored = localStorage.getItem('liteFarma_medicamentos');
        if (!stored) {
            const defaults = getInitialMeds();
            localStorage.setItem('liteFarma_medicamentos', JSON.stringify(defaults));
            return defaults;
        }
        return JSON.parse(stored);
    }

    function saveMeds(list) {
        localStorage.setItem('liteFarma_medicamentos', JSON.stringify(list));
    }

    function renderMeds(filter = 'all', query = '') {
        const list = getMeds();
        if (countAll) countAll.textContent = list.length;

        let filtered = list;
        if (filter !== 'all') {
            filtered = filtered.filter(m => m.categoria === filter);
        }

        if (query) {
            filtered = filtered.filter(m => 
                (m.nombre || '').toLowerCase().includes(query) ||
                (m.presentacion || '').toLowerCase().includes(query) ||
                (m.dosis || '').toLowerCase().includes(query)
            );
        }

        if (!tableBody) return;
        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty-state">
                        <i class="fas fa-pills"></i>
                        <p>No se encontraron medicamentos con los criterios de búsqueda.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        filtered.forEach(m => {
            const tr = document.createElement('tr');
            const recipeUrl = `recipe.html?medNombre=${encodeURIComponent(m.nombre)}&medPres=${encodeURIComponent(m.presentacion || '')}&medDosis=${encodeURIComponent(m.dosis || '')}`;
            tr.innerHTML = `
                <td><strong>${m.nombre}</strong></td>
                <td>${m.presentacion || ''}</td>
                <td><span class="badge-tag badge-tag-blue">${m.categoria ? m.categoria.toUpperCase() : 'GENERAL'}</span></td>
                <td>${m.dosis || ''}</td>
                <td>
                    <span class="badge-tag ${m.fda && m.fda.includes('A') ? 'badge-tag-green' : m.fda && m.fda.includes('B') ? 'badge-tag-blue' : 'badge-tag-amber'}">
                        ${m.fda || 'Cat B'}
                    </span>
                </td>
                <td style="text-align: center;">
                    <a href="${recipeUrl}" class="action-btn" title="Prescribir en Récipe">
                        <i class="fas fa-prescription"></i>
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Filtros de categoría
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.getAttribute('data-cat') || 'all';
            renderMeds(currentFilter, searchInput ? searchInput.value.toLowerCase().trim() : '');
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderMeds(currentFilter, e.target.value.toLowerCase().trim());
        });
    }

    // Modal nuevo medicamento
    const modal = document.getElementById('modalNewMed');
    const btnOpen = document.getElementById('btnOpenNewMedModal');
    const btnClose = document.getElementById('btnCloseMedModal');
    const btnCancel = document.getElementById('btnCancelMed');
    const form = document.getElementById('formNewMed');

    if (btnOpen && modal) {
        btnOpen.addEventListener('click', () => modal.classList.add('active'));
    }

    function closeModal() {
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevo = {
                id: 'MED-' + Date.now(),
                nombre: document.getElementById('mNombre').value.trim(),
                presentacion: document.getElementById('mPresentacion').value.trim(),
                categoria: document.getElementById('mCategoria').value,
                dosis: document.getElementById('mDosis').value.trim(),
                fda: document.getElementById('mFda').value
            };

            const list = getMeds();
            list.unshift(nuevo);
            saveMeds(list);

            closeModal();
            renderMeds(currentFilter);
            ClinicalDB.showToast(`Medicamento ${nuevo.nombre} agregado al catálogo`, 'success');
        });
    }

    renderMeds();

    function getInitialMeds() {
        return [
            { nombre: 'Sulfato Ferroso + Ácido Fólico', presentacion: 'Comp. 200mg / 1mg', categoria: 'prenatal', dosis: '1 tableta diaria con agua en ayunas', fda: 'Cat A (Seguro)' },
            { nombre: 'Carbonato de Calcio + Vitamina D3', presentacion: 'Comp. 600mg / 400 UI', categoria: 'prenatal', dosis: '1 tableta cada 12 horas con las comidas', fda: 'Cat A (Seguro)' },
            { nombre: 'Progesterona Micronizada', presentacion: 'Cápsulas blandas 200mg', categoria: 'hormonal', dosis: '200mg vía vaginal u oral cada noche', fda: 'Cat B (Bajo riesgo)' },
            { nombre: 'Betametasona (Inductor MPF)', presentacion: 'Ampolla 12mg / 2ml', categoria: 'prenatal', dosis: '12mg IM cada 24 horas por 2 dosis', fda: 'Cat C (Riesgo evaluable)' },
            { nombre: 'Hioscina Butilbromuro', presentacion: 'Grageas 10mg / Gotas', categoria: 'antiespasmodico', dosis: '1 gragea cada 8 horas ante dolor tipo cólico', fda: 'Cat B (Bajo riesgo)' },
            { nombre: 'Cefadroxilo', presentacion: 'Cápsulas 500mg', categoria: 'antibiotico', dosis: '500mg vía oral cada 12 horas por 7 días', fda: 'Cat B (Bajo riesgo)' },
            { nombre: 'Metronidazol + Nistatina', presentacion: 'Óvulos vaginales', categoria: 'antibiotico', dosis: '1 óvulo vaginal cada noche por 10 días', fda: 'Cat B (Bajo riesgo)' }
        ];
    }
});
