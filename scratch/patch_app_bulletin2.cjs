const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add bulletinGrades state
const stateInsertion = `
  const [bulletinGrades, setBulletinGrades] = useState<any[]>([]);
  
  const loadBulletinData = async (classId: string, period: string) => {
    setBulletinClassId(classId);
    setBulletinPeriod(period);
    setActiveModal('bulletin_preview');
    const evals = evaluationsData.filter(e => e.class_id === classId && e.period === period);
    const evalIds = evals.map(e => e.id);
    if(evalIds.length > 0) {
      const { data } = await supabase.from('grades').select('*').in('evaluation_id', evalIds);
      if(data) setBulletinGrades(data);
    } else {
      setBulletinGrades([]);
    }
  };
`;
content = content.replace(
  "const [bulletinPeriod, setBulletinPeriod] = useState<string>('1er Trimestre');",
  "const [bulletinPeriod, setBulletinPeriod] = useState<string>('1er Trimestre');\n" + stateInsertion
);

// 2. Fix the onClick of the Apercu button
content = content.replace(
  `onClick={() => { setBulletinClassId(row.id); setBulletinPeriod('1er Trimestre'); setActiveModal('bulletin_preview'); }}`,
  `onClick={() => loadBulletinData(row.id, '1er Trimestre')}`
);

// 3. Fix the onChange of the period select
content = content.replace(
  `value={bulletinPeriod} onChange={(e) => setBulletinPeriod(e.target.value)}`,
  `value={bulletinPeriod} onChange={(e) => loadBulletinData(bulletinClassId!, e.target.value)}`
);

// 4. Fix gradesData prop in BulletinPreview
content = content.replace(
  `grades={gradesData}`,
  `grades={bulletinGrades}`
);

fs.writeFileSync(appPath, content);
console.log("App.tsx fixed");
