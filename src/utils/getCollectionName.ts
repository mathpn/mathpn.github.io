function getCollectionDisplayName(CollectionName: string) {
  return { posts: "Post", notes: "Notes" }[CollectionName];
}

export default getCollectionDisplayName;
