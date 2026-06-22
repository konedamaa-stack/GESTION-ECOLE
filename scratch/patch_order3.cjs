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
  // Extract the block including the following newline
  let blockLength = fullEndIdx - startIdx;
  if (content.charAt(fullEndIdx) === '\r') blockLength += 1;
  if (content.charAt(fullEndIdx) === '\n') blockLength += 1;
  if (content.charAt(fullEndIdx + 1) === '\n') blockLength += 1;
  
  const empruntsBlock = content.slice(startIdx, fullEndIdx);
  
  // Remove the block from its current position
  content = content.slice(0, startIdx) + content.slice(fullEndIdx);
  
  // Now we find the end of renderDepenses where the `</div>\n  );` is.
  // Wait, let's find `  const renderRH = () =>` and go backward to `    </div>\n  );`
  
  const renderRHMarker = "const renderRH = () =>";
  const insertIdx = content.indexOf(renderRHMarker);
  
  if (insertIdx !== -1) {
    // We want to insert inside the div.
    // The previous text is:
    //       </div>
    //     </div>
    //   );
    // Let's replace `    </div>\r\n  );` with `      {empruntsBlock}\n    </div>\n  );`
    
    // We can do this with a replace targeting the space before renderRH
    // It's safer to just look backwards from insertIdx for `</div>`
    
    const blockBeforeRH = content.slice(0, insertIdx);
    const lastClosingDiv = blockBeforeRH.lastIndexOf('</div>');
    
    if (lastClosingDiv !== -1) {
      content = content.slice(0, lastClosingDiv) + "\n      " + empruntsBlock + "\n    " + content.slice(lastClosingDiv);
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log("Moved Emprunts inside renderDepenses!");
    } else {
      console.log("Failed to find closing div");
    }
  } else {
    console.log("Failed to find renderRH");
  }
} else {
  console.log("Failed to find EMPRUNTS SECTION boundaries");
}
