import multer from "multer";

const storage = multer.diskStorage({
    //@ts-ignore
  destination: function (req, file, cb) {
    cb(null, '/my-uploads')
  },
  //@ts-ignore
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })