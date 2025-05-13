import { useState } from "react";
import styles from "./CreateLink.module.css";

export default function CreateLink() {
  const [url, setUrl] = useState<string>();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fedilink = formData.get("url");

    if (typeof fedilink !== "string") return;

    setUrl(generateShareLink(fedilink));
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input type="text" placeholder="https://lemm.ee/post/123" name="url" />
      <button>Share</button>

      {url && (
        <p>
          Share link:{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </p>
      )}
    </form>
  );
}

function generateShareLink(fedilink: string) {
  const currentUrl = new URL(window.location.href);
  const currentUrlHost = currentUrl.port
    ? `${currentUrl.hostname}:${currentUrl.port}`
    : currentUrl.hostname;
  const fedilinkUrl = new URL(fedilink);

  return `${currentUrl.protocol}//${currentUrlHost}/${fedilinkUrl.hostname}${fedilinkUrl.pathname}`;
}
