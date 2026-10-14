/**
 * ==========================================================================
 * SISTEMA CLÍNICO - DR. CHRISTIAN A. RODRÍGUEZ C.
 * BASE DE DATOS LOCAL, MEMBRETE OFICIAL DINÁMICO, WHATSAPP AUTOMATIZADO Y PDF
 * VERSIÓN 7.0 - ARQUITECTURA UNIFICADA SIN CÓDIGO REPETITIVO
 * ==========================================================================
 */

const ClinicalDB = {
    // CONFIGURACIÓN OFICIAL ÚNICA DEL MÉDICO
    DOCTOR: {
        nombre: 'Dr. Christian A. Rodríguez C.',
        especialidad: 'GINECOLOGÍA Y OBSTETRICIA',
        mpps: '96.430',
        cmg: '4232',
        rif: 'V-18288931-4',
        credencialesLinea: 'GINECOLOGÍA Y OBSTETRICIA - MPPS: 96.430 - CMG: 4232 - RIF: V-18288931-4',
        telefonos: '0414-5860575 / 0412-4770492',
        logo: (typeof DOCTOR_LOGO_BASE64 !== 'undefined' ? DOCTOR_LOGO_BASE64 : 'images/0.jpeg')
    },

    // Claves de Almacenamiento Local
    KEYS: {
        PATIENTS: 'liteMedicPatients',
        APPOINTMENTS: 'liteMedicAppointments',
        RECORDS: 'liteMedicClinicalRecords',
        REPORTS: 'liteMedicReports',
        PRESCRIPTIONS: 'liteMedicRecipes',
        LABS: 'liteMedicLabRequests',
        LEAVES: 'liteMedicMedicalLeaves',
        QUOTES: 'liteMedicSurgicalQuotes',
        COLPO_PHOTOS: 'liteMedicColpoMontages',
        MEDS: 'liteFarma_medicamentos'
    },

    // =========================================================================
    // 1. INYECTOR AUTOMÁTICO DE MEMBRETE Y SELLO OFICIAL (CERO REPETICIÓN)
    // =========================================================================
    initOfficialBranding() {
        // 1. Actualizar Nombre y Credenciales en el Header del Sistema
        document.querySelectorAll('.header-doctor-badge .name').forEach(el => {
            el.textContent = this.DOCTOR.nombre;
        });
        document.querySelectorAll('.header-doctor-badge .specialty').forEach(el => {
            el.textContent = 'Ginecología y Obstetricia';
        });

        // 1.b Reemplazar inmediatamente cualquier imagen local del logo con Base64 para garantizar que nunca ocurra canvas tainted en protocolo file:///
        document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || img.src || '';
            if (src.includes('0.jpeg') || src.includes('images/0')) {
                if (typeof DOCTOR_LOGO_BASE64 !== 'undefined') {
                    img.src = DOCTOR_LOGO_BASE64;
                    img.setAttribute('src', DOCTOR_LOGO_BASE64);
                }
            }
        });

        // 2. Transformar todos los membretes (.medical-letterhead, .sheet-letterhead)
        // El membrete se conserva guardado en el documento pero NO se exhibe en pantalla interactiva de trabajo.
        // Se visualiza exclusivamente al exportar / descargar el PDF y al imprimir.
        document.querySelectorAll('.medical-letterhead, .sheet-letterhead').forEach(header => {
            // Detectar el título dinámico del documento actual
            const existingTitleEl = header.querySelector('[id$="Title"], .letterhead-doc-badge') ||
                                    header.querySelector('.letterhead-contact-box div:last-child');
            const titleId = existingTitleEl && existingTitleEl.id ? existingTitleEl.id : '';
            let docTitle = existingTitleEl ? existingTitleEl.textContent.trim() : '';

            const pagePath = window.location.pathname.toLowerCase();
            if (!docTitle || (docTitle.includes('REPOSO PRE Y POSTNATAL') && !pagePath.includes('reposo_prenatal'))) {
                docTitle = this.resolveDocumentTitleByPage(pagePath);
            }

            header.classList.add('stored-official-letterhead');
            header.innerHTML = `
                <div class="letterhead-elegant-wrapper">
                    <div class="letterhead-brand-left">
                        <img src="${this.DOCTOR.logo}" alt="${this.DOCTOR.nombre}" class="letterhead-logo-img" onerror="this.style.display='none'">
                        <div class="letterhead-doctor-info">
                            <h1 class="letterhead-doc-name">${this.DOCTOR.nombre}</h1>
                            <h2 class="letterhead-doc-credentials">${this.DOCTOR.credencialesLinea}</h2>
                            <div class="letterhead-doc-contact-inline">
                                <span>Teléfonos: ${this.DOCTOR.telefonos}</span>
                            </div>
                        </div>
                    </div>
                    <div class="letterhead-doc-badge-box">
                        <div class="letterhead-doc-badge" ${titleId ? `id="${titleId}"` : ''}>${docTitle}</div>
                    </div>
                </div>
            `;
        });

        // 3. Pies de documento: Los datos del médico (MPPS, CMG, RIF, etc.) van ÚNICAMENTE en el membrete superior.
        // Se limpian los pies de página para dejar solo la firma del médico tratante.
        document.querySelectorAll('.medical-doc-footer, .sheet-footer-dual, .dossier-footer-signature').forEach(footer => {
            footer.innerHTML = `
                <div class="signature-stamp-box" style="margin-left: auto;">
                    <div class="signature-line"></div>
                    <div class="doc-stamp-title">Firma del Médico Tratante</div>
                </div>
            `;
        });

        // 5. Inyectar regla estricta @page { margin: 0mm } para eliminar URL y fecha si se activa motor de impresión
        if (!document.getElementById('clinicalPrintStyleFix')) {
            const style = document.createElement('style');
            style.id = 'clinicalPrintStyleFix';
            style.textContent = `
                @page { size: letter portrait; margin: 0mm !important; }
                @media print {
                    .no-print, .toast-notification, .dashboard-header, .top-action-bar, .top-nav-tabs,
                    .btn-action, .btn-action-util, .btn-action-save, .btn-wa-reminder-pill {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 6. Interceptar window.print para que SIEMPRE descargue PDF limpio y nunca muestre la URL file:/// ni páginas partidas
        window.print = () => {
            const sheet = document.querySelector('#printableCertificateSheet, #printableHistoryDossier, #printableReportSheet, #printableEcoSheet, #printableRecipeSheet, #printableRepMedSheet, #printableConstSheet, #printableLabSheet, #printablePQSheet, #printableRefSheet, #printableColpoSheet, #printableHisteroSheet, #printableEgresoSheet, #printableColpoPhotosSheet, .executive-sheet, .booklet-container');
            if (sheet) {
                const title = document.title ? document.title.replace(/[^a-zA-Z0-9_\-]/g, '_') : 'Documento_Clinico';
                this.downloadPDF(sheet, title);
            }
        };

        // 7. Interceptar Ctrl+P
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                window.print();
            }
        });
    },

    resolveDocumentTitleByPage(path) {
        if (path.includes('histeroscopia')) return 'INFORME DE HISTEROSCOPIA';
        if (path.includes('colposcopia_imagenes')) return 'ANEXO FOTOGRÁFICO COLPOSCÓPICO';
        if (path.includes('colposcopia')) return 'INFORME COLPOSCÓPICO OFICIAL';
        if (path.includes('constancia')) return 'CONSTANCIA MÉDICA OFICIAL';
        if (path.includes('ecografico')) return 'INFORME ECOGRÁFICO';
        if (path.includes('egreso')) return 'INFORME DE ALTA MÉDICA (EPICRISIS)';
        if (path.includes('informe_medico')) return 'INFORME MÉDICO CLÍNICO';
        if (path.includes('presupuesto')) return 'PRESUPUESTO QUIRÚRGICO';
        if (path.includes('recipe')) return 'RÉCIPE E INDICACIONES MÉDICAS';
        if (path.includes('referencia')) return 'REFERENCIA MÉDICA / INTERCONSULTA';
        if (path.includes('reposo_prenatal')) return 'CERTIFICADO DE REPOSO PRE Y POSTNATAL';
        if (path.includes('reposo_medico')) return 'CONSTANCIA DE REPOSO MÉDICO';
        if (path.includes('laboratorios')) return 'ORDEN MÉDICA DE LABORATORIO';
        return 'DOCUMENTO MÉDICO OFICIAL';
    },

    // =========================================================================
    // 2. MOTOR INTELIGENTE DE RECORDATORIOS POR WHATSAPP (UN SOLO CLIC)
    // =========================================================================
    normalizePhone(rawPhone) {
        let digits = String(rawPhone || '').replace(/\D/g, '');
        if (!digits) return '';
        if (digits.startsWith('0') && digits.length === 11) {
            return '58' + digits.slice(1);
        }
        if (digits.length === 10 && /^(414|424|412|416|426)/.test(digits)) {
            return '58' + digits;
        }
        return digits;
    },

    formatReadableDate(dateStr) {
        if (!dateStr) return 'fecha programada';
        const parts = String(dateStr).split('-');
        if (parts.length !== 3) return dateStr;
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    },

    formatReadableTime(time24) {
        if (!time24) return 'hora acordada';
        const parts = String(time24).split(':');
        if (parts.length < 2) return time24;
        let h = parseInt(parts[0], 10);
        const m = parts[1];
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${String(h12).padStart(2, '0')}:${m} ${period}`;
    },

    buildWhatsAppReminderMessage(data) {
        const paciente = data.paciente || data.nombre || 'Estimada paciente';
        const fechaBonita = this.formatReadableDate(data.fecha);
        const horaBonita = data.hora ? this.formatReadableTime(data.hora) : '';
        const bloqueFechaHora = horaBonita ? `el día *${fechaBonita}* a las *${horaBonita}*` : `el día *${fechaBonita}*`;
        const motivoExtra = data.motivo ? `\n📌 *Observación / Motivo:* ${data.motivo}` : '';
        const cabecera = `Hola *${paciente}*, le saludamos cordialmente del consultorio del *${this.DOCTOR.nombre}* (${this.DOCTOR.especialidad}).\n\n`;
        const pie = `\n\nPor favor confirme su asistencia respondiendo a este mensaje. En caso de emergencia o reprogramación, comuníquese al *${this.DOCTOR.telefonos}*.`;

        const templates = {
            prenatal:
                `Le recordamos su cita de *Control Prenatal* programada para ${bloqueFechaHora}.` +
                `\n📋 *Recuerde traer:* Cartilla/Carné de Control Prenatal, últimos exámenes de laboratorio y estudios ecográficos previos.` +
                motivoExtra,

            ginecologia:
                `Le recordamos su *Consulta Ginecológica* programada para ${bloqueFechaHora}.` +
                `\n📋 *Recomendación:* Asistir con estudios previos si los posee.` +
                motivoExtra,

            colpo:
                `Le recordamos su estudio de *Colposcopia / Evaluación Cervical* programado para ${bloqueFechaHora}.` +
                `\n📋 *Preparación previa:* No presentar sangrado menstrual activo y abstenerse de relaciones sexuales, óvulos o duchas vaginales 48 horas antes del estudio.` +
                motivoExtra,

            eco:
                `Le recordamos su cita para *Ecografía Ginecológica / Obstétrica* programada para ${bloqueFechaHora}.` +
                `\n📋 *Recomendación:* Traer estudios ecográficos anteriores para comparación evolutiva.` +
                motivoExtra,

            histeroscopia:
                `Le recordamos su procedimiento de *Histeroscopia* programado para ${bloqueFechaHora}.` +
                `\n📋 *Preparación:* Asistir acompañada, traer estudios previos y cumplir las indicaciones pre-procedimiento indicadas en consulta.` +
                motivoExtra,

            revision:
                `Le recordamos su cita de *Revisión de Exámenes y Resultados Paraclínicos* programada para ${bloqueFechaHora}.` +
                `\n📋 *Importante:* Traer todos los resultados de laboratorio, biopsia o imágenes impresos o en digital.` +
                motivoExtra,

            cirugia:
                `Le recordamos su *Intervención Quirúrgica / Programación Operatoria* pautada para ${bloqueFechaHora}.` +
                `\n🏥 *Indicaciones Preoperatorias Obligatorias:*` +
                `\n• Ayuno absoluto de 8 horas previas al ingreso.` +
                `\n• Traer perfil preoperatorio completo, evaluación cardiovascular e informes médicos.` +
                `\n• Asistir sin maquillaje, esmalte de uñas ni prendas metálicas.` +
                motivoExtra,

            postoperatorio:
                `Le recordamos su cita de *Control Postoperatorio / Evaluación de Alta* programada para ${bloqueFechaHora}.` +
                `\n📋 *Recomendación:* Continuar con el tratamiento al alta y acudir puntualmente para revisión de herida operatoria y evolución.` +
                motivoExtra
        };

        const cuerpo = templates[data.tipo] || templates.ginecologia;
        return cabecera + cuerpo + pie;
    },

    generateWhatsAppLink(data) {
        let phone = data.telefono || '';
        if (!phone && data.cedula) {
            const p = this.getPatientByCedula(data.cedula);
            if (p && p.telefono) phone = p.telefono;
        }
        const normalized = this.normalizePhone(phone);
        const text = this.buildWhatsAppReminderMessage(data);
        if (!normalized) {
            return `https://wa.me/?text=${encodeURIComponent(text)}`;
        }
        return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
    },

    openWhatsAppReminder(data) {
        let phone = data.telefono || '';
        if (!phone && data.cedula) {
            const p = this.getPatientByCedula(data.cedula);
            if (p && p.telefono) phone = p.telefono;
        }
        if (!phone) {
            const inputPhone = prompt(`Ingrese el número de WhatsApp de ${data.paciente || 'la paciente'} (Ej: 0414-1234567):`, '0414-');
            if (inputPhone === null) return;
            phone = inputPhone.trim();
            if (phone && data.cedula) {
                this.savePatient({
                    cedula: data.cedula,
                    nombre: data.paciente || data.nombre || '',
                    telefono: phone
                });
            }
        }
        const link = this.generateWhatsAppLink({ ...data, telefono: phone });
        window.open(link, '_blank', 'noopener,noreferrer');
    },

    // =========================================================================
    // 3. GESTIÓN DE PACIENTES Y PACIENTE DE PRUEBA OFICIAL PREESTABLECIDO
    // =========================================================================
    TEST_PATIENT: {
        nombre: 'Mariana Sofia Gomez',
        nombreApellido: 'Mariana Sofia Gomez',
        cedula: '25.489.123',
        telefono: '0414-1234567',
        edad: 28,
        fechaNacimiento: '1998-05-14',
        lugarNacimiento: 'Valencia, Edo. Carabobo',
        direccion: 'Urb. La Trigaleña, Calle 132, Res. Monte Carlo, Apto 4-B, Valencia, Edo. Carabobo',
        empresa: 'Inversiones Mercantiles Valencia C.A.',
        cargo: 'Coordinadora de Administración',
        tipoSangre: 'O Positivo (O+)',
        estadoCivil: 'Casada',
        fechaCaptacion: '2026-05-10',
        vacunacion: 'Toxoide tetánico (2 dosis), Influenza estacional, Covid-19 (al día)',
        motivoConsulta: 'Control Prenatal de Rutina - Evaluación Integral Semana 34',
        motivo: 'Control Prenatal',
        
        // Antecedentes Médicos
        antEnfermedad: 'Niega patologías médicas de base (no HTA, no Diabetes Mellitus, no Asma)',
        antEruptivas: 'Varicela en la infancia con resolución completa sin secuelas',
        antAlergias: 'Niega alergias a medicamentos ni alimentos',
        antTraumatismos: 'Niega traumatismos relevantes',
        antQuirurgicos: 'Apendicectomía laparoscópica en 2018 sin complicaciones',
        antTransfusiones: 'Niega transfusiones sanguíneas previas',
        antComplicaciones: 'Niega antecedentes de complicaciones obstétricas previas',
        
        // Antecedentes Gineco-Obstétricos
        gynMenarquia: '12',
        gynCiclo: '28/4 Regular, eumenorreica',
        gynParejas: '1',
        gynAnticonceptivos: 'Método de barrera (preservativo) previo al embarazo',
        gynITS: 'Niega infecciones de transmisión sexual',
        gynCitologia: 'Marzo 2026: Negativa para lesión intraepitelial o malignidad (Bethesda)',
        gynPMF: 'Deseo Gestacional Cumplido',
        gynFUR: '2026-02-16',
        fur: '2026-02-16',
        fpp: '2026-11-23',
        eg: '34 semanas + 1 día',
        aoGestas: 1,
        aoPartos: 0,
        aoCesareas: 0,
        aoAbortos: 0,
        aoOtros: 'Ninguno',
        aoEmbarazoAnt: 'Primigesta (G1P0C0A0)',
        aoComplicacionesAnt: 'Evolución prenatal adecuada y curso normoevolutivo',
        
        // Familiares
        famMadre: 'Viva, 56 años, HTA controlada con Losartán 50mg/día',
        famPadre: 'Vivo, 60 años, Aparentemente sano',
        famEsposo: 'Vivo, 30 años, Sano, grupo O Positivo (O+)',
        famHermanos: '2 hermanos vivos, sanos',
        famHijos: '0',
        famGrupoSangrePadre: 'O Positivo (O+)',
        
        // Parámetros Físicos
        peso: 64.5,
        talla: 1.65,
        pa: '110/70',
        ta: '110/70 mmHg',
        pulso: '78',
        fc: '78',
        fr: '18',
        temperatura: '36.5',
        fcf: '142',
        au: '31',
        
        // Diagnóstico y Plan Clínico
        prenatalEstudios: 'Ecografía Doppler materno-fetal dentro de límites normales. Percentil de crecimiento fetal P50. Perfil biofísico 10/10. ILA: 13.8 cm.',
        prenatalTratamiento: 'Sulfato Ferroso 200mg + Ácido Fólico 1mg VO OD. Calcio 600mg + Vit D3 VO OD. Acetaminofén 500mg SOS.',
        prenatalProximaCita: '2026-10-27',
        prenatalMaduracion: 'No requerida actualmente.',
        prenatalEvolucion: 'Paciente en adecuadas condiciones clínicas. Movimientos fetales activos presentes. PA: 110/70 mmHg, AU: 31cm, FCF: 142 lpm. Sin dinámica uterina dolorosa, sin hidrorrea ni pérdidas transvaginales.',
        diagnostico: 'Gestación simple activa de 34 semanas por FUM y biometría ecográfica. Feto único vivo en presentación cefálica, dorso izquierdo. Curso obstétrico normoevolutivo satisfactorio.',
        diagReposoMaternal: 'Embarazo simple de 34 semanas por FUR y ecografía de primer trimestre. Feto único vivo cefálico. Se indica reposo prenatal reglamentario correspondiente a 6 semanas (42 días continuos) y período postnatal de 12 semanas (84 días continuos) conforme a la legislación laboral y de seguridad social vigente.',
        
        // Datos para Informe Médico
        informeDirigido: 'A Quien Pueda Interesar / Medicina Ocupacional',
        informeEnfermedadActual: 'Se trata de gestante de 28 años de edad, primigesta, cursando con embarazo de 34 semanas por FUM y ecografía, quien acude a consulta de control prenatal para evaluación de tercer trimestre y tramitación de reposo prenatal reglamentario.',
        informeExamenFisico: 'Paciente en estables condiciones generales, normotensa (PA: 110/70 mmHg, FC: 78 lpm, Peso: 64.5 kg). Cardiopulmonar normal. Abdomen grávido, AU: 31 cm, feto único cefálico, FCF: 142 lpm. Sin pérdidas transvaginales. Miembros inferiores sin edemas.',
        informePlan: '1. Reposo prenatal reglamentario de 42 días continuos a partir de la fecha.\n2. Continuar micronutrientes prenatales (Hierro + Ácido Fólico + Calcio).\n3. Próximo control obstétrico en 2 semanas.',
        
        // Datos para Ecografía
        ecoTipo: 'Obstetrica',
        ecoDatos: {
            semanas: '34 semanas + 1 día',
            dbp: '85',
            cc: '310',
            ca: '300',
            lf: '66',
            peso: '2350',
            fcf: '142',
            placenta: 'Fúndica posterior normoinserta Grado II',
            liquido: 'Normal (ILA: 13.8 cm)',
            conclusion: 'Gestación intrauterina simple activa de 34 semanas por biometría fetal armónica con FUR. Crecimiento en percentil 50. Anatomía fetal sin anomalías detectables. Bienestar fetal conservado.'
        },
        
        // Datos para Récipe
        recipeMeds: [
            { nombre: 'Sulfato Ferroso + Ácido Fólico', presentacion: 'Tab 200mg / 1mg', cantidad: '1 Caja (30 Tabs)', via: 'Vía Oral' },
            { nombre: 'Calcio + Vitamina D3', presentacion: 'Comprimidos 600mg / 400 UI', cantidad: '1 Frasco (60 Comprimidos)', via: 'Vía Oral' },
            { nombre: 'Acetaminofén (Paracetamol)', presentacion: 'Tabletas 500 mg', cantidad: '1 Blíster (10 Tabs)', via: 'Vía Oral' }
        ],
        recipeIndicaciones: '1. Sulfato Ferroso 200mg + Ácido Fólico 1mg: Tomar 1 tableta vía oral en ayunas con jugo de naranja o agua (evitar lácteos).\n2. Calcio 600mg + Vit D3: Tomar 1 comprimido vía oral con el almuerzo.\n3. Acetaminofén 500mg: Tomar 1 tableta vía oral cada 8 horas únicamente si presenta dolor leve o cefalea.',
        recipeRecomendaciones: 'Reposo relativo. Ingesta de 2.5 litros de agua al día. Dieta balanceada en 5 raciones. Consultar de urgencia ante dolor pélvico persistente, contracciones frecuentes, sangrado genital o pérdida de líquido.',
        
        // Reposo Médico General
        diasReposo: 3,
        motivoReposo: 'Lumbalgia gestacional mecánica y fatiga física moderada. Se indica reposo físico absoluto por 3 días continuos.',
        
        // Constancia
        constanciaTipo: 'prenatal',
        constanciaTexto: 'Por medio de la presente se hace constar que la ciudadana MARIANA SOFÍA GÓMEZ, titular de la Cédula de Identidad V-25.489.123, se encuentra bajo estricto control prenatal en este centro médico, cursando con embarazo simple de 34 semanas de gestación por FUR confiable y ecografía, en evolución satisfactoria.',
        
        // Laboratorios
        labIndicacion: 'Control Prenatal de Rutina del III Trimestre',
        laboratoriosSolicitados: 'Hematología Completa, Glicemia, Urea, Creatinina, Examen Simple de Orina, Urocultivo con Antibiograma, VDRL, VIH 1 y 2, HBsAg, Toxoplasmosis IgG e IgM, PTOG 75g.',
        
        createdAt: new Date().toISOString()
    },

    getTestPatient() {
        return JSON.parse(JSON.stringify(this.TEST_PATIENT));
    },

    getDemoPatients() {
        return [
            this.getTestPatient(),
            {
                nombre: 'Valeria C. Hernandez',
                nombreApellido: 'Valeria C. Hernandez',
                cedula: '21.890.345',
                telefono: '0424-9876543',
                edad: 32,
                fechaNacimiento: '1994-08-20',
                peso: 58.0,
                talla: 1.62,
                gynFUR: '2026-09-28',
                aoGestas: 1,
                aoPartos: 1,
                aoCesareas: 0,
                aoAbortos: 0,
                motivo: 'Colposcopia',
                createdAt: new Date().toISOString()
            },
            {
                nombre: 'Daniela Rivas Morales',
                nombreApellido: 'Daniela Rivas Morales',
                cedula: '27.123.456',
                telefono: '0412-5551234',
                edad: 24,
                fechaNacimiento: '2002-03-11',
                peso: 54.0,
                talla: 1.58,
                gynFUR: '2026-09-22',
                aoGestas: 0,
                aoPartos: 0,
                aoCesareas: 0,
                aoAbortos: 0,
                motivo: 'Consulta Ginecológica',
                createdAt: new Date().toISOString()
            }
        ];
    },

    getPatients() {
        try {
            const data = localStorage.getItem(this.KEYS.PATIENTS) || localStorage.getItem('patients');
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const demo = this.getDemoPatients()[0];
                    const idx = parsed.findIndex(p => p.cedula === demo.cedula);
                    if (idx >= 0) {
                        parsed[idx] = { ...demo, ...parsed[idx] };
                    }
                    return parsed;
                }
            }
            const initial = this.getDemoPatients();
            localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(initial));
            return initial;
        } catch (e) {
            console.error('Error al obtener pacientes:', e);
            return [];
        }
    },

    savePatient(patient) {
        if (!patient || !patient.cedula) return null;
        let list = this.getPatients();
        const index = list.findIndex(p => String(p.cedula).trim() === String(patient.cedula).trim());

        const now = new Date().toISOString();
        patient.updatedAt = now;

        if (index >= 0) {
            list[index] = { ...list[index], ...patient };
        } else {
            patient.createdAt = now;
            list.unshift(patient);
        }

        localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(list));
        localStorage.setItem('patients', JSON.stringify(list));
        return patient;
    },

    getPatientByCedula(cedula) {
        if (!cedula) return null;
        const list = this.getPatients();
        return list.find(p => String(p.cedula).trim().toLowerCase() === String(cedula).trim().toLowerCase()) || null;
    },

    // =========================================================================
    // 4. GESTIÓN DE CITAS Y AGENDA MÉDICA
    // =========================================================================
    getAppointments() {
        try {
            const data = localStorage.getItem(this.KEYS.APPOINTMENTS);
            if (!data) {
                const initial = this.getDemoAppointments();
                localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(initial));
                return initial;
            }
            return JSON.parse(data);
        } catch (e) {
            console.error('Error al obtener citas:', e);
            return [];
        }
    },

    saveAppointment(appt) {
        if (!appt) return null;
        let list = this.getAppointments();
        if (!appt.id) {
            appt.id = 'APP-' + Date.now();
            appt.createdAt = new Date().toISOString();
            if (!appt.status) appt.status = 'programada';
            list.unshift(appt);
        } else {
            const idx = list.findIndex(a => a.id === appt.id);
            if (idx >= 0) list[idx] = { ...list[idx], ...appt };
            else list.unshift(appt);
        }
        localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(list));
        return appt;
    },

    updateAppointmentStatus(id, newStatus) {
        let list = this.getAppointments();
        const item = list.find(a => a.id === id);
        if (item) {
            item.status = newStatus;
            localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(list));
            return true;
        }
        return false;
    },

    deleteAppointment(id) {
        let list = this.getAppointments();
        list = list.filter(a => a.id !== id);
        localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(list));
        return true;
    },

    getDemoAppointments() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const today = `${y}-${m}-${d}`;

        const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
        const dayPlus2 = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;
        const d5 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5);
        const dayPlus5 = `${d5.getFullYear()}-${String(d5.getMonth() + 1).padStart(2, '0')}-${String(d5.getDate()).padStart(2, '0')}`;

        return [
            {
                id: 'APP-101',
                fecha: today,
                hora: '09:00',
                paciente: 'Mariana Sofia Gomez',
                cedula: '25.489.123',
                telefono: '0414-1234567',
                tipo: 'prenatal',
                tipoLabel: 'Control Prenatal',
                motivo: 'Evaluación Semana 24 - Eco Doppler Materno-Fetal',
                status: 'programada'
            },
            {
                id: 'APP-102',
                fecha: today,
                hora: '10:30',
                paciente: 'Valeria C. Hernandez',
                cedula: '21.890.345',
                telefono: '0424-9876543',
                tipo: 'colpo',
                tipoLabel: 'Colposcopia',
                motivo: 'Evaluación de cuello uterino y test de Schiller',
                status: 'espera'
            },
            {
                id: 'APP-103',
                fecha: today,
                hora: '11:45',
                paciente: 'Daniela Rivas Morales',
                cedula: '27.123.456',
                telefono: '0412-5551234',
                tipo: 'ginecologia',
                tipoLabel: 'Consulta Ginecológica',
                motivo: 'Chequeo anual y citología cérvico-vaginal',
                status: 'atendida'
            },
            {
                id: 'APP-104',
                fecha: dayPlus2,
                hora: '08:30',
                paciente: 'Camila Andrea Mendoza',
                cedula: '26.789.012',
                telefono: '0416-7891234',
                tipo: 'cirugia',
                tipoLabel: 'Cirugía / Cesárea Programada',
                motivo: 'Cesárea Segmentaria + Salpingoclasia',
                status: 'programada'
            },
            {
                id: 'APP-105',
                fecha: dayPlus5,
                hora: '10:00',
                paciente: 'Gabriela Perez Soto',
                cedula: '24.112.334',
                telefono: '0424-3322114',
                tipo: 'eco',
                tipoLabel: 'Ecografía',
                motivo: 'Ecografía Pélvica y Transvaginal Ginecológica',
                status: 'programada'
            }
        ];
    },

    // =========================================================================
    // 5. CÁLCULOS CLÍNICOS AUTOMÁTICOS Y CONVERSOR DE DÍAS A LETRAS
    // =========================================================================
    calculateIMC(weightKg, heightM) {
        const w = parseFloat(weightKg);
        let h = parseFloat(heightM);

        if (!w || !h || w <= 0 || h <= 0) {
            return { value: '--', label: 'Sin calcular', class: '' };
        }

        if (h > 3) h = h / 100;

        const imc = (w / (h * h)).toFixed(1);
        let label = 'Normal';
        let badgeClass = 'status-normal';

        if (imc < 18.5) {
            label = 'Bajo peso';
            badgeClass = 'status-warning';
        } else if (imc >= 18.5 && imc < 25) {
            label = 'Normal';
            badgeClass = 'status-normal';
        } else if (imc >= 25 && imc < 30) {
            label = 'Sobrepeso';
            badgeClass = 'status-warning';
        } else {
            label = 'Obesidad';
            badgeClass = 'status-danger';
        }

        return { value: imc, label, class: badgeClass };
    },

    calculateAge(birthDateStr) {
        if (!birthDateStr) return '';
        const dob = new Date(birthDateStr);
        if (isNaN(dob.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age >= 0 ? age : '';
    },

    calculateNaegele(furStr) {
        if (!furStr) return { fpp: '', fppFormatted: '', egSemanas: '', egDias: '', egTexto: '' };
        const fur = new Date(furStr + 'T00:00:00');
        if (isNaN(fur.getTime())) return { fpp: '', fppFormatted: '', egSemanas: '', egDias: '', egTexto: '' };

        const fpp = new Date(fur);
        fpp.setDate(fpp.getDate() + 7);
        fpp.setMonth(fpp.getMonth() - 3);
        fpp.setFullYear(fpp.getFullYear() + 1);

        const fppFormatted = fpp.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const today = new Date();
        const diffMs = today.getTime() - fur.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let egSemanas = '';
        let egDias = '';
        if (diffDays >= 0 && diffDays <= 310) {
            egSemanas = Math.floor(diffDays / 7);
            egDias = diffDays % 7;
        }

        return {
            fpp: fpp.toISOString().slice(0, 10),
            fppFormatted,
            egSemanas,
            egDias,
            egTexto: egSemanas !== '' ? `${egSemanas} sem + ${egDias} d` : ''
        };
    },

    daysToSpanishWords(days) {
        const n = parseInt(days, 10);
        if (isNaN(n) || n <= 0) return '';
        const pad = String(n).padStart(2, '0');
        if (n === 1) return `UN (${pad}) DÍA CONTINUO`;

        const exact = {
            2: 'DOS', 3: 'TRES', 4: 'CUATRO', 5: 'CINCO', 6: 'SEIS', 7: 'SIETE', 8: 'OCHO', 9: 'NUEVE',
            10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
            16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE', 20: 'VEINTE',
            21: 'VEINTIÚN', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO', 25: 'VEINTICINCO',
            26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE', 30: 'TREINTA',
            40: 'CUARENTA', 42: 'CUARENTA Y DOS', 45: 'CUARENTA Y CINCO', 60: 'SESENTA',
            84: 'OCHENTA Y CUATRO', 90: 'NOVENTA', 120: 'CIENTO VEINTE'
        };
        if (exact[n]) return `${exact[n]} (${pad}) DÍAS CONTINUOS`;

        const tens = { 3: 'TREINTA', 4: 'CUARENTA', 5: 'CINCUENTA', 6: 'SESENTA', 7: 'SETENTA', 8: 'OCHENTA', 9: 'NOVENTA' };
        const units = { 1: 'UN', 2: 'DOS', 3: 'TRES', 4: 'CUATRO', 5: 'CINCO', 6: 'SEIS', 7: 'SIETE', 8: 'OCHO', 9: 'NUEVE' };
        if (n > 30 && n < 100) {
            const t = Math.floor(n / 10);
            const u = n % 10;
            return `${tens[t]}${u ? ' Y ' + units[u] : ''} (${pad}) DÍAS CONTINUOS`;
        }
        return `${n} (${pad}) DÍAS CONTINUOS`;
    },

    // =========================================================================
    // 6. BINDING DE SELECTORES DE PACIENTES Y EXPORTACIÓN PDF
    // =========================================================================
    bindPatientSelector(selectId, onSelect) {
        const sel = document.getElementById(selectId);
        if (!sel) return;

        const patients = this.getPatients();
        sel.innerHTML = '<option value="">-- Seleccionar Paciente Registrada --</option>';

        patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.cedula;
            opt.textContent = `${p.nombre || p.nombreApellido || 'Paciente'} (C.I: ${p.cedula})`;
            sel.appendChild(opt);
        });

        sel.addEventListener('change', (e) => {
            const ced = e.target.value;
            if (!ced) return;
            const patient = this.getPatientByCedula(ced);
            if (patient && typeof onSelect === 'function') {
                onSelect(patient);
            }
        });
    },

    downloadPDF(containerSelector, rawFilename = 'Documento_Clinico') {
        const element = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;

        if (!element) {
            console.error('downloadPDF: Elemento no encontrado', containerSelector);
            this.showToast('No se encontró el documento a descargar', 'warning');
            return;
        }

        // 1. Eliminar cualquier toast o elemento flotante para que NUNCA aparezca en el PDF
        document.querySelectorAll('.toast-notification').forEach(t => t.remove());

        // 2. Si estamos en historia clínica y se exporta el dossier, sincronizar datos y ocultar formulario
        const isHistoryDossier = element.id === 'printableHistoryDossier';
        const formHistory = document.getElementById('clinicalHistoryForm');
        if (isHistoryDossier) {
            if (typeof window.syncHistoryToDossier === 'function') {
                window.syncHistoryToDossier();
            }
            if (formHistory) {
                formHistory.style.display = 'none';
            }
        }

        // 3. Forzar visibilidad explícita del elemento a exportar
        const prevElementDisplay = element.style.display;
        const prevElementVisibility = element.style.visibility;
        element.style.display = 'block';
        element.style.visibility = 'visible';

        // 4. CRÍTICO: Sincronizar todos los inputs, textareas y selects en el DOM real.
        // html2canvas clona el DOM con cloneNode(true). Si los valores están solo en propiedades JS y no en atributos,
        // cloneNode genera inputs VACÍOS / EN BLANCO.
        const modifiedInputs = [];
        element.querySelectorAll('input').forEach(inp => {
            if (inp.type === 'checkbox' || inp.type === 'radio') {
                if (inp.checked) inp.setAttribute('checked', 'checked');
                else inp.removeAttribute('checked');
            } else if (inp.type === 'date') {
                const origVal = inp.value;
                modifiedInputs.push({ el: inp, type: 'date', origVal: origVal });
                if (origVal) {
                    inp.type = 'text';
                    const parts = origVal.split('-');
                    if (parts.length === 3) {
                        inp.value = `${parts[2]}/${parts[1]}/${parts[0]}`;
                    }
                }
                inp.setAttribute('value', inp.value || '');
            } else {
                inp.setAttribute('value', inp.value != null ? inp.value : '');
            }
        });

        const modifiedTextareas = [];
        element.querySelectorAll('textarea').forEach(txt => {
            const val = txt.value != null ? txt.value : '';
            txt.textContent = val;
            txt.innerHTML = val;
            modifiedTextareas.push({ el: txt, height: txt.style.height });
            txt.style.height = 'auto';
            if (txt.scrollHeight > 0) {
                txt.style.height = (txt.scrollHeight + 4) + 'px';
            }
        });

        const modifiedSelects = [];
        element.querySelectorAll('select').forEach(sel => {
            const selectedText = sel.options[sel.selectedIndex]?.text || '';
            const span = document.createElement('span');
            span.className = 'pdf-temp-select-val';
            span.textContent = selectedText;
            span.style.cssText = 'display: inline-block; font-weight: 600; color: #0f2b5c; font-size: 0.88rem; padding: 4px 0; border-bottom: 1px solid #cbd5e1; width: 100%; box-sizing: border-box;';
            const origDisplay = sel.style.display;
            sel.style.display = 'none';
            sel.parentNode.insertBefore(span, sel);
            modifiedSelects.push({ sel: sel, span: span, origDisplay: origDisplay });
        });

        // 4.d CRÍTICO: Prevenir error "Tainted canvases may not be exported"
        // En protocolo local (file:///), cualquier <img> con ruta relativa (images/0.jpeg) marca el canvas como tainted.
        // Sustituimos todas las imágenes no-data por el Base64 precargado para garantizar que toDataURL() funcione siempre.
        const modifiedImages = [];
        element.querySelectorAll('img').forEach(img => {
            const currentSrc = img.src || img.getAttribute('src') || '';
            if (!currentSrc.startsWith('data:')) {
                modifiedImages.push({ el: img, origSrc: currentSrc });
                if (typeof DOCTOR_LOGO_BASE64 !== 'undefined') {
                    img.src = DOCTOR_LOGO_BASE64;
                    img.setAttribute('src', DOCTOR_LOGO_BASE64);
                } else if (this.DOCTOR.logo && this.DOCTOR.logo.startsWith('data:')) {
                    img.src = this.DOCTOR.logo;
                    img.setAttribute('src', this.DOCTOR.logo);
                } else {
                    img.style.display = 'none';
                }
            }
        });

        let cleanName = rawFilename.replace(/[^a-zA-Z0-9_\-]/g, '_');
        if (!cleanName.toLowerCase().endsWith('.pdf')) {
            cleanName += '.pdf';
        }

        // 5. Ocultar todos los controles interactivos y barras de acción
        const elementsToHide = document.querySelectorAll('.no-print, .toast-notification, .top-nav-tabs, .top-action-bar, .dashboard-header, .btn-action, .btn-action-util, .btn-action-save, .btn-wa-reminder-pill');
        const prevDisplays = [];
        elementsToHide.forEach((el, i) => {
            prevDisplays[i] = el.style.display;
            el.style.display = 'none';
        });

        // 6. Añadir clases temporales en body y en el elemento
        document.body.classList.add('pdf-rendering-active');
        element.classList.add('pdf-rendering-active');

        // 7. Guardar posición de scroll y subir a (0, 0)
        const scrollX = window.scrollX || window.pageXOffset || 0;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        window.scrollTo(0, 0);

        const restoreUI = () => {
            document.body.classList.remove('pdf-rendering-active');
            element.classList.remove('pdf-rendering-active');
            element.style.display = prevElementDisplay;
            element.style.visibility = prevElementVisibility;

            if (isHistoryDossier && formHistory) {
                formHistory.style.display = '';
            }

            // Restaurar inputs de fecha
            modifiedInputs.forEach(item => {
                item.el.type = item.type;
                item.el.value = item.origVal;
                item.el.setAttribute('value', item.origVal);
            });

            // Restaurar textareas
            modifiedTextareas.forEach(item => {
                item.el.style.height = item.height;
            });

            // Restaurar selects
            modifiedSelects.forEach(item => {
                item.sel.style.display = item.origDisplay;
                if (item.span && item.span.parentNode) {
                    item.span.parentNode.removeChild(item.span);
                }
            });

            // Restaurar imágenes
            modifiedImages.forEach(item => {
                item.el.src = item.origSrc;
                item.el.setAttribute('src', item.origSrc);
                item.el.style.display = '';
            });

            elementsToHide.forEach((el, i) => {
                el.style.display = prevDisplays[i] || '';
            });

            window.scrollTo(scrollX, scrollY);
        };

        if (window.html2pdf) {
            // Dar 120ms para que el navegador aplique los estilos de layout antes del render
            setTimeout(() => {
                const opt = {
                    margin: [4, 4, 4, 4],
                    filename: cleanName,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        allowTaint: false,
                        logging: false,
                        scrollX: 0,
                        scrollY: 0
                    },
                    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
                    pagebreak: { mode: ['css', 'legacy'] }
                };

                window.html2pdf()
                    .set(opt)
                    .from(element)
                    .save()
                    .then(() => {
                        restoreUI();
                        this.showToast(`Archivo ${cleanName} descargado exitosamente`, 'success');
                    })
                    .catch(err => {
                        console.error('Error al generar PDF con html2pdf:', err);
                        restoreUI();
                        this.showToast('No se pudo generar el archivo PDF: ' + (err.message || err), 'danger');
                    });
            }, 120);
        } else {
            restoreUI();
            this.showToast('Librería de descarga PDF no disponible', 'danger');
        }
    },

    showToast(message, type = 'success') {
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification no-print';
            document.body.appendChild(toast);
        }

        toast.className = `toast-notification no-print ${type} show`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast && toast.parentNode) toast.remove();
            }, 300);
        }, 3000);
    }
};

window.ClinicalDB = ClinicalDB;

// Inicializar automáticamente el Membrete y Sello Oficial en todas las páginas al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    ClinicalDB.initOfficialBranding();
});
