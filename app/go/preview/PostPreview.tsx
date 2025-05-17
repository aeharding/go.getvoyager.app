import type { PostView } from "lemmy-js-client";
import styles from "./PostPreview.module.css";

interface PostPreviewProps {
  post: PostView;
}

export default function PostPreview({ post }: PostPreviewProps) {
  return (
    <div className={styles.container}>
      <title>{post.post.name}</title>
      <meta property="og:image" content={post.post.thumbnail_url} />

      {post.post.url_content_type?.startsWith("image/") && (
        <img
          src={post.post.url}
          alt={post.post.name}
          className={`fullsize ${styles.image} ${
            post.post.nsfw ? styles.blur : ""
          }`}
        />
      )}
      <h2 className={styles.title}>{post.post.name}</h2>
      <div className={styles.stats}>
        {post.counts.score} votes • {post.counts.comments} comments
      </div>
    </div>
  );
}
