const fs = require('fs');
const marked = require('marked');
const path = require('path');
const pretty = require('pretty');
const rimraf = require('rimraf');

function updateLinks(html) {
  const fileNames = ['homework', 'index', 'syllabus'];

  fileNames.forEach((filename) => {
    html = html.replace(new RegExp(`${filename}.md`, 'g'), `${filename}.html`);
  });

  return html;
}

function generateSavePath(path) {
  return `./docs/${path}`;
}

function generateHtmlFromMarkdown(markdown) {
  return pretty(updateLinks(`
    <html>
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <style>
          html {
            font-family: sans-serif;
            max-width: 800px;
            margin: auto;
            padding: 1em;
          }
        </style>
      </head>
      <body>
        ${marked(markdown)}
      </body>
    </html>
  `), {ocd: true});
}

function createDirectories(source) {
  getDirectories(source).forEach((directory) => {
    fs.mkdirSync(generateSavePath(directory));
    createDirectories(directory);
  });
}

function createFiles(source) {
  getFiles(source).forEach((file) => {
    saveMarkdownAsHtml(file, file.replace('.md', '.html'));
  });

  getDirectories(source).forEach((directory) => {
    createFiles(directory);
  });
}

function createDocs(source) {
  fs.mkdirSync(generateSavePath(source));

  createDirectories(source);
  createFiles(source);

  // saveMarkdownAsHtml(`${directory}/readme.md`, `${directory}/index.html`);
  // saveMarkdownAsHtml(`${directory}/syllabus.md`, `${directory}/syllabus.html`);
}

function getClassDirectories(source) {
  return getDirectories(source)
    .filter(startsWithNumber);
}

function getDirectories(source) {
  return getInDirectory(source)
    .filter(isDirectory);
}

function getFiles(source) {
  return getInDirectory(source)
    .filter(isNotDirectory);
}

function getInDirectory(source) {
  return fs.readdirSync(source)
    .map(name => path.join(source, name));
}

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function isNotDirectory(source) {
  return !isDirectory(source);
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

// Create all class directories with sub-directories and files
getClassDirectories('./').forEach((directory) => createDocs(directory));
