import hyphenopoly from "hyphenopoly";
import { visit } from "unist-util-visit";

const hyphenator = hyphenopoly.config({
  loader: async (file, patDir) => {
    const { readFile } = await import("node:fs/promises");
    return readFile(new URL(file, patDir));
  },
  minWordLength: 6,
  require: ["en-us", "pt"],
});

const languageMap = {
  en: "en-us",
  pt: "pt",
  "en-us": "en-us",
  "pt-br": "pt",
};

export function remarkHyphenate() {
  const hyphenators = new Map();

  return async function transformer(tree, { data }) {
    // Get language from frontmatter/metadata
    const lang = data.astro.frontmatter.lang || "en"; // default to English
    const hyphenLang = languageMap[lang] || "en-us";

    // Initialize hyphenator for this language if not already done
    if (!hyphenators.has(hyphenLang)) {
      hyphenators.set(hyphenLang, await hyphenator.get(hyphenLang));
    }

    const hyphenateText = hyphenators.get(hyphenLang);
    console.log(hyphenateText);
    console.log(hyphenLang);
    const promises = [];

    visit(tree, "text", function (node) {
      promises.push(
        (async () => {
          node.value = await hyphenateText(node.value);
        })()
      );
    });

    // Wait for all hyphenation operations to complete
    await Promise.all(promises);

    return tree;
  };
}
