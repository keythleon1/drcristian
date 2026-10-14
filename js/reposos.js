/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DEL CENTRO DE REPOSOS MÉDICOS
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('leavesTableBody');
    const searchInput = document.getElementById('searchLeavesInput');

    function loadLeaves() {
        const list = JSON.parse(localStorage.getItem('liteMedicMedicalLeaves') || '[]');
        renderLeavesTable(list);
    }

    function renderLeavesTable(list) {
        if (!tableBody) return;

        if (list.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="table-empty-state">
                        <i class="far fa-folder-open"></i>
                        <p>No se han emitido reposos médicos aún. Presione un botón arriba para emitir el primero.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        list.forEach(item => {
            const tr = document.createElement('tr');
            const isPrenatal = item.tipo === 'prenatal_postnatal';

            tr.innerHTML = `
                <td><strong>${item.fecha || ''}</strong></td>
                <td>${item.nombre || ''}</td>
                <td>${item.cedula || ''}</td>
                <td>
                    <span class="badge-tag ${isPrenatal ? 'badge-tag-rose' : 'badge-tag-amber'}">
                        ${isPrenatal ? 'Pre y Postnatal' : 'Médico General'}
                    </span>
                </td>
                <td>${item.dias ? item.dias + ' días' : item.semanas ? item.semanas + ' semanas' : 'S/D'}</td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${item.diagnostico || ''}
                </td>
                <td style="text-align: center;">
                    <a href="${isPrenatal ? 'reposo_prenatal_postnatal.html' : 'reposo_medico.html'}?cedula=${encodeURIComponent(item.cedula || '')}" 
                       class="action-btn" title="Ver / Reimprimir">
                        <i class="fas fa-print"></i>
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const list = JSON.parse(localStorage.getItem('liteMedicMedicalLeaves') || '[]');
            const filtered = list.filter(item => 
                (item.nombre || '').toLowerCase().includes(query) ||
                (item.cedula || '').toLowerCase().includes(query) ||
                (item.diagnostico || '').toLowerCase().includes(query)
            );
            renderLeavesTable(filtered);
        });
    }

    loadLeaves();
});
