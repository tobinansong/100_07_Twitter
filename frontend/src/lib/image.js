// The API rejects JSON bodies over 100 KB, so images are shrunk in the browser first.
// Sizes are in base64 characters, which is what counts towards that limit.
//
// Avatars and covers get much tighter budgets. The API stores them as plain text and
// includes them with every post in a feed, so large ones would slow every feed request.
export const IMAGE_PRESETS = {
  post: { maxSide: 1600, maxChars: 98_000 },
  avatar: { aspect: 1, maxSide: 320, maxChars: 12_000 },
  cover: { aspect: 3, maxSide: 1200, maxChars: 30_000 },
};

const QUALITY_STEPS = [0.85, 0.72, 0.6, 0.48];
const MIN_SIDE = 200;
const BACKDROP = "#05070c";

function centerCrop(width, height, aspect) {
  if (!aspect) return { sx: 0, sy: 0, sw: width, sh: height };
  if (width / height > aspect) {
    const sw = height * aspect;
    return { sx: (width - sw) / 2, sy: 0, sw, sh: height };
  }
  const sh = width / aspect;
  return { sx: 0, sy: (height - sh) / 2, sw: width, sh };
}

// WebP is far smaller at the same quality. Browsers that can't encode it return PNG instead.
function encode(canvas, quality) {
  const webp = canvas.toDataURL("image/webp", quality);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality);
}

export async function compressImage(file, { aspect, maxSide, maxChars }) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That image couldn't be read. Try a JPG, PNG or WebP.");
  }

  try {
    const { sx, sy, sw, sh } = centerCrop(bitmap.width, bitmap.height, aspect);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let side = Math.min(maxSide, Math.max(sw, sh));

    while (side >= MIN_SIDE) {
      const scale = side / Math.max(sw, sh);
      canvas.width = Math.round(sw * scale);
      canvas.height = Math.round(sh * scale);
      context.imageSmoothingQuality = "high";
      context.fillStyle = BACKDROP;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITY_STEPS) {
        const dataUrl = encode(canvas, quality);
        if (dataUrl.length <= maxChars) return dataUrl;
      }
      side = Math.floor(side * 0.75);
    }
  } finally {
    bitmap.close();
  }

  throw new Error("That image is too detailed to fit the upload limit. Try a simpler one.");
}
