import type { PostView } from "lemmy-js-client";
import styles from "./PostPreview.module.css";

interface PostPreviewProps {
  post: PostView;
}

export default function PostPreview({ post }: PostPreviewProps) {
  return (
    <div className={styles.container}>
      {post.post.url_content_type?.startsWith("image/") && (
        <img
          src={post.post.url}
          alt={post.post.name}
          className={styles.image}
        />
      )}
      <h2 className={styles.title}>{post.post.name}</h2>
      <div className={styles.stats}>
        {post.counts.score} votes, {post.counts.comments} comments
      </div>
    </div>
  );
}
