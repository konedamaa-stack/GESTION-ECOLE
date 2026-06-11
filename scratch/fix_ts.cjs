const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix setParentsData / fetchParents
if (!content.includes('const fetchParents = async ()')) {
  content = content.replace(
    'const [parentsData, setParentsData] = useState<any[]>([]);', 
    `const [parentsData, setParentsData] = useState<any[]>([]);
  const fetchParents = async () => {
    const { data } = await supabase.from('parents').select('*').eq('school_id', currentSchoolId || '');
    if (data) setParentsData(data);
  };`
  );
}

// 2. Remove the typeof check that TypeScript hates
content = content.replace("if (typeof fetchParents === 'function') fetchParents();", "fetchParents();");

fs.writeFileSync(file, content);
console.log('Fixed TS');
