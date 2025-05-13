import styles from "./GetApp.module.css";
import ios from "./ios.svg";
import play from "./play.svg";

export default function GetApp() {
  return (
    <div className={styles.container}>
      <img src={ios} alt="Get the Voyager app on the App Store" />
      <img src={play} alt="Get the Voyager app on Google Play" />
    </div>
  );
}
