const productModel = require("../models/product.model");
const respond = require("../services/respond.service");
const videoshow = require("videoshow");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const fs = require("fs");
const tmp = require("tmp-promise");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  organization: "org-MzjTrQ7icUfeYPNDjII1TUGv",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const download = require("image-downloader");

var currentPath = process.cwd() + "\\files\\";

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
      if (!req.body.voice)
        return res.status(400).send("No voice file uploaded.");
      const keywords = Array.isArray(JSON.parse(req.body.keywords))
        ? JSON.parse(req.body.keywords)
        : [];
      const audioContentBinary = Buffer.from(req.body.voice, "base64");
      const images = [];
      const {
        fd,
        path: voicePath,
        cleanup: cleanupVoice,
      } = await tmp.file({ postfix: ".mp3" });

      try {
        fs.writeFile(voicePath, audioContentBinary, async (err) => {
          if (err) {
            console.error(err);
            cleanupVoice();
            return;
          }

          const videoPath = currentPath + "video.mp4";

          const duration = await getAudioDurationInSeconds(voicePath);

          if (keywords.length > 0) {
            for (let i = 0; i < keywords.length; i++) {
              const prompt =
                "A realistic image based on this keyword " + keywords[i];

              console.log("image prompt: " + prompt);

              try {
                const response = await openai.createImage({
                  prompt,
                  n: 1,
                  size: "512x512",
                });
                const imageUrl = response.data.data[0].url;
                const options = {
                  url: imageUrl,
                  dest: currentPath + `image-${i}.jpg`,
                };
  
                let { filename } = await download.image(options);
                if (filename) {
                  images.push(filename);
                }
              } catch (err) {
                console.log("Request failed for image generation, prompt: " + prompt);
                throw err;
              }
            }
          } else {
            images.push(currentPath + "rsi-logo.jpg");
          }

          const loop = Math.ceil(duration / images.length);

          const videoOptions = {
            fps: 25,
            loop: loop,
            transition: true,
            transitionDuration: 1,
            videoBitrate: 1024,
            videoCodec: "libx264",
            size: "512x512",
            audioBitrate: "128k",
            audioChannels: 2,
            format: "mp4",
            pixelFormat: "yuv420p",
          };

          videoshow(images, videoOptions)
            .audio(voicePath)
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
              console.error("Video created in:", output);
              cleanupVoice();
              res.sendFile(output);
            });
        });
      } catch (err) {
        cleanupVoice();
        throw err;
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  }
}

module.exports = new productController();
