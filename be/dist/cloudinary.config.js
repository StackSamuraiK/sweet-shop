import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || ""
});
export const upploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("No file path provided to Cloudinary upload");
            return null;
        }
        if (!fs.existsSync(localFilePath)) {
            console.error(`File not found at path: ${localFilePath}`);
            return null;
        }
        console.log("Uploading file to Cloudinary:", localFilePath);
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            transformation: [
                { width: 800, height: 800, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" }
            ]
        });
        console.log("File uploaded successfully:", response.url);
        fs.unlinkSync(localFilePath);
        console.log("Local file deleted:", localFilePath);
        return response;
    }
    catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
                console.log("Local file deleted after error:", localFilePath);
            }
            catch (unlinkError) {
                console.error("Error deleting local file:", unlinkError);
            }
        }
        throw error;
    }
};
//# sourceMappingURL=cloudinary.config.js.map