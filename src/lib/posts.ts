import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// The published set is defined once, here, so no page can list or render a
// draft by forgetting a filter of its own.
export async function publishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');

  return posts.filter((post: Post) => !post.data.draft);
}
