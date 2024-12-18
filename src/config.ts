import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://mathpn.com/",
  author: "Matheus Pedroni",
  profile: "https://github.com/mathpn/",
  desc: "Blog about technology, statistics, and other fun stuff.",
  title: "MPN",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 10,
  tilPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN", "pt-BR"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/mathpn/",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
];
