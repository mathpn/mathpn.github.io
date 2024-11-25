function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", "[data-theme='dark']"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      textColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-fill"),
        },
      },
      backgroundColor: {
        skin: {
          fill: withOpacity("--color-fill"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-text-base"),
          card: withOpacity("--color-card"),
          "card-muted": withOpacity("--color-card-muted"),
        },
      },
      outlineColor: {
        skin: {
          fill: withOpacity("--color-accent"),
        },
      },
      borderColor: {
        skin: {
          line: withOpacity("--color-border"),
          fill: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
      },
      fill: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
        transparent: "transparent",
      },
      stroke: {
        skin: {
          accent: withOpacity("--color-accent"),
        },
      },
      fontFamily: {
        mono: ['"Fira Code"', "monospace"],
        serif: ['"Source Serif 4"', "serif"],
        sans: ['"Source Sans 3"', "sans"],
      },

      typography: (theme) => ({
        DEFAULT: {
          css: {
            kbd: {
              "box-shadow": "0 0 0 1px rgba(var(--color-accent), 0.1)",
            },
            "--tw-prose-body": `var("--color-text-base")`,
            "--tw-prose-kbd": `var("--color-text-base")`,
            pre: {
              color: false,
            },
            code: {
              color: false,
            },
            blockquote: {
              quotes: '"\\201C""\\201D""\\2018""\\2019"',

              // No quotes on regular blockquotes
              "p:first-of-type::before": {
                content: "no-open-quote",
              },
              "p:last-of-type::after": {
                content: "no-close-quote",
              },

              // Target blockquotes that contain cite elements
              "&:has(cite)": {
                "border-left": "none",
                padding: "0.5em 3em",
                position: "relative",

                "&::before": {
                  content: '"\\201C"',
                  "font-size": "4em",
                  "line-height": "1",
                  position: "absolute",
                  left: "-0.1em",
                  top: "-0.2em",
                  color: theme("backgroundColor.skin.card-muted"),
                },

                "&::after": {
                  content: '"\\201D"',
                  "font-size": "4em",
                  "line-height": "1",
                  position: "absolute",
                  right: "-0.1em",
                  bottom: "-0.4em",
                  color: theme("backgroundColor.skin.card-muted"),
                },

                cite: {
                  display: "block",
                  "margin-top": "1em",
                  "text-align": "right",
                  "font-style": "normal",
                  "font-weight": "500",
                },
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
