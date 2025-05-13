import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a
        href="https://getvoyager.app"
        target="_blank"
        rel="noopener noreferrer"
      >
        getvoyager.app
      </a>
      <a
        href="https://getvoyager.app/privacy.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy
      </a>
      <a
        href="https://getvoyager.app/terms.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Terms of Use
      </a>
      {/* <a href="#" target="_blank" rel="noopener noreferrer">
        Preferences
      </a> */}
    </footer>
  );
}
