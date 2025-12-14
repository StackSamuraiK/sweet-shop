import express from "express";
import { adminMiddleware, authMiddleware } from "../middleware.js";
import { PurchaseSchema, RestockSchema, SweetSchema } from "../types.js";
import { prisma } from "../db.js";
import { upload } from "../multer.js";
import { upploadOnCloudinary } from "../cloudinary.config.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
export const sweetRouter = express.Router();
//@ts-ignore
sweetRouter.post('/add', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        console.log("Request received");
        console.log("shopId:", req.shopId);
        console.log("file:", req.file?.filename);
        console.log("body:", req.body);
        if (!req.shopId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Shop ID is missing"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required"
            });
        }
        const bodyData = {
            name: req.body.name,
            category: req.body.category,
            price: parseFloat(req.body.price),
            quantity: parseInt(req.body.quantity)
        };
        console.log("Parsed body data:", bodyData);
        const result = SweetSchema.safeParse(bodyData);
        if (!result.success) {
            console.log("Validation failed:", result.error);
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error
            });
        }
        console.log("Validation passed, uploading to Cloudinary...");
        const cloudinaryResponse = await upploadOnCloudinary(req.file.path);
        if (!cloudinaryResponse || !cloudinaryResponse.url) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload image to Cloudinary"
            });
        }
        console.log("Image uploaded:", cloudinaryResponse.url);
        const sweet = await prisma.sweet.create({
            data: {
                shopId: req.shopId,
                name: result.data.name,
                category: result.data.category,
                price: result.data.price,
                image: cloudinaryResponse.url,
                quantity: result.data.quantity,
            }
        });
        console.log("Sweet created:", sweet.id);
        return res.status(201).json({
            success: true,
            message: "Sweet created successfully",
            sweet: sweet
        });
    }
    catch (error) {
        console.error('Error creating sweet:', error);
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            }
            catch (unlinkError) {
                console.error('Error cleaning up file:', unlinkError);
            }
        }
        return res.status(500).json({
            success: false,
            message: "Error creating sweet",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//@ts-ignore
sweetRouter.get('/bulk', authMiddleware, async (req, res) => {
    try {
        const response = await prisma.sweet.findMany({});
        return res.status(201).json({
            response
        });
    }
    catch (error) {
        return res.send("there is a problem fetching the sweets");
    }
});
sweetRouter.get('/search', async (req, res) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;
        const whereClause = {};
        if (name && typeof name === 'string') {
            whereClause.name = {
                contains: name,
                mode: 'insensitive'
            };
        }
        if (category && typeof category === 'string') {
            whereClause.category = {
                equals: category,
                mode: 'insensitive'
            };
        }
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) {
                const min = parseFloat(minPrice);
                if (!isNaN(min)) {
                    whereClause.price.gte = min;
                }
            }
            if (maxPrice) {
                const max = parseFloat(maxPrice);
                if (!isNaN(max)) {
                    whereClause.price.lte = max;
                }
            }
        }
        const sweets = await prisma.sweet.findMany({
            where: whereClause,
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.status(200).json({
            success: true,
            count: sweets.length,
            sweets: sweets
        });
    }
    catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            success: false,
            message: "Error searching for sweets",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
sweetRouter.post('/:id/restock', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Sweet ID is required"
            });
        }
        const sweetId = parseInt(req.params.id);
        if (isNaN(sweetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sweet ID"
            });
        }
        const result = RestockSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error
            });
        }
        const { quantity } = result.data;
        const existingSweet = await prisma.sweet.findUnique({
            where: { id: sweetId },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!existingSweet) {
            return res.status(404).json({
                success: false,
                message: "Sweet not found"
            });
        }
        const updatedSweet = await prisma.sweet.update({
            where: { id: sweetId },
            data: {
                quantity: {
                    increment: quantity
                }
            },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: `Successfully restocked ${quantity} units`,
            sweet: updatedSweet,
            previousQuantity: existingSweet.quantity,
            newQuantity: updatedSweet.quantity,
            restockedAmount: quantity
        });
    }
    catch (error) {
        console.error('Restock error:', error);
        return res.status(500).json({
            success: false,
            message: "Error restocking sweet",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Purchase endpoint - decreases quantity
sweetRouter.post('/:id/purchase', authMiddleware, async (req, res) => {
    try {
        // Validate sweet ID
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Sweet ID is required"
            });
        }
        const sweetId = parseInt(req.params.id);
        if (isNaN(sweetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sweet ID"
            });
        }
        // Validate request body
        const result = PurchaseSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error
            });
        }
        const { quantity } = result.data;
        // Check if sweet exists
        const existingSweet = await prisma.sweet.findUnique({
            where: { id: sweetId },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        if (!existingSweet) {
            return res.status(404).json({
                success: false,
                message: "Sweet not found"
            });
        }
        // Check if enough quantity is available
        if (existingSweet.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient quantity. Only ${existingSweet.quantity} units available`,
                availableQuantity: existingSweet.quantity,
                requestedQuantity: quantity
            });
        }
        // Check if sweet is in stock
        if (existingSweet.quantity === 0) {
            return res.status(400).json({
                success: false,
                message: "Sweet is out of stock"
            });
        }
        // Decrease the quantity
        const updatedSweet = await prisma.sweet.update({
            where: { id: sweetId },
            data: {
                quantity: {
                    decrement: quantity
                }
            },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        // Calculate total price
        const totalPrice = existingSweet.price * quantity;
        return res.status(200).json({
            success: true,
            message: `Successfully purchased ${quantity} unit(s)`,
            purchase: {
                sweet: {
                    id: updatedSweet.id,
                    name: updatedSweet.name,
                    category: updatedSweet.category,
                    pricePerUnit: updatedSweet.price,
                    image: updatedSweet.image
                },
                quantityPurchased: quantity,
                totalPrice: totalPrice,
                previousQuantity: existingSweet.quantity,
                remainingQuantity: updatedSweet.quantity
            }
        });
    }
    catch (error) {
        console.error('Purchase error:', error);
        return res.status(500).json({
            success: false,
            message: "Error processing purchase",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
sweetRouter.put('/update/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const sweetId = req.params.id;
        if (isNaN(sweetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sweet ID"
            });
        }
        const existingSweet = await prisma.sweet.findUnique({
            where: { id: sweetId }
        });
        if (!existingSweet) {
            return res.status(404).json({
                success: false,
                message: "Sweet not found"
            });
        }
        if (!req.shopId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Shop ID is missing"
            });
        }
        if (existingSweet.shopId !== req.shopId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You can only update your own sweets"
            });
        }
        const updateData = {};
        if (req.body.name !== undefined) {
            updateData.name = req.body.name;
        }
        if (req.body.category !== undefined) {
            updateData.category = req.body.category;
        }
        if (req.body.price !== undefined) {
            const price = parseFloat(req.body.price);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid price value"
                });
            }
            updateData.price = price;
        }
        if (req.body.quantity !== undefined) {
            const quantity = parseInt(req.body.quantity);
            if (isNaN(quantity) || quantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid quantity value"
                });
            }
            updateData.quantity = quantity;
        }
        if (req.file) {
            const response = await upploadOnCloudinary(req.file.path);
            if (response?.url) {
                updateData.image = response.url;
            }
        }
        else if (req.body.image) {
            updateData.image = req.body.image;
        }
        const result = SweetSchema.partial().safeParse(updateData);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error
            });
        }
        const updatedSweet = await prisma.sweet.update({
            where: { id: sweetId },
            data: updateData,
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: "Sweet updated successfully",
            sweet: updatedSweet
        });
    }
    catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({
            success: false,
            message: "Error updating sweet",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
sweetRouter.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Sweet ID is required"
            });
        }
        const sweetId = parseInt(req.params.id);
        if (isNaN(sweetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sweet ID"
            });
        }
        const existingSweet = await prisma.sweet.findUnique({
            //@ts-ignore
            where: { id: sweetId }
        });
        if (!existingSweet) {
            return res.status(404).json({
                success: false,
                message: "Sweet not found"
            });
        }
        if (!req.shopId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Shop ID is missing"
            });
        }
        if (existingSweet.shopId !== req.shopId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You can only delete your own sweets"
            });
        }
        if (existingSweet.image) {
            try {
                const urlParts = existingSweet.image.split('/');
                const fileWithExtension = urlParts[urlParts.length - 1];
                //@ts-ignore
                const publicId = `sweets/${fileWithExtension.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
                console.log("Image deleted from Cloudinary:", publicId);
            }
            catch (cloudinaryError) {
                console.error("Error deleting image from Cloudinary:", cloudinaryError);
            }
        }
        await prisma.sweet.delete({
            //@ts-ignore
            where: { id: sweetId }
        });
        return res.status(200).json({
            success: true,
            message: "Sweet deleted successfully",
            deletedId: sweetId
        });
    }
    catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({
            success: false,
            message: "Error deleting sweet",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=index.js.map