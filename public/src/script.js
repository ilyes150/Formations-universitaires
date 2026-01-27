// University Website - Main JavaScript

// University data - Fields and Majors
const universityData = {
    "fields": [
        {"code": "ST", "majors": ["Genie Minier", "Automatique", "Hydrocarbures", "Metallurgie", "Genie Civil", "Aeronautique", "Electromecanique", "Genie Des Procedes", "Energies Renouvelables", "Genie Maritime", "Genie Industriel", "Genie Mecanique", "Electronique", "Electrotechnique", "Telecommunications", "Genie Climatique", "Genie Biomedical", "Architecture", "Genie De L'Eau", "Travaux Publics", "Hydraulique", "Machines Hydrauliques"]},
        {"code": "SM", "majors": ["Chimie", "Physique"]},
        {"code": "MI", "majors": ["Mathematiques", "Informatique", "mathématiques appliquées"]},
        {"code": "SNV", "majors": ["Biologie", "Ecologie Et Environnement", "Sciences Alimentaires", "Biotechnologie", "Agronomie", "Biochimie"]},
        {"code": "STU", "majors": ["Gestion Des Techniques Urbaines", "Urbanisme", "Transport"]},
        {"code": "SEGC", "majors": ["Sciences Commerciales", "Sciences De Gestion", "Sciences Economiques", "Sciences Financieres Et Comptabilite"]},
        {"code": "DSP", "majors": ["Sciences Politiques", "Relations Internationales"]},
        {"code": "LLE", "majors": ["Langue Française", "Langue Anglaise", "Langue Espagnole", "Langue Allemande", "Langue Russe", "Langue Turque", "Langue Italienne", "Langue Portugaise", "Didactique"]},
        {"code": "SHS", "majors": ["Histoire", "Philosophie", "Sociologie", "Psychologie", "Orthophonie", "Biblioteconomie", "Anthropologie", "Archeologie", "Demographie", "Sciences De L'Information Et Communication", "Traduction", "Interpretation", "Sciences De L'Éducation", "Sciences Humaines"]},
        {"code": "STAPS", "majors": ["Entrainement Sportif", "Management Sportif", "Activite Physique Adaptee", "Education Motrice", "Entrainement Sportif D'Elite"]},
        {"code": "ART", "majors": ["Arts Plastiques", "Musique"]},
        {"code": "LLA", "majors": ["Langues Amazighes", "Culture Amazighe", "Traduction Amazighe"]},
        {"code": "LCA", "majors": ["Charia", "Langue Arabe", "Civilisation Islamique"]},
        {"code": "AUMV", "majors": ["Veterinaire", "Apiculture", "Forets", "Agronomie Saharienne", "Agroalimentaire"]},
        {"code": "SS", "majors": ["Sciences Sociales", "Travail Et Techniques De Planification"]},
        {"code": "SVET", "majors": ["Sciences Et Techniques"]},
        {"code": "SMED", "majors": ["Medecine", "Pharmacie", "Chirurgie Dentaire"]}
    ]
};

// Store data in localStorage for cross-page access
localStorage.setItem('universityData', JSON.stringify(universityData));

// Page-specific functions
const UniversityApp = {
    
    // === INDEX PAGE (Fields) ===
    initIndexPage: function() {
        const fieldsGrid = document.getElementById('fieldsGrid');
        const searchInput = document.getElementById('searchInput');
        const emptyState = document.getElementById('emptyState');

        if (!fieldsGrid) return;

        this.renderFields(universityData.fields, fieldsGrid, emptyState);

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                
                if (searchTerm === '') {
                    this.renderFields(universityData.fields, fieldsGrid, emptyState);
                    return;
                }
                
                const filteredFields = universityData.fields.filter(field => 
                    field.code.toLowerCase().includes(searchTerm)
                );
                
                this.renderFields(filteredFields, fieldsGrid, emptyState);
            });
        }
    },

    renderFields: function(fields, container, emptyState) {
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
            
            fieldCard.innerHTML = `
                <div class="field-code">${field.code}</div>
                <div class="field-count">
                    ${field.majors.length} filière${field.majors.length > 1 ? 's' : ''}
                    <span class="field-arrow">→</span>
                </div>
            `;
            
            container.appendChild(fieldCard);
        });
    },

    // === MAJORS PAGE ===
    initMajorsPage: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const fieldCode = urlParams.get('field');
        
        const data = JSON.parse(localStorage.getItem('universityData'));
        
        if (!data || !fieldCode) {
            window.location.href = 'index.html';
            return;
        }

        const field = data.fields.find(f => f.code === fieldCode);

        if (!field) {
            window.location.href = 'index.html';
            return;
        }

        // Update page metadata
        document.getElementById('breadcrumbField').textContent = field.code;
        document.getElementById('fieldTitle').textContent = `Domaine ${field.code}`;
        document.getElementById('fieldSubtitle').textContent = `${field.majors.length} filière${field.majors.length > 1 ? 's' : ''} disponible${field.majors.length > 1 ? 's' : ''}`;

        const majorsGrid = document.getElementById('majorsGrid');
        const noteBox = document.getElementById('noteBox');

        // Check if using old structure (strings) or new structure (objects)
        const isOldStructure = typeof field.majors[0] === 'string';

        if (isOldStructure && noteBox) {
            noteBox.style.display = 'block';
        }

        this.renderMajors(field, majorsGrid, isOldStructure);
    },

    renderMajors: function(field, container, isOldStructure) {
        field.majors.forEach((major) => {
            const majorCard = document.createElement('div');
            majorCard.className = 'major-card';

            if (isOldStructure) {
                // Check if this is Informatique in MI field - only one with program
                const hasProgram = (field.code === 'MI' && major === 'Informatique');
                
                majorCard.innerHTML = `
                    <div class="major-header">
                        <div class="major-name">${major}</div>
                        <div class="major-info">Filière</div>
                    </div>
                    <div class="formations-list">
                        <div class="formation-item ${hasProgram ? '' : 'no-program'}">
                            <div class="formation-header">
                                <div class="formation-type">${hasProgram ? 'Tronc Commun' : 'Programme'}</div>
                                <div class="formation-badge ${hasProgram ? '' : 'coming-soon'}">${hasProgram ? 'Ingénieur' : 'À venir'}</div>
                            </div>
                            ${hasProgram ? `<a href="program.html?path=MI/informatique/ingenieur/tronc-commun" class="program-link">Voir le programme →</a>` : ''}
                        </div>
                    </div>
                `;
            } else {
                // Future structure with formations and specialties
                const formationsList = major.formations.map(formation => {
                    return `
                        <div class="formation-item">
                            <div class="formation-header">
                                <div class="formation-type">${formation.type}</div>
                                <div class="formation-badge">${formation.specialties.length} spécialité${formation.specialties.length > 1 ? 's' : ''}</div>
                            </div>
                            <a href="program.html?path=${encodeURIComponent(formation.programPath)}" class="program-link">
                                Voir le programme →
                            </a>
                        </div>
                    `;
                }).join('');

                majorCard.innerHTML = `
                    <div class="major-header">
                        <div class="major-name">${major.name}</div>
                        <div class="major-info">${major.formations.length} formation${major.formations.length > 1 ? 's' : ''}</div>
                    </div>
                    <div class="formations-list">
                        ${formationsList}
                    </div>
                `;
            }

            container.appendChild(majorCard);
        });
    },

    // === PROGRAM PAGE ===
    initProgramPage: async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const programPath = urlParams.get('path');

        if (!programPath) {
            window.location.href = 'index.html';
            return;
        }

        try {
            // Load program data from JSON file
            const response = await fetch(`../data/${programPath}.json`);
            if (!response.ok) throw new Error('Program not found');
            
            const programData = await response.json();
            
            this.renderProgram(programData);
        } catch (error) {
            console.error('Error loading program:', error);
            document.querySelector('.container').innerHTML = `
                <div class="empty-state show">
                    <div class="empty-icon">❌</div>
                    <div class="empty-text">Programme introuvable</div>
                </div>
            `;
        }
    },

    renderProgram: function(programData) {
        // Set page metadata
        if (programData.length > 0) {
            document.getElementById('systemValue').textContent = programData[0].system.toUpperCase();
            document.getElementById('trackValue').textContent = programData[0].track.replace('-', ' ').toUpperCase();
            document.getElementById('programTitle').textContent = `${programData[0].track.replace('-', ' ').toUpperCase()} - ${programData[0].system.toUpperCase()}`;
        }

        // Get unique years
        const years = [...new Set(programData.map(s => s.year))].sort();
        let currentYear = years[0];

        // Create year selector
        const yearSelector = document.getElementById('yearSelector');
        yearSelector.innerHTML = '';
        
        years.forEach(year => {
            const btn = document.createElement('button');
            btn.className = 'year-btn';
            btn.textContent = `Year ${year}`;
            if (year === currentYear) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                currentYear = year;
                document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderSemesters(programData, currentYear);
            });
            
            yearSelector.appendChild(btn);
        });

        // Initial render
        this.renderSemesters(programData, currentYear);
    },

    renderSemesters: function(programData, year) {
        const content = document.getElementById('programContent');
        content.innerHTML = '';

        const semesters = programData.filter(s => s.year === year);

        semesters.forEach(semester => {
            const semesterDiv = document.createElement('div');
            semesterDiv.className = 'semester-container';

            const totalCredits = semester.units.reduce((sum, unit) => sum + unit.credit, 0);
            const totalCoef = semester.units.reduce((sum, unit) => sum + unit.Coefficients, 0);

            const unitsHtml = semester.units.map(unit => {
                const subjectsHtml = unit.subjects.map(subject => `
                    <div class="subject-item">
                        <div class="subject-name">${subject.name}</div>
                        <div class="subject-detail">
                            <span class="subject-label">Credit</span>
                            <span class="subject-value">${subject.credit}</span>
                        </div>
                        <div class="subject-detail">
                            <span class="subject-label">Coef.</span>
                            <span class="subject-value">${subject.coef}</span>
                        </div>
                        <div class="subject-assessment">
                            ${subject.continuous ? `<span>CC: ${(subject.continuous * 100)}%</span>` : ''}
                            ${subject.exam ? `<span>Exam: ${(subject.exam * 100)}%</span>` : ''}
                        </div>
                    </div>
                `).join('');

                return `
                    <div class="unit-card">
                        <div class="unit-header">
                            <div class="unit-code">${unit.code}</div>
                            <div class="unit-stats">
                                <div class="stat-badge">
                                    <span class="stat-value">${unit.credit}</span>
                                    <span class="stat-label">Credits</span>
                                </div>
                                <div class="stat-badge">
                                    <span class="stat-value">${unit.Coefficients}</span>
                                    <span class="stat-label">Coef.</span>
                                </div>
                            </div>
                        </div>
                        <div class="subjects-list">
                            ${subjectsHtml}
                        </div>
                    </div>
                `;
            }).join('');

            semesterDiv.innerHTML = `
                <div class="semester-header">
                    <div class="semester-title">Semester ${semester.semester}</div>
                    <div class="semester-info">${totalCredits} Credits • ${totalCoef} Coefficients • ${semester.units.length} Units</div>
                </div>
                <div class="units-grid">
                    ${unitsHtml}
                </div>
            `;

            content.appendChild(semesterDiv);
        });
    }
};

// Initialize appropriate page
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path.endsWith('/')) {
        UniversityApp.initIndexPage();
    } else if (path.includes('majors.html')) {
        UniversityApp.initMajorsPage();
    } else if (path.includes('program.html')) {
        UniversityApp.initProgramPage();
    }
});

