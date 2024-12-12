import { getCollection } from "astro:content";
import type { PostCollectionEntry } from "types";
import getSortedPosts from "./getSortedPosts";

const getSortedEntries = async () : Promise<PostCollectionEntry[]> => {
  const posts = (await getCollection(
    "posts",
    ({ data }) => !data.draft
  )) as PostCollectionEntry[];
  const tils = (await getCollection(
    "til",
    ({ data }) => !data.draft
  )) as PostCollectionEntry[];

  const sortedPosts = getSortedPosts(posts) as PostCollectionEntry[];
  const sortedTils = getSortedPosts(tils) as PostCollectionEntry[];

  const allEntries = sortedPosts.concat(sortedTils);
  return allEntries;
};

export default getSortedEntries;
