const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const port = 2000;
const app = express();

mongoose
  .connect("mongodb://localhost:27017/image-upload")
  .then(() => console.log("Db-Connected"))
  .catch((e) => console.log(e));


  const imageSchema= new mongoose.Schema({
    url: String,
    public_id: String,
  });

  const Image = mongoose.model("Image",imageSchema);


cloudinary.config({
  cloud_name: "djtxf7o4a",
  api_key: "325127336824597",
  api_secret: "-Q4Bw0E2sCMFo5t72r_lpUR5keQ", // Click 'View API Keys' above to copy your API secret
});

const storage = new CloudinaryStorage({
  cloudinary,
  parms: {
    folder: "image-folder",
    format: async (req, file) => "png",
    public_id: (req, file) => file.fieldname + " " + Date.now(),
    transformation: {
      width: 800,
      height: 600,
      crop: "fill",
    },
  },
});
const upload = multer({
  storage,
  limits: 1024 * 1024 * 5,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not image", false));
    }
  },
});

app.get("/images",async(req,res) =>{
    try{
        let images = await Image.find();
        res.json({images});
    }catch(error){
        res.json(error);
    }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const uploaded = await Image.create({
    url: req.file.path,
    public_id: req.file.filename,
  });
  res.json({ message: "File Uploaded" });
});

app.listen(port, console.log(`server ${port}`));
