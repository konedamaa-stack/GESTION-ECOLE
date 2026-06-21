const fs = require('fs');
const path = require('path');

let appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');

// 1. Add bulletinTargetStudentId state
if(!appCode.includes('const [bulletinTargetStudentId')) {
  appCode = appCode.replace('const [bulletinClassId, setBulletinClassId] = useState<string | null>(null);',
    'const [bulletinClassId, setBulletinClassId] = useState<string | null>(null);\n  const [bulletinTargetStudentId, setBulletinTargetStudentId] = useState<string | null>(null);');
}

// 2. Modify loadBulletinData to accept studentId optionally
appCode = appCode.replace(
  'const loadBulletinData = async (classId: string, period: string) => {',
  'const loadBulletinData = async (classId: string, period: string, studentId: string | null = null) => {'
);
appCode = appCode.replace(
  'setBulletinPeriod(period);',
  'setBulletinPeriod(period);\n    setBulletinTargetStudentId(studentId);'
);

// 3. Update BulletinPreview usage in App.tsx
appCode = appCode.replace(
  'classSubjects={classSubjectsData}',
  'classSubjects={classSubjectsData}\n                      targetStudentId={bulletinTargetStudentId}'
);

// 4. Update TeacherPortal and CommitteePortal renderings
appCode = appCode.replace(
  '<TeacherPortal session={teacherSession} onLogout={() => setTeacherSession(null)} />',
  '<TeacherPortal session={teacherSession} onLogout={() => setTeacherSession(null)} onOpenBulletin={(studentId, period, classId) => loadBulletinData(classId, period, studentId)} />'
);
appCode = appCode.replace(
  '<CommitteePortal session={committeeSession} onLogout={() => setCommitteeSession(null)} />',
  '<CommitteePortal session={committeeSession} onLogout={() => setCommitteeSession(null)} onOpenBulletin={(studentId, period, classId) => loadBulletinData(classId, period, studentId)} />'
);

fs.writeFileSync(appPath, appCode);

// 5. Update TeacherPortal.tsx
let tpPath = path.join(__dirname, '../src/components/TeacherPortal.tsx');
let tpCode = fs.readFileSync(tpPath, 'utf8');
tpCode = tpCode.replace(
  'export default function TeacherPortal({ session, onLogout }: { session: any, onLogout: () => void }) {',
  'export default function TeacherPortal({ session, onLogout, onOpenBulletin }: { session: any, onLogout: () => void, onOpenBulletin?: (studentId: string, period: string, classId: string) => void }) {'
);
tpCode = tpCode.replace(
  'onClick={() => generatePDF(student, \'Trimestre 1\')}>T1</button>',
  'onClick={() => onOpenBulletin ? onOpenBulletin(student.id, \'1er Trimestre\', student.class_id) : generatePDF(student, \'Trimestre 1\')}>T1</button>'
);
tpCode = tpCode.replace(
  'onClick={() => generatePDF(student, \'Trimestre 2\')}>T2</button>',
  'onClick={() => onOpenBulletin ? onOpenBulletin(student.id, \'2ème Trimestre\', student.class_id) : generatePDF(student, \'Trimestre 2\')}>T2</button>'
);
tpCode = tpCode.replace(
  'onClick={() => generatePDF(student, \'Trimestre 3\')}>T3</button>',
  'onClick={() => onOpenBulletin ? onOpenBulletin(student.id, \'3ème Trimestre\', student.class_id) : generatePDF(student, \'Trimestre 3\')}>T3</button>'
);
fs.writeFileSync(tpPath, tpCode);

// 6. Update CommitteePortal.tsx
let cpPath = path.join(__dirname, '../src/components/CommitteePortal.tsx');
let cpCode = fs.readFileSync(cpPath, 'utf8');
cpCode = cpCode.replace(
  'export default function CommitteePortal({ session, onLogout }: { session: any; onLogout: () => void }) {',
  'export default function CommitteePortal({ session, onLogout, onOpenBulletin }: { session: any; onLogout: () => void; onOpenBulletin?: (studentId: string, period: string, classId: string) => void }) {'
);
cpCode = cpCode.replace(
  'onClick={() => generatePDF(student, \'Trimestre 1\')}>T1</button>',
  'onClick={() => onOpenBulletin ? onOpenBulletin(student.id, \'1er Trimestre\', student.class_id) : generatePDF(student, \'Trimestre 1\')}>T1</button>'
);
cpCode = cpCode.replace(
  'onClick={() => generatePDF(student, \'Trimestre 2\')}>T2</button>',
  'onClick={() => onOpenBulletin ? onOpenBulletin(student.id, \'2ème Trimestre\', student.class_id) : generatePDF(student, \'Trimestre 2\')}>T2</button>'
);
cpCode = cpCode.replace(
  'onClick={() => generatePDF(student, \'Trimestre 3\')}>T3</button>',
  'onClick={() => onOpenBulletin ? onOpenBulletin(student.id, \'3ème Trimestre\', student.class_id) : generatePDF(student, \'Trimestre 3\')}>T3</button>'
);
fs.writeFileSync(cpPath, cpCode);

console.log("Patch applied successfully.");
