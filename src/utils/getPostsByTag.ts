import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";
import type { PostCollectionEntry } from "types";

const getPostsByTag = (posts: PostCollectionEntry[], tag: string) =>
  getSortedPosts(
    posts.filter((post) => slugifyAll(post.data.tags).includes(tag)),
  );

export default getPostsByTag;
