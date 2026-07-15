
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "apps/web/app/settings/page.tsx");
let content = fs.readFileSync(filePath, "utf-8");

content = content.replace(/data\.current_role/g, "data.role");
content = content.replace(/current_role: currentRole/g, "role: currentRole");

fs.writeFileSync(filePath, content, "utf-8");
console.log("Fixed role column name.");

