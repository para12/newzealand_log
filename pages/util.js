export async function getBase64FromCloudinary(imageUrl) {
  const smallImageUrl = imageUrl.replace(
    "/upload/",
    "/upload/w_30,h_20,c_fill,q_auto,f_auto/"
  );
  const response = await fetch(smallImageUrl);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function getImageSize(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
  });
}
