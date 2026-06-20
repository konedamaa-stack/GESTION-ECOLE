const fs = require('fs');
const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const targetContent = `      } catch (error: any) {
        alert("Erreur: " + error.message);
      }
    };
  
  const handleDocumentUpload = async (e: React.FormEvent<HTMLFormElement>) => {`;

const newContent = `      } catch (error: any) {
        alert("Erreur: " + error.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.innerHTML === 'Patientez...' && originalText) {
            submitBtn.innerHTML = originalText;
          }
        }
      }
    };
  
  const handleDocumentUpload = async (e: React.FormEvent<HTMLFormElement>) => {`;

if (content.includes(targetContent)) {
    content = content.replace(targetContent, newContent);
    fs.writeFileSync(appPath, content);
    console.log("Patched finally successfully.");
} else {
    // try slightly different indentation
    const targetContent2 = `    } catch (error: any) {
      alert("Erreur: " + error.message);
    }
  };

  const handleDocumentUpload`;
    
    // just use a regex to find catch block before handleDocumentUpload
    const regex = /catch\s*\(\s*error:\s*any\s*\)\s*\{\s*alert\(\s*"Erreur:\s*"\s*\+\s*error\.message\s*\);\s*\}\s*\};\s*const\s+handleDocumentUpload/g;
    
    const replacement = \`catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.innerHTML === 'Patientez...' && originalText) {
          submitBtn.innerHTML = originalText;
        }
      }
    }
  };

  const handleDocumentUpload\`;

    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(appPath, content);
        console.log("Patched finally successfully using regex.");
    } else {
        console.error("Could not find the target block to patch!");
    }
}
