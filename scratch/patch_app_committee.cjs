const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for CommitteePortal
content = content.replace(
  `import TeacherPortal from './components/TeacherPortal';`,
  `import TeacherPortal from './components/TeacherPortal';\nimport CommitteePortal from './components/CommitteePortal';`
);

// 2. Add committeeSession state
content = content.replace(
  `  const [teacherSession, setTeacherSession] = useState<any>(null);`,
  `  const [teacherSession, setTeacherSession] = useState<any>(null);\n  const [committeeSession, setCommitteeSession] = useState<any>(null);`
);

// 3. Add onCommitteeLogin handler
content = content.replace(
  `<Auth onStudentLogin={(s) => setStudentSession(s)} onTeacherLogin={(t) => setTeacherSession(t)} onBack={() => setCurrentView('landing')} />`,
  `<Auth onStudentLogin={(s) => setStudentSession(s)} onTeacherLogin={(t) => setTeacherSession(t)} onCommitteeLogin={(c) => setCommitteeSession(c)} onBack={() => setCurrentView('landing')} />`
);

// 4. Render CommitteePortal
content = content.replace(
  `  if (teacherSession) {`,
  `  if (committeeSession) {\n    return <CommitteePortal session={committeeSession} onLogout={() => setCommitteeSession(null)} />;\n  }\n\n  if (teacherSession) {`
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated with committeeSession logic');
