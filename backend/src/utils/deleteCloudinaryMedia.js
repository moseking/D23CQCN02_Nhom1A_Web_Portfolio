const cloudinary = require("../config/cloudinary");

const getResourceType = (mediaType = "", url = "") => {
  if (mediaType.includes("video") || /\.(mp4|webm|ogg|mov)$/i.test(url)) {
    return "video";
  }

  return "image";
};

const deleteCloudinaryMedia = async (mediaList = []) => {
  if (!Array.isArray(mediaList) || mediaList.length === 0) {
    return;
  }

  const deleteTasks = mediaList
    .map((media) => {
      const publicId = media.publicId || media.public_id;

      if (!publicId) {
        return null;
      }

      const resourceType = getResourceType(media.type, media.url);

      return cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    })
    .filter(Boolean);

  if (deleteTasks.length === 0) {
    return;
  }

  await Promise.allSettled(deleteTasks);
};

module.exports = deleteCloudinaryMedia;
