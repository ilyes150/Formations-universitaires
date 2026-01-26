# University Website - Complete System

## 📁 Folder Structure

```
university-website/
├── data/                           # JSON program files
│   └── MI/
│       └── informatique/
│           └── ingenieur/
│               └── tronc-commun.json
│
├── src/                            # JavaScript and CSS files
│   ├── app.js                      # Main application logic
│   └── styles.css                  # All styles
│
├── templates/                      # HTML template files
│   ├── index.html                  # Page 1: Fields
│   ├── majors.html                 # Page 2: Majors
│   └── program.html                # Page 3: Program details
│
└── README.md                       # This file
```

## 🚀 Getting Started

1. Copy all folders to your computer
2. Open `templates/index.html` in your browser
3. Navigate through the pages

For local server:
```bash
python -m http.server 8000
# Then open: http://localhost:8000/templates/
```

## 📄 Pages

1. **index.html** - All fields (ST, SHS, MI...)
2. **majors.html** - Majors for selected field
3. **program.html** - Program details from JSON

## 📂 Data Path Format

```
data/[FIELD]/[major]/[formation_type]/[program_name].json
```

Example: `data/MI/informatique/ingenieur/tronc-commun.json`

## 📝 Current Status

✅ Working: Informatique (MI) → Tronc Commun program
🔜 Add: Other majors and programs

See full documentation in this README for detailed instructions!
