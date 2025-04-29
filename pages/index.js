import styles from "../styles/log.module.css";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { getBase64FromCloudinary, getImageSize } from "./util";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snapshot = await getDocs(collection(db, "main"));

        const processed = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const raw = doc.data(); // rawMain -> raw로 이름 바꿈
            const [blurDataURL, size] = await Promise.all([
              getBase64FromCloudinary(raw.photoUrl),
              getImageSize(raw.photoUrl),
            ]);

            return {
              id: raw.date,
              title: raw.title,
              date: raw.date,
              photoUrl: raw.photoUrl,
              blurDataURL,
              width: size.width,
              height: size.height,
            };
          })
        );

        setData(processed);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    }

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
            className={styles.card}
          >
            <Image
              src={log.photoUrl}
              alt="사진 설명"
              width={300}
              height={200}
              placeholder="blur"
              blurDataURL={log.blurDataURL}
              className={styles.thumbnail}
              style={{ objectFit: "cover" }}
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
