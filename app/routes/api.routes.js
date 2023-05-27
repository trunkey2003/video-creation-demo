var express = require("express");
var router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const videoSlideController = require("../controllers/videoSlide.controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd().replaceAll("\\", "/") + "/files/custom");
  },
  filename: function (req, file, cb) {
    console.log(file);
    let fileName = "";

    fileName =
      file.fieldname +
      "-" +
      uuidv4() +
      "." +
      file.mimetype.split("/")[1];

    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "bgMusic") {
    if (
      file.mimetype === "audio/mpeg" ||
      file.mimetype === "audio/wav" ||
      file.mimetype === "audio/mp3" ||
      file.mimetype === "audio/ogg"
    ) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Music file should be mp3 or wav."), false); // Reject the file
    }
  } else {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp" || 
      file.mimetype === "image/jpg"
    ) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Image file should be jpeg, png or webp."), false); // Reject the file
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const handleUploadImageAndBgMusic = upload.fields([
  { name: "bgMusic", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

// upload multiple files 10 image and 1 bgMusic
router.post(
  "/videoslide/create",
  handleUploadImageAndBgMusic,
  videoSlideController.create
);
router.get("/videoslide/queryImages", videoSlideController.queryImages);

router.get("/hello-world", (req, res) => res.send("Hello World!"));

module.exports = router;
