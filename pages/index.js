// import Head from 'next/head'
import styles from "../styles/log.module.css";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "main"));
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    setLoading(false);
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <h1 className={styles.pageTitle}>뉴질랜드</h1>
      <div className={styles.grid}>
        {data.map((log) => (
          <Link
            key={log.id}
            href={{
              pathname: "/log",
              query: { title: log.title, date: log.date },
            }}
            // as="/log"
            className={styles.card}
          >
            <img
              loading="lazy"
              src={log.photoUrl}
              alt={log.title}
              className={styles.thumbnail}
            />
            <div className={styles.textOverlay}>
              <h2>{log.title}</h2>
              <p>{log.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
