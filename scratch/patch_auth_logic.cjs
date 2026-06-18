const fs = require('fs');

let content = fs.readFileSync('src/components/Auth.tsx', 'utf8');

const oldAuthLogic = `      } else if (mode === 'login' || mode === 'committee_login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;`;

const newAuthLogic = `      } else if (mode === 'committee_login') {
        const { data: committee, error } = await supabase
          .from('committee_members')
          .select('*')
          .eq('email', email)
          .eq('password', password);
        
        if (error) throw error;
        if (!committee || committee.length === 0) {
          throw new Error(t('auth.invalid_credentials', "Email ou mot de passe incorrect."));
        }
        if (onCommitteeLogin) {
          onCommitteeLogin(committee[0]);
        }
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;`;

content = content.replace(oldAuthLogic, newAuthLogic);

// Add onCommitteeLogin to props
content = content.replace(
  `export default function Auth({ onStudentLogin, onTeacherLogin, onBack }: { onStudentLogin?: (student: any) => void, onTeacherLogin?: (teacher: any) => void, onBack?: () => void }) {`,
  `export default function Auth({ onStudentLogin, onTeacherLogin, onCommitteeLogin, onBack }: { onStudentLogin?: (student: any) => void, onTeacherLogin?: (teacher: any) => void, onCommitteeLogin?: (committee: any) => void, onBack?: () => void }) {`
);

fs.writeFileSync('src/components/Auth.tsx', content);
console.log('Auth.tsx updated with committee logic');
