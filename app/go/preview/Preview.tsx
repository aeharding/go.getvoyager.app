import type { ResolveObjectResponse } from "lemmy-js-client";
import PostPreview from "./PostPreview";
import styles from "./Preview.module.css";

interface PreviewProps {
  data: ResolveObjectResponse;
  url: string;
}

export default function Preview({ data, url }: PreviewProps) {
  function renderContent() {
    switch (true) {
      case !!data.post:
        return <PostPreview post={data.post} />;
    }
  }

  return (
    <a
      className={styles.container}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {renderContent()}
    </a>
  );
}
