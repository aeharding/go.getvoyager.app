import styles from "./About.module.css";

interface AboutProps {
  url: string;
}

export default function About({ url }: AboutProps) {
  return (
    <div className={styles.about}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <code>{url}</code>
      </a>{" "}
      was shared with you from the Voyager app.
    </div>
  );
}
