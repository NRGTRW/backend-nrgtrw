import prisma from "../prisma/client.js";

export const getProducts = async (req, res, next) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const { name, price, imageUrl } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                price,
                imageUrl,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};
