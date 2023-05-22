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
    cb(
      null,
      file.fieldname + "-" + uuidv4() + file.originalname.match(/\..*$/)[0]
    );
  },
});

const multi_upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Only .png, .jpg and .jpeg format allowed!");
      err.name = "ExtensionError";
      return cb(err);
    }
  },
}).array("images", 10);

// upload multiple files
router.post("/videoslide/create", multi_upload, videoSlideController.create);
router.get("/videoslide/queryImages", videoSlideController.queryImages);

router.get("/hello-world", (req, res) => res.send("Hello World!"));

module.exports = router;
