
const fs = require("fs");
let code = fs.readFileSync("src/components/BulletinPreview.tsx", "utf8");

if (!code.includes("useTranslation")) {
  code = code.replace("import React from \"react\";", "import React from \"react\";\nimport { useTranslation } from \"react-i18next\";");
  code = code.replace("import React, { useRef } from \"react\";", "import React, { useRef } from \"react\";\nimport { useTranslation } from \"react-i18next\";");
}

code = code.replace(/export const BulletinPreview: React\.FC<BulletinPreviewProps> = \([^)]+\) => \{/, (match) => {
  if (code.includes("const { t, i18n } = useTranslation();")) return match;
  return match + `\n  const { t, i18n } = useTranslation();\n  const formatNum = (num: number, decimals: number = 2) => {\n    if (num === null || num === undefined) return "-";\n    return new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-EG" : "fr-FR", {\n      minimumFractionDigits: decimals,\n      maximumFractionDigits: decimals\n    }).format(num);\n  };\n`;
});

code = code.replace(/(\w+(?:\.\w+)?)\.toFixed\(2\)/g, "formatNum($1, 2)");

code = code.replace(/const getRankStr = \(rank: number\) => \{[\s\S]*?\};/, `const getRankStr = (rank: number) => {
    if (i18n.language.startsWith("ar")) {
      return formatNum(rank, 0); // Display numeral
    }
    return rank === 1 ? "1er" : rank + "e";
  };`);

fs.writeFileSync("src/components/BulletinPreview.tsx", code);
console.log("Patched!");

