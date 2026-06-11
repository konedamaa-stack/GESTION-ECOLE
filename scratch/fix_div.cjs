const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

const endOfFileIndex = content.lastIndexOf('{/* School Creation Modal */}');
if (endOfFileIndex !== -1) {
  let startStr = content.substring(0, endOfFileIndex);
  
  // Look at the end of startStr
  // It ends with:
  //           </div>
  //       )}
  // 
  // We need to add the missing </div> that was deleted.
  // The correct sequence before School Creation Modal should be:
  //           </div>
  //         </div>
  //       )}
  
  const correctEnd = `            </div>\n          </div>\n        </div>\n      )}\n\n      {/* School Creation Modal */}`;
  content = content.replace(/(\s*)<\/div>\n\s*\)\}\n\n\s*\{\/\* School Creation Modal \*\/\}/, correctEnd);
  
  // ensure the very end is </div>\n  );\n}\n\nexport default App;\n
  const exportIdx = content.lastIndexOf('export default App;');
  content = content.substring(0, exportIdx).trim();
  if (content.endsWith(')}')) {
    content += '\n    </div>';
  } else if (!content.endsWith('</div>')) {
    content += '\n    </div>';
  }
  content += '\n  );\n}\n\nexport default App;\n';
  
  fs.writeFileSync(file, content);
  console.log('Fixed div');
}
