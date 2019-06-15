const fs = require('fs');
const marked = require('marked');
const path = require('path');
const pretty = require('pretty');
const rimraf = require('rimraf');

function updateLinks(html) {
  const linkMappings = {
    'readme.md': '',
    'syllabus.md': 'syllabus.html'
  };

  Object.keys(linkMappings).forEach((key) => {
    html = html.replace(new RegExp(key, 'g'), linkMappings[key]);
  });

  return html;
}

function generateSavePath(path) {
  return `./docs/${path}`;
}

function generateHtmlFromMarkdown(markdown) {
  return pretty(updateLinks(`
    <html>
      <head></head>
      <body>
        ${marked(markdown)}
      </body>
    </html>
  `), {ocd: true});
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

// Reset docs folder
rimraf.sync('./docs');
fs.mkdirSync('docs');

// Home page
saveMarkdownAsHtml('./readme.md', 'index.html');

// Create all class directories with index and syllabus files
getClassDirectories('./').forEach((directory) => {
  fs.mkdirSync(generateSavePath(directory));
  saveMarkdownAsHtml(`${directory}/readme.md`, `${directory}/index.html`);
  saveMarkdownAsHtml(`${directory}/syllabus.md`, `${directory}/syllabus.html`);
});
