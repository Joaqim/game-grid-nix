import process from "node:process";
import { StaticSiteGenerator } from "./generatePages";

async function main() {
  const dataUrl = process.env.DATA_URL || `file://${__dirname}/mock/games.json`;
  const distDir = process.env.DIST_DIR || "./dist";

  try {
    const generator = new StaticSiteGenerator(dataUrl, distDir);
    await generator.build();
    process.exit(0);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
