import express from "express"
import type { Request, Response } from "express";
import { authMiddleware } from "../middleware.js";
import { SweetSchema } from "../types.js";
import { prisma } from "../db.js";
import { upload } from "../multer.js";
import { upploadOnCloudinary } from "../cloudinary.config.js";

export const sweetRouter = express.Router();

//@ts-ignore
sweetRouter.post('/add', authMiddleware,upload.single('image'),async(req:Request, res:Response)=>{
    const result = SweetSchema.safeParse(req.body)
    try {
        //upload the image to cloudinary
        const response = await upploadOnCloudinary(result.data?.image)
        //get the url and store it in result.data.image
        const url = response?.url
        if(!req.shopId) return res.send("req.shopId is missing");
        const sweet = await prisma.sweet.create({
            data:{
                shopId: req.shopId,
                name: result.data?.name || "",
                category: result.data?.category || "",
                price: result.data?.price || 0.00,
                image: url || "",
                quantity: result.data?.quantity || 0,
            }
        })

        return res.status(200).json({
            msg: "Sweet created successfully",
            sweet: sweet
        })
    } catch (error) {
        
    }
})

//@ts-ignore
sweetRouter.get('/bulk', authMiddleware,async(req:Request, res:Response)=>{
    try {
        const response = await prisma.sweet.findMany({})
        return res.status(201).json({
            response
        })
    } catch (error) {
        return res.send("there is a problem fetching the sweets")
    }
})

sweetRouter.get('/search', async (req: Request, res: Response) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;

        const whereClause: any = {};

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
                const min = parseFloat(minPrice as string);
                if (!isNaN(min)) {
                    whereClause.price.gte = min;
                }
            }
            
            if (maxPrice) {
                const max = parseFloat(maxPrice as string);
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

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            success: false,
            message: "Error searching for sweets",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

sweetRouter.put('/update/:id', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
    try {
        const sweetId:any = req.params.id;

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

        const updateData: any = {};

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
        } else if (req.body.image) {
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

    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({
            success: false,
            message: "Error updating sweet",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});