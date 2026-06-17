/**
 * fix-cloudflare-navigation.js
 *
 * Replaces navigate+search+clickFirstProduct patterns with direct product URL navigation
 * across all spec files, so tests bypass the Cloudflare bot protection that blocks
 * the search results page on demo.nopcommerce.com in headless automation.
 */
const fs = require('fs');
const path = require('path');

const PRODUCT_SLUG = `'/apple-macbook-pro-13-inch'`;
const CONSTANT_LINE = `\n// Direct product URL — bypasses Cloudflare-blocked search results page on demo.nopcommerce.com\nconst PRODUCT_SLUG = '/apple-macbook-pro-13-inch';`;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Add PRODUCT_SLUG constant after the last "const xxx = testData..." line (if not already present)
  if (!content.includes("const PRODUCT_SLUG")) {
    // Find the last "const xxx = testData.xxx;" line
    const testDataPattern = /const \w+ = testData\.\w+;/g;
    let lastMatch;
    let lastIndex;
    let m;
    while ((m = testDataPattern.exec(content)) !== null) {
      lastMatch = m[0];
      lastIndex = m.index + m[0].length;
    }
    if (lastMatch) {
      content = content.slice(0, lastIndex) + CONSTANT_LINE + content.slice(lastIndex);
    }
  }

  // 2. Replace 3-line block: navigate + searchFor + clickFirstProduct (all in same scope)
  // Pattern: await homePage.navigate();\n<ws>await homePage.searchFor(positive.searchKeyword);\n<ws>await searchResultsPage.clickFirstProduct();
  // Also handles "data.searchKeyword" vs "positive.searchKeyword"
  const threeLinePattern = /await homePage\.navigate\(\);\n(\s+)await homePage\.searchFor\(\w+\.searchKeyword\);\n(\s+)await searchResultsPage\.clickFirstProduct\(\);/g;
  content = content.replace(threeLinePattern, (match, ws1, ws2) => {
    return `await productDetailPage.navigate(PRODUCT_SLUG);`;
  });

  // 3. Replace 2-step split: navigate+searchFor in one step, clickFirstProduct in next step
  // Pattern for: step with navigate+searchFor followed immediately by step with only clickFirstProduct
  const twoStepPattern = /await test\.step\('([^']+)', async \(\) => \{\n\s+await homePage\.navigate\(\);\n\s+await homePage\.searchFor\(\w+\.searchKeyword\);\n\s+\}\);\n\n\s+await test\.step\('([^']+)', async \(\) => \{\n\s+await searchResultsPage\.clickFirstProduct\(\);\n(\s+)await expect/g;

  // Handle case where clickFirstProduct is the ONLY call in the second step
  const twoStepPatternNoExpect = /await test\.step\('([^']+)', async \(\) => \{\n\s+await homePage\.navigate\(\);\n\s+await homePage\.searchFor\(\w+\.searchKeyword\);\n\s+\}\);\n\n\s+await test\.step\('([^']+)', async \(\) => \{\n\s+await searchResultsPage\.clickFirstProduct\(\);\n\s+\}\);/g;
  content = content.replace(twoStepPatternNoExpect, (match) => {
    // Extract the second step description
    const stepDescMatch = match.match(/await test\.step\('([^']+)', async \(\) => \{\n\s+await searchResultsPage/);
    const desc = stepDescMatch ? stepDescMatch[1] : 'Navigate to product detail page';
    return `await test.step('${desc}', async () => {\n      await productDetailPage.navigate(PRODUCT_SLUG);\n    });`;
  });

  // 4. Replace any remaining standalone clickFirstProduct lines (after navigate+searchFor were already on separate lines)
  // These are lines that appear alone in a step with just clickFirstProduct
  content = content.replace(/(\s+)await searchResultsPage\.clickFirstProduct\(\);\n(\s+)await expect\(productDetailPage/g,
    (match, ws1, ws2) => {
      return `${ws1}await productDetailPage.navigate(PRODUCT_SLUG);\n${ws2}await expect(productDetailPage`;
    }
  );

  // 5. Replace any remaining standalone clickFirstProduct lines (in helper functions)
  // Pattern: line that has only clickFirstProduct (common in helper functions)
  content = content.replace(/^(\s+)await searchResultsPage\.clickFirstProduct\(\);\n/gm,
    (match, ws) => {
      return `${ws}await productDetailPage.navigate(PRODUCT_SLUG);\n`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed: ${path.basename(filePath)}`);

    // Show diff summary
    const origLines = original.split('\n').length;
    const newLines = content.split('\n').length;
    console.log(`   Lines: ${origLines} → ${newLines}`);
  } else {
    console.log(`⏭️  No changes: ${path.basename(filePath)}`);
  }
}

const specFiles = [
  'tests/negative/negative-tests.spec.ts',
  'tests/validation/quantity-boundary.spec.ts',
  'tests/e2e/security.spec.ts',
];

for (const file of specFiles) {
  const absPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(absPath)) {
    fixFile(absPath);
  } else {
    console.log(`⚠️  Not found: ${file}`);
  }
}

console.log('\nDone. Run: npx tsc --noEmit to verify.');
