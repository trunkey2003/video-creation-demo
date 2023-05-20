const videoshow = require("videoshow");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

var currentPath = process.cwd() + "/files/";

const getMP3Duration = (buffer) => {
  return new Promise((resolve, reject) => {
    mp3Duration(buffer, function (err, duration) {
      if (err) return reject(err.message);
      resolve(duration);
    });
  });
};

class productController {
  async index(req, res, next) {
    try {
      if (!req.body.text && !req.body.textData) return res.sendStatus(400);
      const text = String(req.body.text) || "";
      let textData = req.body.textData;
      if (!textData || !Array.isArray(textData)) {
        textData = text.split(".").map((element, index) => {
          return {
            content: element,
            type: index === 0 ? "title" : "content",
          };
        });
      }

      let images = [];

      for (let i = 0; i < textData.length; i++) {
        const element = textData[i];
        if (element.type === "title") {
          images.push({
            path: currentPath + "image-0.jpg",
            caption: element.content,
            loop: Math.ceil(element.content.length / 15) + 1,
          });
        } else if (element.type === "content") {
          images.push({
            path: currentPath + "image-1.jpg",
            caption: element.content,
            loop: Math.ceil(element.content.length / 20) + 1,
          });
        }
      }

      // console.log(images);
      const audioPath = currentPath + "audiotest.mp3";
      const videoPath = currentPath + uuidv4() + "video" + ".mp4";

      // const loop = Math.ceil(duration / images.length);

      const videoOptions = {
        fps: 25,
        transition: true,
        transitionDuration: 1,
        videoBitrate: 1024,
        videoCodec: "libx264",
        size: "960x540",
        audioBitrate: "128k",
        audioChannels: 2,
        format: "mp4",
        pixelFormat: "yuv420p",
        subtitleStyle: {
          Fontname: "Roboto",
          Fontsize: "32",
          PrimaryColour: "16777215",
          SecondaryColour: "16777215",
          TertiaryColour: "16777215",
          BackColour: "-2147483640",
          MarginV: "50",
        },
      };

      videoshow(images, videoOptions)
        .audio(audioPath)
        .save(videoPath)
        .on("start", function (command) {
          console.log("ffmpeg process started:", command);
        })
        .on("error", function (err, stdout, stderr) {
          console.error("Error:", err);
          console.error("ffmpeg stderr:", stderr);
          res.sendStatus(400);
        })
        .on("end", function (output) {
          res.sendFile(output, (err) => {
            if (err) {
              console.log(err);
              res.sendStatus(400);
            } else {
              fs.unlink(videoPath, (err) => {
                if (err) throw err;
                console.log("audio deleted");
              });
            }
          });
        });
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  }
}

module.exports = new productController();
