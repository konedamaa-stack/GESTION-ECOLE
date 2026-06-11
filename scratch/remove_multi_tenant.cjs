const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove .eq('school_id', currentSchoolId) or .eq('school_id', schoolId)
  content = content.replace(/\.eq\('school_id',\s*(currentSchoolId|schoolId)\)/g, '');
  
  // Remove school_id: currentSchoolId,
  content = content.replace(/school_id:\s*currentSchoolId,?\n?\s*/g, '');
  
  // Remove school_id: schoolId,
  content = content.replace(/school_id:\s*schoolId,?\n?\s*/g, '');
  
  // Remove school_id: session.school_id,
  content = content.replace(/school_id:\s*session\.school_id,?\n?\s*/g, '');
  
  // Remove school_id: newSchool.id
  content = content.replace(/school_id:\s*newSchool\.id,?\n?\s*/g, '');
  
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned ${filePath}`);
}

const baseDir = path.join(__dirname, '../src');
cleanFile(path.join(baseDir, 'App.tsx'));
cleanFile(path.join(baseDir, 'components/StudentPortal.tsx'));
cleanFile(path.join(baseDir, 'components/TeacherPortal.tsx'));
