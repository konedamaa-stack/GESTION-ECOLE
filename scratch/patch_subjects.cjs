const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add customSubjects state
code = code.replace(
  'const [classSubjectsData, setClassSubjectsData] = useState<any[]>([]);',
  'const [classSubjectsData, setClassSubjectsData] = useState<any[]>([]);\n  const [customSubjects, setCustomSubjects] = useState<string[]>([]);'
);

// 2. Define allSubjects around line 980 (before renderDashboard)
const allSubjectsLogic = `
  const defaultSubjects = ["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique", "Espagnol", "Allemand", "Arts Plastiques", "Éducation Musicale"];
  const allSubjects = Array.from(new Set([
    ...defaultSubjects,
    ...customSubjects,
    ...classSubjectsData.map(cs => cs.subject),
    ...teachersData.flatMap(t => t.subject ? t.subject.split(',').map((s) => s.trim()) : [])
  ])).filter(Boolean).sort();
  
  const renderDashboard`;

code = code.replace('const renderDashboard', allSubjectsLogic);

// 3. Replace the array in handleSaveCoefficients
const standardSubjectsArr = 'const standardSubjects = ["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique", "Espagnol", "Allemand", "Arts Plastiques", "Éducation Musicale"];';
code = code.replace(standardSubjectsArr, 'const standardSubjects = allSubjects;');

// 4. Replace the array in checkboxes
code = code.replace(
  '{["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique", "Espagnol", "Allemand", "Arts Plastiques", "Éducation Musicale"].map(subj => (',
  '{allSubjects.map(subj => ('
);

// 5. Replace the array in coefficients modal
code = code.replace(
  '{["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique", "Espagnol", "Allemand", "Arts Plastiques", "Éducation Musicale"].map(subj => {',
  '{allSubjects.map(subj => {'
);

// 6. Replace select options in schedule modal
const selectRegex = /<select name="subject" className="form-input" required>(?:[\s\S]*?)<\/select>/g;
code = code.replace(selectRegex, (match) => {
  if (match.includes('option value="Mathématiques"')) {
    return `<select name="subject" className="form-input" required>\n  <option value="">Sélectionnez une matière</option>\n  {allSubjects.map(subj => (\n    <option key={subj} value={subj}>{subj}</option>\n  ))}\n</select>`;
  }
  return match;
});

// 7. Add custom subject input below checkboxes
const smallText = '<small style={{color: \'#64748b\', fontSize: \'0.8rem\'}}>Vous pouvez cocher plusieurs matières.</small>';
const customInputHTML = `
  <div style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
    <input type="text" className="form-input" placeholder="Ajouter une autre matière..." id="customSubjectInput" onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.currentTarget.value.trim();
        if (val && !allSubjects.includes(val)) {
          setCustomSubjects([...customSubjects, val]);
        }
        e.currentTarget.value = '';
      }
    }} />
    <button type="button" className="btn btn-primary" onClick={() => {
      const input = document.getElementById('customSubjectInput');
      const val = input ? input.value.trim() : '';
      if (val && !allSubjects.includes(val)) {
        setCustomSubjects([...customSubjects, val]);
      }
      if(input) input.value = '';
    }}>Ajouter</button>
  </div>
`;
code = code.replace(smallText, smallText + customInputHTML);

fs.writeFileSync('src/App.tsx', code);
console.log('Script executed');
