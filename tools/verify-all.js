const fs = require('fs');

function checkCssBraces(file) {
  const content = fs.readFileSync(file, 'utf8');
  let depth = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth < 0) return { valid: false, error: 'Negative brace depth at char ' + i };
    }
  }
  return { valid: depth === 0, error: depth !== 0 ? 'Unclosed brace depth: ' + depth : null };
}

const cssFiles = ['css/main.css', 'css/tool.css', 'css/calc-platform.css', 'blog/blog.css'];
let allCssOk = true;
cssFiles.forEach(f => {
  const res = checkCssBraces(f);
  if (!res.valid) {
    console.error('FAIL ' + f + ': ' + res.error);
    allCssOk = false;
  } else {
    console.log('PASS ' + f + ': Braces balanced perfectly');
  }
});

if (!allCssOk) {
  process.exit(1);
}
