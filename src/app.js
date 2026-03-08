// University Website - Main JavaScript (Dynamic JSON Loading)
const BASE_URL = window.location.origin;

const UniversityApp = {
    universityData: null,

    wireBackButtons() {
        const backEls = document.querySelectorAll('[data-back]');
        backEls.forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.history.length > 1) {
                    window.history.back();
                }
            });
        });
    },

    async loadConfig() {
        try {
            const response = await fetch(`${BASE_URL}/data/config/fields.json`);
            if (!response.ok) throw new Error('Failed to load configuration');
            this.universityData = await response.json();
            return this.universityData;
        } catch (error) {
            console.error('Error loading config:', error);
            throw error;
        }
    },

    async loadField(code) {
        try {
            const response = await fetch(`${BASE_URL}/data/config/${code}.json`);
            if (!response.ok) throw new Error(`Failed to load field: ${code}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading field:', error);
            throw error;
        }
    },

    getStatistics(data) {
        const totalFields = data.fields.length;
        // majors is now a count number in the index
        const totalMajors = data.fields.reduce((sum, field) => sum + (field.majors || 0), 0);
        return { totalFields, totalMajors };
    },

    async initIndexPage() {
        const fieldsGrid = document.getElementById('fieldsGrid');
        const searchInput = document.getElementById('searchInput');
        const emptyState = document.getElementById('emptyState');

        if (!fieldsGrid) return;

        try {
            const data = await this.loadConfig();
            const stats = this.getStatistics(data);

            const fieldCountEl = document.getElementById('fieldCount');
            const majorCountEl = document.getElementById('majorCount');
            if (fieldCountEl) fieldCountEl.textContent = stats.totalFields;
            if (majorCountEl) majorCountEl.textContent = stats.totalMajors;

            this.renderFields(data.fields, fieldsGrid, emptyState);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase().trim();
                    const filteredFields = searchTerm
                        ? data.fields.filter(field =>
                              field.code.toLowerCase().includes(searchTerm) ||
                              (field.name && field.name.toLowerCase().includes(searchTerm))
                          )
                        : data.fields;

                    this.renderFields(filteredFields, fieldsGrid, emptyState);
                });
            }
        } catch (error) {
            console.error('Failed to initialize:', error);
            if (emptyState) {
                emptyState.innerHTML = '<div class="empty-icon">❌</div><div class="empty-text">Erreur de chargement</div>';
                emptyState.classList.add('show');
            }
        }
    },

    renderFields(fields, container, emptyState) {
        container.innerHTML = '';
        if (fields.length === 0) {
            if (emptyState) emptyState.classList.add('show');
            return;
        }
        if (emptyState) emptyState.classList.remove('show');

        fields.forEach(field => {
            const fieldCard = document.createElement('a');
            fieldCard.className = 'field-card';
            fieldCard.href = `${BASE_URL}/majors?field=${encodeURIComponent(field.code)}`;
            if (field.name) fieldCard.title = field.name;
            const majorCount = field.majors || 0;
            fieldCard.innerHTML = `
                <div class="field-code">${field.code}</div>
                <div class="field-count">${majorCount} filière${majorCount > 1 ? 's' : ''}<span class="field-arrow">→</span></div>
            `;
            container.appendChild(fieldCard);
        });
    },

    async initMajorsPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const fieldCode = urlParams.get('field');
        if (!fieldCode) {
            window.location.href = `${BASE_URL}/`;
            return;
        }

        try {
            const data = await this.loadConfig();
            const fieldMeta = data.fields.find(f => f.code === fieldCode);
            if (!fieldMeta) {
                window.location.href = `${BASE_URL}/`;
                return;
            }

            const field = await this.loadField(fieldCode);

            document.getElementById('breadcrumbField').textContent = field.code;
            document.getElementById('fieldTitle').textContent = field.name || `Domaine ${field.code}`;
            const majorCount = field.majors.filter(m => m.name.trim().toLowerCase() !== 'tronc commun').length;
            document.getElementById('fieldSubtitle').textContent = `${majorCount} filière${majorCount > 1 ? 's' : ''} disponible${majorCount > 1 ? 's' : ''}`;

            const majorsGrid = document.getElementById('majorsGrid');
            const noteBox = document.getElementById('noteBox');

            const majorsWithoutFormations = field.majors.filter(major => {
                const groups = this.getMajorTypeGroups(major);
                const total = groups.reduce((s, g) => s + (g.formations?.length || 0), 0);
                return total === 0;
            }).length;
            
            if (noteBox && majorsWithoutFormations > 0) {
                noteBox.style.display = 'block';
                noteBox.innerHTML = `<strong>📝 Informations</strong>${majorsWithoutFormations} filière${majorsWithoutFormations > 1 ? 's' : ''} en cours d'ajout.`;
            }

            this.renderMajors(field, majorsGrid);
        } catch (error) {
            console.error('Failed to load:', error);
            document.querySelector('.container').innerHTML = '<div class="empty-state show"><div class="empty-icon">❌</div><div class="empty-text">Erreur</div></div>';
        }
    },

    getMajorTypeGroups(major) {
        if (Array.isArray(major.formation)) {
            return major.formation.map(f => ({
                type: f.system || 'Programme',
                formations: Array.isArray(f.specialties)
                    ? f.specialties.map(s => ({
                        specialties: s.specialtie || 'Programme',
                        programPath: s.programPath || null,
                        system: f.system || null
                    }))
                    : []
            }));
        }
        return [];
    },

    renderMajors(field, container) {
        container.innerHTML = '';
        field.majors.forEach((major) => {
            const majorCard = document.createElement('div');
            majorCard.className = 'major-card';
            const typeGroups = this.getMajorTypeGroups(major);
            const totalFormations = typeGroups.reduce(
                (sum, g) => sum + (Array.isArray(g.formations) ? g.formations.length : 0),
                0
            );
            const hasFormations = totalFormations > 0;
            
            if (!hasFormations) {
                majorCard.innerHTML = `<div class="major-header"><div class="major-name">${major.name}</div><div class="major-info">Filière</div></div><div class="formations-list"><div class="formation-item no-program"><div class="formation-header"><div class="formation-type">Programme</div><div class="formation-badge coming-soon">À venir</div></div></div></div>`;
            } else {
                const formationsList = typeGroups.map((group, index) => {
                    const items = (group.formations || []).map(formation => {
                        const specialtiesText = formation.specialties || 'Programme';
                        const linkHtml = formation.programPath
                            ? `<a href="${BASE_URL}/program?path=${encodeURIComponent(formation.programPath)}&system=${encodeURIComponent(formation.system || '')}&specialty=${encodeURIComponent(formation.specialties || '')}" class="program-link">Voir le programme →</a>`
                            : '<div style="margin-top: 10px; font-size: 0.85rem; color: #64748b;">Programme à venir</div>';
                        return `<div class="formation-item"><div class="formation-header"><div class="formation-type-specialty">${specialtiesText}</div></div>${linkHtml}</div>`;
                    }).join('');
                    // All types start closed; user clicks to open
                    return `<div class="formation-type-group"><button type="button" class="formation-type-title">${group.type}</button><div class="formation-type-items">${items}</div></div>`;
                }).join('');
                majorCard.innerHTML = `<div class="major-header"><div class="major-name">${major.name}</div><div class="major-info">${totalFormations} formation${totalFormations > 1 ? 's' : ''}</div></div><div class="formations-list">${formationsList}</div>`;

                // Click on type title to toggle its specialties list
                const typeTitles = majorCard.querySelectorAll('.formation-type-title');
                typeTitles.forEach((titleEl) => {
                    titleEl.addEventListener('click', (e) => {
                        e.preventDefault();
                        const parent = titleEl.closest('.formation-type-group');
                        if (parent) {
                            parent.classList.toggle('open');
                        }
                    });
                });
            }
            container.appendChild(majorCard);
        });
    },

    async initProgramPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const programPath = urlParams.get('path');
        const system = urlParams.get('system') || '';
        const specialty = urlParams.get('specialty') || '';
        if (!programPath) {
            window.location.href = `${BASE_URL}/`;
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/data/${programPath}.json`);
            if (!response.ok) throw new Error('Program not found');
            const programData = await response.json();
            this.renderProgram(programData, system, specialty);
        } catch (error) {
            console.error('Error:', error);
            document.querySelector('.container').innerHTML = `
                <div class="empty-state show">
                    <div class="empty-icon">📚</div>
                    <div class="empty-text">Programme introuvable</div>
                    <a href="${BASE_URL}/" style="margin-top: 20px; display: inline-block; padding: 10px 20px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Retour</a>
                </div>
            `;
        }
    },

    renderProgram(programData, system, specialty) {
        if (!programData || programData.length === 0) return;

        document.getElementById('systemValue').textContent = system.toUpperCase();
        document.getElementById('trackValue').textContent = specialty.toUpperCase();
        document.getElementById('programTitle').textContent = specialty.toUpperCase();

        const years = [...new Set(programData.map(s => s.year))].sort();
        let currentYear = years[0];

        const yearSelector = document.getElementById('yearSelector');
        yearSelector.innerHTML = '';
        years.forEach(year => {
            const btn = document.createElement('button');
            btn.className = 'year-btn';
            btn.textContent = `Année ${year}`;
            if (year === currentYear) btn.classList.add('active');
            btn.addEventListener('click', () => {
                currentYear = year;
                document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderSemesters(programData, currentYear);
            });
            yearSelector.appendChild(btn);
        });

        this.renderSemesters(programData, currentYear);
    },

    renderSemesters(programData, year) {
        const content = document.getElementById('programContent');
        if (!content) return;
        content.innerHTML = '';
        const semesters = programData.filter(s => s.year === year);

        semesters.forEach(semester => {
            const semesterDiv = document.createElement('div');
            semesterDiv.className = 'semester-container';
            
            const totalCredits = semester.units.reduce((sum, unit) => sum + unit.credit, 0);
            const totalCoef = semester.units.reduce((sum, unit) => sum + unit.Coefficients, 0);

            // Calculate total weekly hours
            let totalC = 0, totalTD = 0, totalTP = 0;
            semester.units.forEach(unit => {
                unit.subjects.forEach(subject => {
                    totalC += parseFloat(subject.C || subject.c || 0);
                    totalTD += parseFloat(subject.TD || subject.td || 0);
                    totalTP += parseFloat(subject.TP || subject.tp || 0);
                });
            });

            // Build table rows
            let tableRows = '';
            semester.units.forEach(unit => {
                // Unit header row
                tableRows += `
                    <tr class="unit-row">
                        <td class="unit-cell" rowspan="${unit.subjects.length + 1}">
                            <div class="unit-name">${unit.code}</div>
                            <div class="unit-meta">Crédits : ${unit.credit}</div>
                            <div class="unit-meta">Coefficients : ${unit.Coefficients}</div>
                        </td>
                    </tr>
                `;

                // Subject rows
                unit.subjects.forEach(subject => {
                    const c = subject.C || subject.c || 0;
                    const td = subject.TD || subject.td || 0;
                    const tp = subject.TP || subject.tp || 0;
                    const vhs = (c + td + tp) * 14;
                    const continuous = subject.continuous ?? subject.Continuous ?? 0;
                    const exam = subject.exam ?? subject.Exam ?? 0;

                    const formatHours = (h) => h > 0 ? (h % 1 === 0 ? h : h.toFixed(1)) + 'h' : '-';

                    tableRows += `
                        <tr class="subject-row">
                            <td class="subject-name-cell">${subject.name}</td>
                            <td class="number-cell">${subject.credit}</td>
                            <td class="number-cell">${subject.coef}</td>
                            <td class="number-cell">${formatHours(c)}</td>
                            <td class="number-cell">${formatHours(td)}</td>
                            <td class="number-cell">${formatHours(tp)}</td>
                            <td class="number-cell">${formatHours(vhs)}</td>
                            <td class="number-cell">${continuous > 0 ? (continuous * 100) + '%' : '-'}</td>
                            <td class="number-cell">${exam > 0 ? (exam * 100) + '%' : '-'}</td>
                        </tr>
                    `;
                });
            });

            // Total row
            const totalVHS = (totalC + totalTD + totalTP) * 14;
            const formatHours = (h) => h > 0 ? (h % 1 === 0 ? h : h.toFixed(1)) + 'h' : '-';
            
            tableRows += `
                <tr class="total-row">
                    <td colspan="2"><strong>Total Semestre ${semester.semester}</strong></td>
                    <td class="number-cell"><strong>${totalCredits}</strong></td>
                    <td class="number-cell"><strong>${totalCoef}</strong></td>
                    <td class="number-cell"><strong>${formatHours(totalC)}</strong></td>
                    <td class="number-cell"><strong>${formatHours(totalTD)}</strong></td>
                    <td class="number-cell"><strong>${formatHours(totalTP)}</strong></td>
                    <td class="number-cell"><strong>${formatHours(totalVHS)}</strong></td>
                    <td colspan="2"></td>
                </tr>
            `;

            semesterDiv.innerHTML = `
                <div class="semester-header">
                    <h2 class="semester-title">Semestre ${semester.semester}</h2>
                </div>
                <div class="table-container">
                    <table class="program-table">
                        <thead>
                            <tr>
                                <th>Unités d'Enseignement</th>
                                <th>Intitulés des matières</th>
                                <th>Crédits</th>
                                <th>Coef.</th>
                                <th>C</th>
                                <th>TD</th>
                                <th>TP</th>
                                <th>VHS<br><small>(14 sem.)</small></th>
                                <th>Continu</th>
                                <th>Examen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            `;

            content.appendChild(semesterDiv);
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    UniversityApp.wireBackButtons();
    
    if (path.includes('index.html') || path === '/' || path.endsWith('/templates/')) {
        UniversityApp.initIndexPage();
    } else if (path.includes('majors.html') || path.endsWith('/majors')) {
        UniversityApp.initMajorsPage();
    } else if (path.includes('program.html') || path.endsWith('/program')) {
        UniversityApp.initProgramPage();
    }
});
