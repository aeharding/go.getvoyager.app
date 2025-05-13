import { Outlet } from "react-router";
import styles from "./Layout.module.css";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
