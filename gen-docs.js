const fs = require('fs');
const marked = require('marked');
const path = require('path');
const pretty = require('pretty');

function generateSavePath(path) {
  return `./docs/${path}`;
}

function generateHtmlFromMarkdown(markdown) {
  return pretty(`
    <html>
      <head></head>
      <body>
        ${marked(markdown)}
      </body>
    </html>
  `, {ocd: true});
}

function getClassDirectories(source) {
  return fs.readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory)
    .filter(startsWithNumber);
}

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function startsWithNumber(source) {
  return source.match(/^\d/);
}

function saveMarkdownAsHtml(path, savePath) {
  const markdown = fs.readFileSync(path, 'utf-8');
  fs.writeFileSync(generateSavePath(savePath), generateHtmlFromMarkdown(markdown), 'utf-8');
}

const classDirectories = getClassDirectories('./');

saveMarkdownAsHtml('./readme.md', 'index.html');