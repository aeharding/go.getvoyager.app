import { Link } from "react-router";
import { getHostname } from "~/helpers/resolve";
import GetApp from "./getApp/GetApp";
import styles from "./Actions.module.css";

interface ActionsProps {
  url: string;
}

export default function Actions({ url }: ActionsProps) {
  return (
    <>
      <div className={styles.subtitle}>
        <p>For the best experience, browse with Voyager</p>

        <GetApp />
      </div>
      <p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open on {getHostname(url)} instead →
        </a>
      </p>
    </>
  );
}
