import styles from "../styles/log.module.css";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import Link from "next/link";

export default function Log() {
  const router = useRouter();
  const { title, date } = router.query;
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const prefix = "https://res.cloudinary.com/dnkvykbeq/image/upload/";

  useEffect(() => {
    if (!date) return; // id가 아직 없으면 리턴

    async function fetchItem() {
      const docRef = doc(db, "newzealand_log", date);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLog(docSnap.data());
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    }
    fetchItem();
  }, [date]);

  if (loading || !log) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <Link href="/" className={styles.backButton}>
        목록으로 돌아가기
      </Link>

      <h1 className={styles.pageTitle}>{title}</h1>

      <div className={styles.logContents}>
        {log.contents.map((c, idx) =>
          c.startsWith(prefix) ? (
            <img
              loading="lazy"
              key={idx}
              src={c}
              alt=""
              className={styles.logImage}
            />
          ) : (
            <p key={idx} className={styles.logText}>
              {c}
            </p>
          )
        )}
      </div>
    </div>
  );
}
