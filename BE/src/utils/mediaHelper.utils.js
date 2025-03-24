const ipfsService = require("../services/ipfs.services");
async function processMediaFiles(mediaFiles) {
  if (!mediaFiles) return [];

  const filesArray = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];
  let mediaObjects = [];

  for (const file of filesArray) {
    const cid = await ipfsService.uploadFile(file.data, file.name);
    mediaObjects.push({
      type: file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
          ? "video"
          : "audio",
      uri: `ipfs://${cid}`,
      mimeType: file.mimetype,
    });
  }

  return mediaObjects;
}

module.exports = { processMediaFiles };
