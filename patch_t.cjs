
const fs = require("fs");
let code = fs.readFileSync("src/components/BulletinPreview.tsx", "utf8");

code = code.replace("const { t, i18n } = useTranslation();", "const { i18n } = useTranslation();");

fs.writeFileSync("src/components/BulletinPreview.tsx", code);

