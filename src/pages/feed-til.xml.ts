import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";

export async function GET() {
  const posts = await getCollection("til");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    stylesheet: "/rss/styles.xsl",
    title: SITE.title + " - TIL",
    description: "Today I learned (TIL) section feed.",
    site: SITE.website,
    items: sortedPosts.map(({ collection, data, slug }) => ({
      link: `${collection}/${slug}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
