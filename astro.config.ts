import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import type { ThemeRegistration } from "@shikijs/types";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import { SITE } from "./src/config";
import { remarkHyphenate } from "./src/utils/hyphenate.mjs";
import rehypeWrapTables from "./src/utils/table-wrapper-plugin.mjs";
import gruvboxThemeDarkHard from "./themes/gruvbox-dark-hard.json";
import gruvboxThemeDarkMedium from "./themes/gruvbox-dark-medium.json";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  base: "",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkToc,
      remarkHyphenate,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    rehypePlugins: [rehypeKatex, rehypeWrapTables],
    shikiConfig: {
      themes: {
        light: gruvboxThemeDarkMedium as ThemeRegistration,
        dark: gruvboxThemeDarkHard as ThemeRegistration,
      },
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
