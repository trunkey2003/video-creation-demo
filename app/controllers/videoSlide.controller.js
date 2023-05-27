const videoshow = require("videoshow");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { unlink } = require("fs/promises");
const fs = require("fs/promises");
const sharp = require("sharp");

var currentPath = process.cwd().replaceAll("\\", "/") + "/files/";

class videoSlideController {
  async create(req, res, next) {
    let videoPath = "";
    try {
      if (!req.body.text && !req.body.textData) return res.sendStatus(400);
      const template = req.body.template || "techeducation";
      const listTemplate = [
        "tech-education",
        "marketing-ocean",
        "noteworthy",
        "art-gallery",
        "custom",
      ];
      if (!listTemplate.includes(template))
        return res.status(400).send("Template not found");
      if (
        template === "custom" &&
        (!req.files || !Array.isArray(req.files.images) || req.files.images.length === 0 || !req.files.bgMusic)
      )
        return res.status(400).send("Custom template need images");
      const imagesFile = [...req.files.images];
      const bgMusic = req.files.bgMusic;
      for (let i = 0; i < imagesFile.length; i++) {
        const buffer = await sharp(imagesFile[i].path)
          .resize(960, 540)
          .toBuffer(imagesFile[i].path);
        await fs.writeFile(imagesFile[i].path, buffer);
      };
      const text = String(req.body.text) || "";
      let textData = null;
      try {
        textData = req.body.textData ? JSON.parse(req.body.textData) : null;
      } catch (err) {
        textData = null;
        console.log(err);
        console.log(req.body.textData);
      }
      if (!textData || !Array.isArray(textData)) {
        textData = text.split(".").map((element, index) => {
          return {
            content: element,
            type: index === 0 ? "title" : "content",
          };
        });
      }

      const colors = {
        "tech-education": "16777215",
        "marketing-ocean": "14919948",
        "art-gallery": "1113856",
      };

      const color = colors[template] || "16777215";

      let images = [];

      if (template !== "custom") {
        for (let i = 0; i < textData.length; i++) {
          const element = textData[i];
          if (element.type === "title") {
            images.push({
              path: `${currentPath}${template}/title.jpg`,
              caption: element.content,
              loop: Math.ceil(element.content.length / 15) + 1,
            });
          } else if (element.type === "content") {
            images.push({
              path: `${currentPath}${template}/content.jpg`,
              caption: element.content,
              loop: Math.ceil(element.content.length / 20) + 1,
            });
          }
        }
      } else {
        //make the images array length equal to textData length
        const allImagesPath = imagesFile.map((file) => file.path);
        const imageTemp = [];
        console.log(allImagesPath);
        // if images user upload is less than textData length, then loop the images until it's equal to textData length
        if (allImagesPath.length < textData.length) {
          const loop = Math.ceil(textData.length / allImagesPath.length);
          let i = 0;
          while (imageTemp.length < textData.length) {
            for (let j = 0; j < loop; j++) {
              imageTemp.push(allImagesPath[i]);
              if (imageTemp.length === textData.length) break;
            }
            if (i < allImagesPath.length - 1) i++;
            else i = 0;
          }
        } else {
          textData.forEach((_, index) => {
            imageTemp.push(allImagesPath[index]);
          });
        }
        images = imageTemp.map((image, index) => {
          return {
            path: image,
            caption: textData[index].content,
            loop: Math.ceil(textData[index].content.length / 20) + 1,
          };
        });
      }

      // console.log(images);
      let audioPath = "";
      if (template === "custom") {
        audioPath = bgMusic[0].path;
      } else {
        audioPath = currentPath + template + "/" + "background-music.mp3";
      }

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
          PrimaryColour: color,
          MarginV: "50",
        },
      };

      videoPath = currentPath + uuidv4() + "video" + ".mp4";
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
          res.sendFile(output, async (err) => {
            if (err) {
              console.log(err);
              res.sendStatus(400);
            } else {
              let cleanupPromises = [unlink(videoPath)];
              const files = Object.keys(req.files).reduce((result, key) => {
                const items = req.files[key].map(item => ({ ...item }));
                result.push(...items);
                return result;
              }, []);
              cleanupPromises = [
                ...cleanupPromises,
                files.map((file) => unlink(file.path)),
              ];
              Promise.all(cleanupPromises)
                .then(() => {
                  console.log("cleanup success");
                  req.files = {};
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          });
        });
    } catch (err) {
      console.log(err);
      const files = Object.keys(req.files).reduce((result, key) => {
        const items = req.files[key].map(item => ({ ...item }));
        result.push(...items);
        return result;
      }, []);
      cleanupPromises = [
        ...cleanupPromises,
        files.map((file) => unlink(file.path)),
      ];
      res.sendStatus(500);
    }
  }

  async queryImages(req, res, next) {
    try {
      const query = req.query.q;
      const page = Number(req.query.page) || 1;
      if (!query || query.length > 50)   return res.sendStatus(400);
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=MDgdBm82jAfIf97lET2piQ_fFIUaT8r_k9AEbqeCIFU`
      );
      const data = response.data;
      res.status(200).send({ ...data, query: query });
    } catch (err) {
      console.log(err);
      res.sendStatus(500).send(JSON.stringify(err));
    }
  }
}

module.exports = new videoSlideController();
