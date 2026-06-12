const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

const loadGlobalGradesReplacement = `
  const loadGlobalGrades = async (classId: string, period: string) => {
    const evals = evaluationsData.filter(e => e.class_id === classId && e.period === period && e.type === "Moyenne Globale");
    const evalIds = evals.map(e => e.id);
    
    let relevantGrades: any[] = [];
    if(evalIds.length > 0) {
      const { data } = await supabase.from('grades').select('*').in('evaluation_id', evalIds);
      if(data) relevantGrades = data;
    }
    
    const initialGrades: any = {};
    relevantGrades.forEach(g => {
      const ev = evals.find(e => e.id === g.evaluation_id);
      if(ev && g.score !== null) {
        initialGrades[\`\${g.student_id}_\${ev.subject}\`] = g.score.toString();
      }
    });
    setGlobalGrades(initialGrades);
  };
`;

content = content.replace(/const loadGlobalGrades = async \([\s\S]*?setGlobalGrades\(initialGrades\);\n  };/, loadGlobalGradesReplacement.trim());

content = content.replace("fetchGrades();", "");
content = content.replace("<Icons.Edit />", "<Icons.FileText />");

fs.writeFileSync(appPath, content);
console.log("Global grades fix applied.");
