import styles from "../styles/log.module.css";

import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { getBase64FromCloudinary, getImageSize } from "../lib/util";

function isImageUrl(str) {
  return str.startsWith("https://res.cloudinary.com/dnkvykbeq/image/upload/");
}

export default function Log() {
  const router = useRouter();
  const { title, date } = router.query;
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fadeState, setFadeState] = useState(null); // 추가
  const imageRefs = useRef([]);

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
              ref={(el) => (imageRefs.current[idx] = el)}
              src={c.src}
              alt="사진 설명"
              width={c.width}
              height={c.height}
              placeholder="blur"
              blurDataURL={c.blurDataURL}
              className={styles.thumbnail}
              style={{ objectFit: "cover", cursor: "pointer" }}
              layout="responsive"
              onClick={(e) => {
                e.stopPropagation(); // 부모 클릭 막기
                const imgEl = imageRefs.current[idx];
                if (imgEl) {
                  setSelectedImage({
                    src: c.src,
                    blurDataURL: c.blurDataURL,
                    width: imgEl.clientWidth,
                    height: imgEl.clientHeight,
                  });
                  setFadeState("fadeIn"); // 열 때 fadeIn
                }
              }}
            />
          ) : (
            <p key={idx} className={styles.logText}>
              {c.text}
            </p>
          )
        )}
        {/* {selectedImage && (
          <div
            className={styles.overlay}
            onClick={() => setSelectedImage(null)}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={selectedImage.src}
                alt="확대된 사진"
                width={selectedImage.width}
                height={selectedImage.height}
                className={styles.expandedImage}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        )} */}
        {selectedImage && (
          <div
            className={`${styles.overlay} ${
              fadeState === "fadeOut" ? styles.fadeOut : styles.fadeIn
            }`}
            onClick={() => {
              setFadeState("fadeOut");
              setTimeout(() => {
                setSelectedImage(null);
                setFadeState(null);
              }, 300); // fadeOut 끝나고 300ms 후에 닫기
            }}
          >
            <div
              className={styles.imageWrapper}
              style={{
                width: selectedImage.width,
                height: selectedImage.height,
              }}
            >
              <img
                src={selectedImage.src}
                alt="확대된 사진"
                className={styles.expandedImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
