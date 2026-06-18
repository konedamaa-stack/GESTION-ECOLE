const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

content = content.replace(/\r\n/g, '\n');
let changed = false;

// 1. Add state
const findState = "const [selectedClassFilter, setSelectedClassFilter] = useState('all');";
if (content.includes(findState)) {
    const replaceState = `const [selectedClassFilter, setSelectedClassFilter] = useState('all');\n  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Inscrit');`;
    content = content.replace(findState, replaceState);
    changed = true;
    console.log("State added");
}

// 2. Modify filteredStudents logic
const findFilterLogic = `    const filteredStudents = studentsData.filter(s => {
      const matchQuery = (s.first_name + ' ' + s.last_name + ' ' + s.matricule).toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClassFilter === 'all' || s.class_id === selectedClassFilter;
      return matchQuery && matchClass;
    });`;
if (content.includes(findFilterLogic)) {
    const replaceFilterLogic = `    const filteredStudents = studentsData.filter(s => {
      const matchQuery = (s.first_name + ' ' + s.last_name + ' ' + s.matricule).toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClassFilter === 'all' || s.class_id === selectedClassFilter;
      const matchStatus = selectedStatusFilter === 'all' || (s.status || 'Inscrit') === selectedStatusFilter;
      return matchQuery && matchClass && matchStatus;
    });`;
    content = content.replace(findFilterLogic, replaceFilterLogic);
    changed = true;
    console.log("Filter logic updated");
}

// 3. Add dropdown UI
const findUI = `            <select 
              className="form-select" 
              value={selectedClassFilter} 
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              style={{width: '200px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px'}}
            >
              <option value="all">Toutes les classes</option>`;
if (content.includes(findUI)) {
    const replaceUI = `            <select 
              className="form-select" 
              value={selectedStatusFilter} 
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{width: '180px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px'}}
            >
              <option value="Inscrit">Actifs (Inscrits)</option>
              <option value="Ancien élève">Anciens élèves</option>
              <option value="Inactif">Inactifs</option>
              <option value="Renvoyé">Renvoyés</option>
              <option value="all">Tous les statuts</option>
            </select>
            <select 
              className="form-select" 
              value={selectedClassFilter} 
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              style={{width: '200px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px'}}
            >
              <option value="all">Toutes les classes</option>`;
    content = content.replace(findUI, replaceUI);
    changed = true;
    console.log("UI updated");
}

if (changed) {
    fs.writeFileSync(targetFile, content);
    console.log("Done");
} else {
    console.log("Nothing changed");
}
