const fs = require('fs');
const path = require('path');

// 1. Patch App.tsx
const appFile = path.join(__dirname, '../src/App.tsx');
let appContent = fs.readFileSync(appFile, 'utf8');

// The exact string to replace
const oldAuthRender = `  if (!session && !studentSession && !teacherSession) {
    return <Auth onStudentLogin={(s) => setStudentSession(s)} onTeacherLogin={(t) => setTeacherSession(t)} />;
  }`;

const newAuthRender = `  if (currentView === 'landing' && !session && !studentSession && !teacherSession) {
    return <LandingPage onLoginClick={() => setCurrentView('app')} />;
  }

  if (!session && !studentSession && !teacherSession) {
    return <Auth onStudentLogin={(s) => setStudentSession(s)} onTeacherLogin={(t) => setTeacherSession(t)} onBack={() => setCurrentView('landing')} />;
  }`;

if (appContent.includes(oldAuthRender)) {
  appContent = appContent.replace(oldAuthRender, newAuthRender);
  console.log("Successfully replaced auth render in App.tsx");
} else {
  console.log("Could not find the exact oldAuthRender string. Trying more generic replace...");
  const genericAuthRender = /if \(!session && !studentSession && !teacherSession\) \{\s*return <Auth[\s\S]*?\/>;\s*\}/;
  if (appContent.match(genericAuthRender)) {
    appContent = appContent.replace(genericAuthRender, newAuthRender);
    console.log("Successfully replaced auth render using regex.");
  } else {
    console.log("Failed to match auth render logic!");
  }
}

fs.writeFileSync(appFile, appContent);
