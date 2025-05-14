import styles from "./GetApp.module.css";
import ios from "./ios.svg";
import play from "./play.svg";

export default function GetApp() {
  return (
    <div className={styles.container}>
      <a
        href="https://apps.apple.com/us/app/voyager-for-lemmy/id6451429762"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={ios} alt="Download on the Apple App Store" />
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=app.vger.voyager"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={play} alt="Get it on Google Play" />
      </a>
    </div>
  );
}
