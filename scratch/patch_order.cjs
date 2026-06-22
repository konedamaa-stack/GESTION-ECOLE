const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const empruntsMarkerStart = "{/* EMPRUNTS SECTION */}";
const empruntsMarkerEnd = "{/* END EMPRUNTS SECTION */}";

const startIdx = content.indexOf(empruntsMarkerStart);
const endIdx = content.indexOf(empruntsMarkerEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const fullEndIdx = endIdx + empruntsMarkerEnd.length;
  // Extract the block including newlines
  const empruntsBlock = content.slice(startIdx, fullEndIdx) + "\n";
  
  // Remove the block from its current position
  content = content.slice(0, startIdx) + content.slice(fullEndIdx);
  
  // Find where to insert it: at the end of renderDepenses
  // renderDepenses ends with:
  //       </div>
  //     </div>
  //   );
  
  const endRenderDepenses = "      </div>\n    </div>\n  );";
  const insertIdx = content.indexOf(endRenderDepenses);
  
  if (insertIdx !== -1) {
    // Insert before the closing tags of renderDepenses
    content = content.slice(0, insertIdx) + empruntsBlock + endRenderDepenses + content.slice(insertIdx + endRenderDepenses.length);
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log("Moved Emprunts section below Dépenses!");
  } else {
    console.log("Failed to find end of renderDepenses");
  }
} else {
  console.log("Failed to find EMPRUNTS SECTION boundaries");
}
