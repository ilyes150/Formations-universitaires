// University Website - Main JavaScript (Dynamic JSON Loading)

const UniversityApp = {
    universityData: null,

    async loadConfig() {
        try {
            const response = await fetch('../data/config/fields.json');
            if (!response.ok) throw new Error('Failed to load configuration');
            this.universityData = await response.json();
            return this.universityData;
        } catch (error) {
            console.error('Error loading config:', error);
            const stored = localStorage.getItem('universityData');
            if (stored) {
                this.universityData = JSON.parse(stored);
                return this.universityData;
            }
            throw error;
        }
    },

    getStatistics(data) {
        const totalFields = data.fields.length;
        const totalMajors = data.fields.reduce((sum, field) => sum + field.majors.length, 0);
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
                    if (searchTerm === '') {
                        this.renderFields(data.fields, fieldsGrid, emptyState);
                        return;
                    }
                    const filteredFields = data.fields.filter(field => 
                        field.code.toLowerCase().includes(searchTerm) ||
                        (field.name && field.name.toLowerCase().includes(searchTerm))
                    );
                    this.renderFields(filteredFields, fieldsGrid, emptyState);
                });
            }
            localStorage.setItem('universityData', JSON.stringify(data));
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
            fieldCard.href = `majors.html?field=${encodeURIComponent(field.code)}`;
            if (field.name) fieldCard.title = field.name;
            fieldCard.innerHTML = `<div class="field-code">${field.code}</div><div class="field-count">${field.majors.length} filière${field.majors.length > 1 ? 's' : ''}<span class="field-arrow">→</span></div>`;
            container.appendChild(fieldCard);
        });
    },

    async initMajorsPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const fieldCode = urlParams.get('field');
        if (!fieldCode) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const data = await this.loadConfig();
            const field = data.fields.find(f => f.code === fieldCode);
            if (!field) {
                window.location.href = 'index.html';
                return;
            }

            document.getElementById('breadcrumbField').textContent = field.code;
            document.getElementById('fieldTitle').textContent = field.name || `Domaine ${field.code}`;
            document.getElementById('fieldSubtitle').textContent = `${field.majors.length} filière${field.majors.length > 1 ? 's' : ''} disponible${field.majors.length > 1 ? 's' : ''}`;

            const majorsGrid = document.getElementById('majorsGrid');
            const noteBox = document.getElementById('noteBox');

            const majorsWithoutFormations = field.majors.filter(major => !major.formations || major.formations.length === 0).length;
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

    renderMajors(field, container) {
        container.innerHTML = '';
        field.majors.forEach((major) => {
            const majorCard = document.createElement('div');
            majorCard.className = 'major-card';
            const hasFormations = major.formations && major.formations.length > 0;
            
            if (!hasFormations) {
                majorCard.innerHTML = `<div class="major-header"><div class="major-name">${major.name}</div><div class="major-info">Filière</div></div><div class="formations-list"><div class="formation-item no-program"><div class="formation-header"><div class="formation-type">Programme</div><div class="formation-badge coming-soon">À venir</div></div></div></div>`;
            } else {
                const formationsList = major.formations.map(formation => {
                    const specialtiesText = formation.specialties && formation.specialties.length > 0 ? `${formation.specialties.length} spécialité${formation.specialties.length > 1 ? 's' : ''}` : 'Programme';
                    return `<div class="formation-item"><div class="formation-header"><div class="formation-type">${formation.type}</div><div class="formation-badge">${specialtiesText}</div></div>${formation.programPath ? `<a href="program.html?path=${encodeURIComponent(formation.programPath)}" class="program-link">Voir le programme →</a>` : '<div style="margin-top: 10px; font-size: 0.85rem; color: #64748b;">Programme à venir</div>'}</div>`;
                }).join('');
                majorCard.innerHTML = `<div class="major-header"><div class="major-name">${major.name}</div><div class="major-info">${major.formations.length} formation${major.formations.length > 1 ? 's' : ''}</div></div><div class="formations-list">${formationsList}</div>`;
            }
            container.appendChild(majorCard);
        });
    },

    async initProgramPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const programPath = urlParams.get('path');
        if (!programPath) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const response = await fetch(`../data/${programPath}.json`);
            if (!response.ok) throw new Error('Program not found');
            const programData = await response.json();
            this.renderProgram(programData);
        } catch (error) {
            console.error('Error:', error);
            document.querySelector('.container').innerHTML = '<div class="empty-state show"><div class="empty-icon">📚</div><div class="empty-text">Programme introuvable</div><a href="index.html" style="margin-top: 20px; display: inline-block; padding: 10px 20px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Retour</a></div>';
        }
    },

    renderProgram(programData) {
        if (programData.length > 0) {
            const firstSemester = programData[0];
            document.getElementById('systemValue').textContent = firstSemester.system.toUpperCase();
            document.getElementById('trackValue').textContent = firstSemester.track.replace(/-/g, ' ').toUpperCase();
            document.getElementById('programTitle').textContent = `${firstSemester.track.replace(/-/g, ' ').toUpperCase()}`;
        }

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
        content.innerHTML = '';
        const semesters = programData.filter(s => s.year === year);

        semesters.forEach(semester => {
            const semesterDiv = document.createElement('div');
            semesterDiv.className = 'semester-container';
            const totalCredits = semester.units.reduce((sum, unit) => sum + unit.credit, 0);
            const totalCoef = semester.units.reduce((sum, unit) => sum + unit.Coefficients, 0);

            const unitsHtml = semester.units.map(unit => {
                const subjectsHtml = unit.subjects.map(subject => `<div class="subject-item"><div class="subject-name">${subject.name}</div><div class="subject-detail"><span class="subject-label">Credit</span><span class="subject-value">${subject.credit}</span></div><div class="subject-detail"><span class="subject-label">Coef.</span><span class="subject-value">${subject.coef}</span></div><div class="subject-assessment">${subject.continuous ? `<span>CC: ${(subject.continuous * 100)}%</span>` : ''} ${subject.exam ? `<span>Exam: ${(subject.exam * 100)}%</span>` : ''}</div></div>`).join('');
                return `<div class="unit-card"><div class="unit-header"><div class="unit-code">${unit.code}</div><div class="unit-stats"><div class="stat-badge"><span class="stat-value">${unit.credit}</span><span class="stat-label">Credits</span></div><div class="stat-badge"><span class="stat-value">${unit.Coefficients}</span><span class="stat-label">Coef.</span></div></div></div><div class="subjects-list">${subjectsHtml}</div></div>`;
            }).join('');

            semesterDiv.innerHTML = `<div class="semester-header"><div class="semester-title">Semestre ${semester.semester}</div><div class="semester-info">${totalCredits} Crédits • ${totalCoef} Coefficients • ${semester.units.length} Unités</div></div><div class="units-grid">${unitsHtml}</div>`;
            content.appendChild(semesterDiv);
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;
    if (path === '/' ) {
        UniversityApp.initIndexPage();
    } 
    else if (path === '/majors') {
        UniversityApp.initMajorsPage();
    } 
    else if (path === '/program') {
        UniversityApp.initProgramPage();
    }
});
