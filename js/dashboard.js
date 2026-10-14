/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * LÓGICA DEL PANEL PRINCIPAL (DASHBOARD), CALENDARIO Y WHATSAPP AUTOMATIZADO
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    loadDashboardKPIs();
    initMonthlyCalendarSystem();
    initFormatCatalog();

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Está seguro de que desea cerrar la sesión actual del Dr. Christian A. Rodríguez C.?')) {
                sessionStorage.removeItem('liteMedicSession');
                window.location.href = 'index.html';
            }
        });
    }

    const btnHeroNewAppt = document.getElementById('btnHeroNewAppt');
    if (btnHeroNewAppt) {
        btnHeroNewAppt.addEventListener('click', () => {
            const btnOpen = document.getElementById('btnOpenNewApptModal');
            if (btnOpen) btnOpen.click();
        });
    }
});

function initClock() {
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');

    function update() {
        const now = new Date();
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    update();
    setInterval(update, 1000);
}

function loadDashboardKPIs() {
    const patients = window.ClinicalDB ? ClinicalDB.getPatients() : [];
    const statPatients = document.getElementById('statPatients');
    if (statPatients) statPatients.textContent = patients.length;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const appointments = window.ClinicalDB ? ClinicalDB.getAppointments() : [];
    const todayAppts = appointments.filter(a => a.fecha === todayStr);

    const statTodayAppts = document.getElementById('statTodayAppts');
    if (statTodayAppts) statTodayAppts.textContent = todayAppts.length;

    const doneCount = todayAppts.filter(a => a.status === 'atendida').length;
    const pendingCount = todayAppts.length - doneCount;

    const statPendingCount = document.getElementById('statPendingCount');
    const statDoneCount = document.getElementById('statDoneCount');
    const statProgressBar = document.getElementById('statProgressBar');
    const statRoomStatus = document.getElementById('statRoomStatus');
    const statApptsBreakdown = document.getElementById('statApptsBreakdown');

    if (statPendingCount) statPendingCount.textContent = pendingCount;
    if (statDoneCount) statDoneCount.textContent = doneCount;

    if (statProgressBar) {
        const percent = todayAppts.length > 0 ? Math.round((doneCount / todayAppts.length) * 100) : 0;
        statProgressBar.style.width = `${percent}%`;
    }

    if (statRoomStatus) {
        if (todayAppts.length === 0) {
            statRoomStatus.textContent = 'Sin Citas';
            statRoomStatus.className = 'stat-trend-tag';
        } else if (pendingCount === 0) {
            statRoomStatus.textContent = 'Completado';
            statRoomStatus.className = 'stat-trend-tag stat-tag-emerald';
        } else {
            statRoomStatus.textContent = 'En Turno';
            statRoomStatus.className = 'stat-trend-tag stat-tag-rose';
        }
    }

    if (statApptsBreakdown) {
        statApptsBreakdown.textContent = todayAppts.length > 0
            ? `${doneCount} de ${todayAppts.length} atendidas hoy`
            : 'Sin citas programadas';
    }
}

function initMonthlyCalendarSystem() {
    const calendarDaysGrid = document.getElementById('calendarDaysGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const btnPrevMonth = document.getElementById('btnPrevMonth');
    const btnNextMonth = document.getElementById('btnNextMonth');
    const btnGoToday = document.getElementById('btnGoToday');

    const selectedDateTitle = document.getElementById('selectedDateTitle');
    const selectedDateSubtitle = document.getElementById('selectedDateSubtitle');
    const dayAgendaTag = document.getElementById('dayAgendaTag');
    const dayAppointmentsContainer = document.getElementById('dayAppointmentsContainer');
    const btnAddApptForSelectedDay = document.getElementById('btnAddApptForSelectedDay');

    const filterChips = document.querySelectorAll('.day-agenda-filters .filter-chip');
    let currentFilter = 'all';

    const today = new Date();
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const MONTH_NAMES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    function formatDateKey(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function getInitials(name) {
        if (!name) return 'PT';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    }

    function renderMonthlyGrid() {
        if (!calendarDaysGrid) return;
        if (currentMonthYear) currentMonthYear.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

        const allAppointments = window.ClinicalDB ? ClinicalDB.getAppointments() : [];
        const apptsByDate = {};
        allAppointments.forEach(appt => {
            if (appt.fecha) {
                if (!apptsByDate[appt.fecha]) apptsByDate[appt.fecha] = [];
                apptsByDate[appt.fecha].push(appt);
            }
        });

        calendarDaysGrid.innerHTML = '';

        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
        const totalDaysInMonth = lastDayOfMonth.getDate();
        const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

        const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
        const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;

        const todayKey = formatDateKey(new Date());
        const selectedKey = formatDateKey(selectedDate);

        for (let i = startDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const dateObj = new Date(prevMonthYear, prevMonth, dayNum);
            const dateStr = formatDateKey(dateObj);
            calendarDaysGrid.appendChild(createDayCell(dayNum, dateObj, dateStr, apptsByDate[dateStr] || [], true, todayKey, selectedKey));
        }

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dateObj = new Date(viewYear, viewMonth, day);
            const dateStr = formatDateKey(dateObj);
            calendarDaysGrid.appendChild(createDayCell(day, dateObj, dateStr, apptsByDate[dateStr] || [], false, todayKey, selectedKey));
        }

        const totalCellsRendered = startDayIndex + totalDaysInMonth;
        const remainingCells = totalCellsRendered <= 35 ? (35 - totalCellsRendered) : (42 - totalCellsRendered);
        const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;

        for (let day = 1; day <= remainingCells; day++) {
            const dateObj = new Date(nextMonthYear, nextMonth, day);
            const dateStr = formatDateKey(dateObj);
            calendarDaysGrid.appendChild(createDayCell(day, dateObj, dateStr, apptsByDate[dateStr] || [], true, todayKey, selectedKey));
        }
    }

    function createDayCell(dayNum, dateObj, dateStr, appts, isOtherMonth, todayKey, selectedKey) {
        const cell = document.createElement('div');
        const isToday = dateStr === todayKey;
        const isSelected = dateStr === selectedKey;
        const hasAppts = appts.length > 0;

        cell.className = `cal-day-cell ${isOtherMonth ? 'other-month' : ''} ${isSelected ? 'is-selected' : ''} ${hasAppts ? 'has-appts' : ''}`;
        cell.setAttribute('data-date', dateStr);

        let eventDotsHtml = '';
        if (hasAppts) {
            const count = Math.min(appts.length, 3);
            for (let i = 0; i < count; i++) eventDotsHtml += `<span class="cal-event-dot"></span>`;
        }

        let miniPreviewHtml = '';
        if (hasAppts && appts[0]) {
            const first = appts[0];
            const shortName = (first.paciente || '').split(' ')[0] || 'Cita';
            miniPreviewHtml = `
                <div class="cal-mini-event-pill" title="${first.hora || ''} ${first.paciente} (${first.tipoLabel || ''})">
                    ${first.hora || ''} ${shortName}
                </div>
            `;
        }

        cell.innerHTML = `
            <div class="cal-day-top">
                <span class="day-num ${isToday ? 'is-today' : ''}">${dayNum}</span>
                ${hasAppts ? `<span class="day-count-badge">${appts.length}</span>` : ''}
            </div>
            <div class="cal-day-bottom">
                <div class="cal-day-events">${eventDotsHtml}</div>
                ${miniPreviewHtml}
            </div>
        `;

        cell.addEventListener('click', () => {
            selectedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            if (isOtherMonth) {
                viewYear = dateObj.getFullYear();
                viewMonth = dateObj.getMonth();
            }
            renderMonthlyGrid();
            renderSelectedDayAgenda();
        });

        return cell;
    }

    function renderSelectedDayAgenda() {
        if (!dayAppointmentsContainer) return;

        const dateStr = formatDateKey(selectedDate);
        const allAppts = window.ClinicalDB ? ClinicalDB.getAppointments() : [];
        const dayAppts = allAppts.filter(a => a.fecha === dateStr);

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDateStr = selectedDate.toLocaleDateString('es-ES', options);
        if (selectedDateTitle) {
            selectedDateTitle.textContent = formattedDateStr.charAt(0).toUpperCase() + formattedDateStr.slice(1);
        }

        const isToday = formatDateKey(new Date()) === dateStr;
        if (dayAgendaTag) dayAgendaTag.textContent = isToday ? 'Hoy' : 'Día Seleccionado';

        if (selectedDateSubtitle) {
            selectedDateSubtitle.textContent = dayAppts.length === 1
                ? '1 paciente programada para esta fecha'
                : `${dayAppts.length} pacientes programadas para esta fecha`;
        }

        updateDayFilterCounts(dayAppts);

        let filtered = dayAppts;
        if (currentFilter !== 'all') {
            filtered = dayAppts.filter(a => a.tipo === currentFilter);
        }

        filtered.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
        dayAppointmentsContainer.innerHTML = '';

        if (filtered.length === 0) {
            dayAppointmentsContainer.innerHTML = `
                <div style="text-align: center; padding: 42px 16px; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 14px; margin-top: 4px;">
                    <i class="far fa-calendar-plus" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 12px; display: inline-block;"></i>
                    <h4 style="font-size: 1.05rem; font-weight: 800; color: #1e293b; margin-bottom: 6px;">Sin citas ni cirugías programadas</h4>
                    <p style="font-size: 0.84rem; color: #64748b; margin-bottom: 16px;">No hay turnos registrados para el ${selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}.</p>
                    <button type="button" class="btn-action-primary" style="margin: 0 auto; font-size: 0.82rem; padding: 8px 16px;" onclick="document.getElementById('btnAddApptForSelectedDay').click()">
                        <i class="fas fa-plus"></i> Agendar en esta Fecha
                    </button>
                </div>
            `;
            return;
        }

        const typeMetaMap = {
            prenatal: { label: 'Control Prenatal', icon: 'fa-baby' },
            ginecologia: { label: 'Consulta Ginecológica', icon: 'fa-female' },
            colpo: { label: 'Colposcopia', icon: 'fa-microscope' },
            eco: { label: 'Ecografía', icon: 'fa-wave-square' },
            histeroscopia: { label: 'Histeroscopia', icon: 'fa-magnifying-glass-plus' },
            cirugia: { label: 'Cirugía / Operación', icon: 'fa-user-doctor' },
            postoperatorio: { label: 'Control Postoperatorio', icon: 'fa-bandage' },
            revision: { label: 'Revisión de Exámenes', icon: 'fa-vial-virus' }
        };

        filtered.forEach((appt, index) => {
            const card = document.createElement('div');
            card.className = `appointment-card status-${appt.status || 'programada'}`;
            card.style.setProperty('--stagger-idx', index);

            const meta = typeMetaMap[appt.tipo] || { label: appt.tipoLabel || 'Consulta Médica', icon: 'fa-stethoscope' };

            let statusTagClass = 'badge-tag badge-tag-blue';
            let statusLabel = 'PROGRAMADA';
            let statusIcon = 'fa-clock';
            if (appt.status === 'atendida') {
                statusTagClass = 'badge-tag badge-tag-green';
                statusLabel = 'ATENDIDA';
                statusIcon = 'fa-circle-check';
            } else if (appt.status === 'espera') {
                statusTagClass = 'badge-tag badge-tag-purple';
                statusLabel = 'EN ESPERA';
                statusIcon = 'fa-hourglass-half';
            }

            // Generar el enlace inteligente de WhatsApp según el acto médico
            const waLink = ClinicalDB.generateWhatsAppLink(appt);
            const initials = getInitials(appt.paciente);

            card.innerHTML = `
                <div class="patient-card-header-row">
                    <div class="patient-avatar-time-group">
                        <div class="patient-monogram-circle">${initials}</div>
                        <div class="appointment-time-badge">
                            <i class="far fa-clock"></i>
                            <span>${ClinicalDB.formatReadableTime(appt.hora || '09:00')}</span>
                        </div>
                    </div>
                    <span class="${statusTagClass}">
                        <i class="fas ${statusIcon}"></i> ${statusLabel}
                    </span>
                </div>

                <div>
                    <h4 class="appointment-patient-name">${appt.paciente}</h4>
                    <div class="appointment-patient-meta">
                        <span><i class="far fa-id-card"></i> ${appt.cedula || 'S/C'}</span>
                        <span><i class="fab fa-whatsapp" style="color:#16a34a;"></i> ${appt.telefono || 'S/T'}</span>
                    </div>
                    <span class="appointment-type-tag">
                        <i class="fas ${meta.icon}"></i> ${appt.tipoLabel || meta.label}
                    </span>
                </div>

                ${appt.motivo ? `
                    <div class="appointment-motivo-box">
                        <i class="fas fa-quote-left"></i>
                        <span>"${appt.motivo}"</span>
                    </div>
                ` : ''}

                <div class="appointment-actions">
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <a href="historia_clinica.html?cedula=${encodeURIComponent(appt.cedula || '')}&nombre=${encodeURIComponent(appt.paciente || '')}&tipo=${appt.tipo === 'prenatal' ? 'prenatal' : 'ginecologia'}" 
                           class="hero-btn-action hero-btn-secondary" style="padding: 5px 10px; font-size: 0.76rem;" title="Abrir Historia Clínica">
                            <i class="fas fa-notes-medical"></i> Historia
                        </a>

                        <a href="${waLink}" target="_blank" rel="noopener noreferrer"
                           class="btn-wa-reminder-pill" title="Enviar recordatorio automatizado por WhatsApp">
                            <i class="fab fa-whatsapp"></i> Recordar Cita
                        </a>
                    </div>

                    <div style="display: flex; gap: 6px;">
                        <button type="button" class="btn-app-action btn-check" title="Alternar Atendida / Pendiente" onclick="toggleAppointmentStatus('${appt.id}')">
                            <i class="fas ${appt.status === 'atendida' ? 'fa-rotate-left' : 'fa-check'}"></i>
                        </button>

                        <button type="button" class="btn-app-action btn-del" title="Cancelar Cita" onclick="deleteAppointmentCard('${appt.id}')">
                            <i class="far fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;

            dayAppointmentsContainer.appendChild(card);
        });
    }

    function updateDayFilterCounts(appts) {
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        setTxt('countFilterAll', appts.length);
        setTxt('countFilterPrenatal', appts.filter(a => a.tipo === 'prenatal').length);
        setTxt('countFilterGyn', appts.filter(a => a.tipo === 'ginecologia').length);
        setTxt('countFilterColpo', appts.filter(a => a.tipo === 'colpo').length);
        setTxt('countFilterEco', appts.filter(a => a.tipo === 'eco').length);
        setTxt('countFilterCirugia', appts.filter(a => a.tipo === 'cirugia').length);
    }

    if (btnPrevMonth) {
        btnPrevMonth.addEventListener('click', () => {
            if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--;
            renderMonthlyGrid();
        });
    }

    if (btnNextMonth) {
        btnNextMonth.addEventListener('click', () => {
            if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++;
            renderMonthlyGrid();
        });
    }

    if (btnGoToday) {
        btnGoToday.addEventListener('click', () => {
            const now = new Date();
            viewYear = now.getFullYear();
            viewMonth = now.getMonth();
            selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            renderMonthlyGrid();
            renderSelectedDayAgenda();
        });
    }

    if (btnAddApptForSelectedDay) {
        btnAddApptForSelectedDay.addEventListener('click', () => {
            const apptDateInput = document.getElementById('apptDate');
            if (apptDateInput) apptDateInput.value = formatDateKey(selectedDate);
            const modal = document.getElementById('modalNewAppt');
            if (modal) modal.classList.add('active');
            const nameInput = document.getElementById('apptPatientName');
            if (nameInput) setTimeout(() => nameInput.focus(), 80);
        });
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.getAttribute('data-filter') || 'all';
            renderSelectedDayAgenda();
        });
    });

    window.reloadCalendarAndAgenda = function () {
        renderMonthlyGrid();
        renderSelectedDayAgenda();
        loadDashboardKPIs();
    };

    renderMonthlyGrid();
    renderSelectedDayAgenda();
    initNewApptModal(selectedDate);
}

function initFormatCatalog() {
    const searchInput = document.getElementById('formatSearchInput');
    if (!searchInput) return;

    const matchCountBadge = document.getElementById('formatMatchCount');
    const categoryBtns = document.querySelectorAll('.format-cat-btn');
    const moduleCards = document.querySelectorAll('.modules-grid .module-card');

    let currentCategory = 'all';
    let currentSearchTerm = '';

    function filterCatalog() {
        let visibleCount = 0;
        const query = currentSearchTerm.toLowerCase();

        moduleCards.forEach(card => {
            const cardCat = card.getAttribute('data-category') || '';
            const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
            const cardTitle = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const cardDesc = (card.querySelector('p')?.textContent || '').toLowerCase();

            const matchesCategory = (currentCategory === 'all' || cardCat === currentCategory);
            const matchesSearch = !query || cardKeywords.includes(query) || cardTitle.includes(query) || cardDesc.includes(query);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (matchCountBadge) {
            matchCountBadge.textContent = query
                ? `${visibleCount} encontrado${visibleCount === 1 ? '' : 's'}`
                : `${visibleCount} formatos`;
        }
    }

    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim();
        filterCatalog();
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category') || 'all';
            filterCatalog();
        });
    });
}

function initInteractiveClockPicker() {
    let currentHour = 9;
    let currentMinute = 0;
    let currentPeriod = 'AM';

    const hiddenInput = document.getElementById('apptTime');
    const displayTime = document.getElementById('clockDisplayTime');
    const displayPeriod = document.getElementById('clockDisplayPeriod');
    const hourHand = document.getElementById('clockSvgHourHand');
    const minuteHand = document.getElementById('clockSvgMinuteHand');

    const hourButtons = document.querySelectorAll('.clock-hour-btn');
    const minuteButtons = document.querySelectorAll('.btn-min-chip');
    const periodButtons = document.querySelectorAll('.clock-period-segmented .btn-period');
    const slotButtons = document.querySelectorAll('.clock-slots-grid .btn-time-slot');

    function updateClockUI() {
        const formattedHour = String(currentHour).padStart(2, '0');
        const formattedMinute = String(currentMinute).padStart(2, '0');

        if (displayTime) displayTime.textContent = `${formattedHour}:${formattedMinute}`;
        if (displayPeriod) displayPeriod.textContent = currentPeriod;

        let h24 = currentHour;
        if (currentPeriod === 'AM') {
            h24 = (currentHour === 12) ? 0 : currentHour;
        } else {
            h24 = (currentHour === 12) ? 12 : currentHour + 12;
        }
        const time24Str = `${String(h24).padStart(2, '0')}:${formattedMinute}`;
        if (hiddenInput) hiddenInput.value = time24Str;

        const hourDeg = (currentHour % 12) * 30 + (currentMinute / 60) * 30;
        const minDeg = currentMinute * 6;

        if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
        if (minuteHand) minuteHand.style.transform = `rotate(${minDeg}deg)`;

        hourButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.getAttribute('data-hour'), 10) === currentHour);
        });
        minuteButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.getAttribute('data-min'), 10) === currentMinute);
        });
        periodButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-period') === currentPeriod);
        });
        slotButtons.forEach(btn => {
            const sh = parseInt(btn.getAttribute('data-hour'), 10);
            const sm = parseInt(btn.getAttribute('data-min'), 10);
            const sp = btn.getAttribute('data-period');
            btn.classList.toggle('active', sh === currentHour && sm === currentMinute && sp === currentPeriod);
        });
    }

    hourButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentHour = parseInt(btn.getAttribute('data-hour'), 10) || 9;
            updateClockUI();
        });
    });

    minuteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentMinute = parseInt(btn.getAttribute('data-min'), 10) || 0;
            updateClockUI();
        });
    });

    periodButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentPeriod = btn.getAttribute('data-period') || 'AM';
            updateClockUI();
        });
    });

    slotButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentHour = parseInt(btn.getAttribute('data-hour'), 10);
            currentMinute = parseInt(btn.getAttribute('data-min'), 10);
            currentPeriod = btn.getAttribute('data-period');
            updateClockUI();
        });
    });

    window.resetClockPicker = function (timeStr = '09:00') {
        const parts = (timeStr || '09:00').split(':');
        let h24 = parseInt(parts[0], 10) || 9;
        let m = parseInt(parts[1], 10) || 0;
        currentPeriod = h24 >= 12 ? 'PM' : 'AM';
        currentHour = h24 % 12 === 0 ? 12 : h24 % 12;
        currentMinute = m;
        updateClockUI();
    };

    updateClockUI();
}

function initNewApptModal(defaultDate) {
    const modal = document.getElementById('modalNewAppt');
    const btnOpen = document.getElementById('btnOpenNewApptModal');
    const btnClose = document.getElementById('btnCloseApptModal');
    const btnCancel = document.getElementById('btnCancelAppt');
    const form = document.getElementById('formNewAppointment');
    const dateInput = document.getElementById('apptDate');

    initInteractiveClockPicker();

    function formatDateInput(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    if (btnOpen && modal) {
        btnOpen.addEventListener('click', () => {
            if (dateInput && defaultDate) dateInput.value = formatDateInput(defaultDate);
            if (window.resetClockPicker) window.resetClockPicker('09:00');
            modal.classList.add('active');
            const firstInput = document.getElementById('apptPatientName');
            if (firstInput) setTimeout(() => firstInput.focus(), 80);
        });
    }

    function closeModal() {
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        if (window.resetClockPicker) window.resetClockPicker('09:00');
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const patientName = document.getElementById('apptPatientName').value.trim();
            const cedula = document.getElementById('apptCedula').value.trim();
            const phone = document.getElementById('apptPhone').value.trim();
            const date = document.getElementById('apptDate').value;
            const time = document.getElementById('apptTime').value;
            const type = document.getElementById('apptType').value;
            const notes = document.getElementById('apptNotes').value.trim();
            const sendWaNow = document.getElementById('apptSendWhatsAppNow')?.checked;

            const typeLabels = {
                prenatal: 'Control Prenatal',
                ginecologia: 'Consulta Ginecológica',
                colpo: 'Colposcopia',
                eco: 'Ecografía',
                histeroscopia: 'Histeroscopia',
                cirugia: 'Cirugía / Intervención Quirúrgica',
                postoperatorio: 'Control Postoperatorio',
                revision: 'Revisión de Exámenes'
            };

            const newAppt = {
                id: 'APP-' + Date.now(),
                paciente: patientName,
                cedula: cedula,
                telefono: phone,
                fecha: date,
                hora: time,
                tipo: type,
                tipoLabel: typeLabels[type] || 'Consulta',
                motivo: notes,
                status: 'programada'
            };

            ClinicalDB.saveAppointment(newAppt);
            ClinicalDB.savePatient({
                nombre: patientName,
                nombreApellido: patientName,
                cedula: cedula,
                telefono: phone
            });

            closeModal();
            if (window.reloadCalendarAndAgenda) window.reloadCalendarAndAgenda();
            ClinicalDB.showToast(`Turno de ${patientName} agendado para el ${date}`, 'success');

            if (sendWaNow && phone) {
                const waUrl = ClinicalDB.generateWhatsAppLink(newAppt);
                window.open(waUrl, '_blank', 'noopener,noreferrer');
            }
        });
    }
}

window.toggleAppointmentStatus = function (id) {
    const list = ClinicalDB.getAppointments();
    const item = list.find(a => a.id === id);
    if (item) {
        const nextStatus = item.status === 'atendida' ? 'programada' : 'atendida';
        ClinicalDB.updateAppointmentStatus(id, nextStatus);
        if (window.reloadCalendarAndAgenda) window.reloadCalendarAndAgenda();
        ClinicalDB.showToast(`Estado de cita: ${nextStatus.toUpperCase()}`, 'info');
    }
};

window.deleteAppointmentCard = function (id) {
    if (confirm('¿Desea cancelar y eliminar esta cita de la agenda médica?')) {
        ClinicalDB.deleteAppointment(id);
        if (window.reloadCalendarAndAgenda) window.reloadCalendarAndAgenda();
        ClinicalDB.showToast('Cita eliminada de la agenda', 'info');
    }
};
