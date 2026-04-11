import fs from "fs";
import path from "path";

function fixDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      fixDir(full);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    let content = fs.readFileSync(full, "utf8");

    content = content.replace(
      /from\s+["'](\.\.?\/[^"']+)["']/g,
      (match, p1) => {
        // Already has .js extension, skip
        if (p1.endsWith(".js")) return match;

        // Resolve the import path relative to the CURRENT FILE's directory
        const currentFileDir = path.dirname(full);
        const resolvedPath = path.resolve(currentFileDir, p1);

        // Check if it's a directory -> append /index.js
        if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
          return match.replace(p1, `${p1}/index.js`);
        }

        // Otherwise append .js
        return match.replace(p1, `${p1}.js`);
      }
    );

    fs.writeFileSync(full, content);
  }
}

fixDir("./dist");
