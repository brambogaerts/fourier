const showdown = require("showdown");
const mustache = require("mustache");
const fs = require("fs");

const defaultPageData = {
  author: "Jez Swanson",
  url: "",
  translatorMarkdown: "",
  textDirection: "",
};

const pageDatas = [
  {
    // English
    languageName: "English",
    markdownFileName: "content.md",
    title: "An Interactive Introduction to Fourier Transforms",
    description:
      "Fourier transforms are a tool used in a whole bunch of different things. This is a explanation of what a Fourier transform does, and some different ways it can be useful.",
    outFileName: "index.html",
  },
].map((d) => Object.assign({}, defaultPageData, d));

const contentDir = "content/";
const buildDir = "build/";

const markdownConverter = new showdown.Converter();

const template = fs.readFileSync("template.html").toString();

const languages = [];
for (const pageData of pageDatas) {
  if (!pageData.hasOwnProperty("languageName")) {
    continue;
  }
  languages.push({
    name: pageData.languageName,
    url: `/fourier${pageData.url}`,
  });
}
languages.sort((a, b) => a.name > b.name);
// And then put English at the front.
const english = languages.splice(
  languages.findIndex((l) => l.name == "English"),
  1
)[0];
languages.unshift(english);

for (const pageData of pageDatas) {
  console.log(`Processing ${pageData.markdownFileName}`);
  // Read in content
  const markdown = fs
    .readFileSync(contentDir + pageData.markdownFileName)
    .toString();

  // Convert to html
  const htmlContent = markdownConverter.makeHtml(markdown);
  const translator = markdownConverter.makeHtml(pageData.translatorMarkdown);

  // Fill into template
  const view = Object.assign({}, pageData);
  view.content = htmlContent;
  view.translator = translator;
  view.languages = languages;

  const html = mustache.render(template, view);
  // We might have a string or an array of strings. Convert it so we always have an array
  let outFileNames = pageData.outFileName;
  if (!(outFileNames instanceof Array)) {
    // Wrap in Array
    outFileNames = [outFileNames];
  }
  // Output to build directory.
  for (const outFileName of outFileNames) {
    console.log(`Writing to ${outFileName}`);
    fs.writeFileSync(buildDir + outFileName, html);
  }
}
