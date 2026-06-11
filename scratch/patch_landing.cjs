const fs = require('fs');
const path = require('path');

// 1. Patch App.tsx
const appFile = path.join(__dirname, '../src/App.tsx');
let appContent = fs.readFileSync(appFile, 'utf8');

if (!appContent.includes("import { LandingPage }")) {
  appContent = appContent.replace(
    "import Auth from './components/Auth';",
    "import { LandingPage } from './components/LandingPage';\nimport Auth from './components/Auth';"
  );
}

if (!appContent.includes("currentView, setCurrentView")) {
  appContent = appContent.replace(
    "function App() {",
    "function App() {\n  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');"
  );
}

const authRenderMatch = /if \(!session && !studentSession && !teacherSession\) \{\s*return <Auth[^>]*\/>;\s*\}/;
if (appContent.match(authRenderMatch)) {
  const landingLogic = `if (currentView === 'landing' && !session && !studentSession && !teacherSession) {
    return <LandingPage onLoginClick={() => setCurrentView('app')} />;
  }

  if (!session && !studentSession && !teacherSession) {
    return <Auth onStudentLogin={(s) => setStudentSession(s)} onTeacherLogin={(t) => setTeacherSession(t)} onBack={() => setCurrentView('landing')} />;
  }`;
  appContent = appContent.replace(authRenderMatch, landingLogic);
}

fs.writeFileSync(appFile, appContent);

// 2. Patch Auth.tsx
const authFile = path.join(__dirname, '../src/components/Auth.tsx');
let authContent = fs.readFileSync(authFile, 'utf8');

if (!authContent.includes("onBack?: () => void;")) {
  authContent = authContent.replace(
    "interface AuthProps {",
    "interface AuthProps {\n  onBack?: () => void;"
  );
}

if (!authContent.includes("onBack })")) {
  authContent = authContent.replace(
    "const Auth: React.FC<AuthProps> = ({ onStudentLogin, onTeacherLogin }) => {",
    "const Auth: React.FC<AuthProps> = ({ onStudentLogin, onTeacherLogin, onBack }) => {"
  );
  authContent = authContent.replace(
    "const Auth: React.FC<AuthProps> = ({ onLogin, onStudentLogin, onTeacherLogin }) => {",
    "const Auth: React.FC<AuthProps> = ({ onLogin, onStudentLogin, onTeacherLogin, onBack }) => {"
  );
}

const loginHeaderMatch = /<div className="login-header">\s*<h2[^>]*>.*?<\/h2>\s*<p[^>]*>.*?<\/p>\s*<\/div>/s;
if (authContent.match(loginHeaderMatch)) {
  const replacement = `${authContent.match(loginHeaderMatch)[0]}
        {onBack && (
          <button 
            onClick={onBack}
            style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto 1.5rem', fontSize: '0.9rem'}}
          >
            ← Retour à l'accueil
          </button>
        )}`;
  if (!authContent.includes("← Retour à l'accueil")) {
    authContent = authContent.replace(loginHeaderMatch, replacement);
  }
}

fs.writeFileSync(authFile, authContent);

console.log("Patched App.tsx and Auth.tsx successfully.");
