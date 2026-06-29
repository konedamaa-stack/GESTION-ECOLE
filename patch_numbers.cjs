
const fs = require("fs");
let code = fs.readFileSync("src/components/BulletinPreview.tsx", "utf8");

code = code.replace(/\{new Date\(\)\.getFullYear\(\) - 1\}/g, "{formatNum(new Date().getFullYear() - 1, 0)}");
code = code.replace(/\{new Date\(\)\.getFullYear\(\)\}/g, "{formatNum(new Date().getFullYear(), 0)}");
code = code.replace(/\{students\.length\}/g, "{formatNum(students.length, 0)}");
code = code.replace(/toLocaleDateString\(\)/g, "toLocaleDateString(i18n.language.startsWith(\x27ar\x27) ? \x27ar-EG\x27 : \x27fr-FR\x27)");
code = code.replace(/<td>\{coef\}<\/td>/g, "<td>{formatNum(coef, 0)}</td>");
code = code.replace(/<td>\{tCoef\}<\/td>/g, "<td>{formatNum(tCoef, 0)}</td>");
code = code.replace(/<td>\{stats\.totalSubjectCoefs\}<\/td>/g, "<td>{formatNum(stats.totalSubjectCoefs, 0)}</td>");
code = code.replace(/<strong>\{getRankStr\(stats\.rank\)\}<\/strong>/g, "<strong>{getRankStr(stats.rank)}</strong>");

fs.writeFileSync("src/components/BulletinPreview.tsx", code);
console.log("Patched other numbers!");

