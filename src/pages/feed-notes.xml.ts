import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";

export async function GET() {
  const posts = await getCollection("notes");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    stylesheet: "/rss/styles.xsl",
    title: SITE.title + " - Notes",
    description: "Feed of short-form notes of MPN.\n\n" + SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ collection, data, id }) => ({
      link: `${collection}/${id}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
