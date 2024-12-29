import { getCollection } from "astro:content";
import type { PostCollectionEntry } from "types";
import getSortedPosts from "./getSortedPosts";

const getSortedEntries = async (): Promise<PostCollectionEntry[]> => {
  const posts = (await getCollection(
    "posts",
    ({ data }) => !data.draft
  )) as PostCollectionEntry[];
  const notes = (await getCollection(
    "notes",
    ({ data }) => !data.draft
  )) as PostCollectionEntry[];

  const sortedPosts = getSortedPosts(posts) as PostCollectionEntry[];
  const sortedNotes = getSortedPosts(notes) as PostCollectionEntry[];

  const allEntries = sortedPosts.concat(sortedNotes);
  return allEntries;
};

export default getSortedEntries;
