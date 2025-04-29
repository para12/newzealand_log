import styles from "../styles/log.module.css";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { getBase64FromCloudinary, getImageSize } from "./util";

function isImageUrl(str) {
  return str.startsWith("https://res.cloudinary.com/dnkvykbeq/image/upload/");
}

export default function Log() {
  const router = useRouter();
  const { title, date } = router.query;
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    async function fetchLog() {
      const docRef = doc(db, "newzealand_log", date);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rawLog = docSnap.data();
        const contents = rawLog.contents; // 🔥 배열 안이 모두 string!

        const processed = await Promise.all(
          contents.map(async (content) => {
            if (isImageUrl(content)) {
              // https로 시작하는 경우: 이미지
              const [blurDataURL, size] = await Promise.all([
                getBase64FromCloudinary(content),
                getImageSize(content),
              ]);

              return {
                type: "image",
                src: content,
                blurDataURL,
                width: size.width,
                height: size.height,
              };
            } else {
              // 나머지는 텍스트
              return {
                type: "text",
                text: content,
              };
            }
          })
        );

        setLog(processed);
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    }
    fetchLog();
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
        {log.map((c, idx) =>
          c.type === "image" ? (
            <Image
              key={idx}
              src={c.src}
              alt="사진 설명"
              width={c.width}
              height={c.height}
              placeholder="blur"
              blurDataURL={c.blurDataURL}
              className={styles.logImage}
              style={{ objectFit: "contain" }}
              layout="responsive"
            />
          ) : (
            <p key={idx} className={styles.logText}>
              {c.text}
            </p>
          )
        )}
      </div>
    </div>
  );
}
