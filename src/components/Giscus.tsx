function getGiscusTheme() {
  const theme = document.firstElementChild?.getAttribute("data-theme");
  return theme === "dark" ? "dark" : "light";
}

function createGiscus() {
  const giscusAttributes = {
    src: "https://giscus.app/client.js",
    "data-repo": "mathpn/mathpn.github.io",
    "data-repo-id": "R_kgDOJdSgGg",
    "data-category": "General",
    "data-category-id": "DIC_kwDOJdSgGs4ClWOt",
    "data-mapping": "pathname",
    "data-strict": "0",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "top",
    "data-theme": getGiscusTheme(),
    "data-lang": "en",
    "data-loading": "lazy",
    crossorigin: "anonymous",
    async: "",
  };

  const giscusScript = document.createElement("script");
  Object.entries(giscusAttributes).forEach(([key, value]) =>
    giscusScript.setAttribute(key, value)
  );

  document.querySelector("main")?.appendChild(giscusScript);
}

export default function Giscus() {
  createGiscus();
  return <div className="giscus" />;
}
