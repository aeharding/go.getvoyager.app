import type { CommentView } from "lemmy-js-client";
import styles from "./CommentPreview.module.css";

interface CommentPreviewProps {
  comment: CommentView;
}

export default function CommentPreview({ comment }: CommentPreviewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.context}>
        <strong>{comment.creator.name}</strong> commented on{" "}
        <strong>{comment.post.name}</strong>
      </div>
      <title>{comment.comment.content}</title>

      <h2 className={styles.content}>"{comment.comment.content}"</h2>

      <div className={styles.stats}>
        {comment.counts.score} votes • {comment.counts.child_count} replies
      </div>
    </div>
  );
}
