import { v2 as cloudinary } from "cloudinary";

// uploader.upload() treats any other string as a path on this server and uploads that file.
const IMAGE_SOURCE_REGEX =
  /^(data:image\/[\w.+-]+;base64,[a-zA-Z0-9+/=\n]+|https?:\/\/\S+)$/;

export const isImageSource = (value) => IMAGE_SOURCE_REGEX.test(value);

export const uploadImage = async (source) => {
  const { secure_url: url } = await cloudinary.uploader.upload(source);
  return url;
};

// Older profiles can hold any text in their image fields, so only ever touch this account's images.
const isCloudinaryImage = (url) =>
  url.startsWith(`https://res.cloudinary.com/${cloudinary.config().cloud_name}/`);

// destroy() succeeds on a missing image, so a failed delete can be retried.
export const destroyImage = async (url) => {
  if (!isCloudinaryImage(url)) return;

  // Uploads use no folder, so the public id is the URL's file name without its extension.
  const publicId = url.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};
