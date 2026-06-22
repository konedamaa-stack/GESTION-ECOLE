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
  if (content.charAt(fullEndIdx + 1) === '\n') blockLength += 1; // \r\n
  
  const empruntsBlock = content.slice(startIdx, fullEndIdx);
  
  // Remove the block from its current position
  content = content.slice(0, startIdx) + content.slice(fullEndIdx);
  
  // Find where to insert it: right before "const renderRH"
  const renderRHMarker = "const renderRH = () =>";
  const insertIdx = content.indexOf(renderRHMarker);
  
  if (insertIdx !== -1) {
    // We want to insert it after the end of renderDepenses which is just before renderRH
    content = content.slice(0, insertIdx) + empruntsBlock + "\n\n  " + content.slice(insertIdx);
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log("Moved Emprunts section below Dépenses!");
  } else {
    console.log("Failed to find renderRH");
  }
} else {
  console.log("Failed to find EMPRUNTS SECTION boundaries");
}
