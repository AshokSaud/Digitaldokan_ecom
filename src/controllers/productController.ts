import { Request, Response } from "express";
import Product from "../database/model/productModel";
import Category from "../database/model/categoryModel";



class productController {
    async createProduct(req:Request, res: Response): Promise<void> {
        const { productName, productDescription, productPrice, productTotalStock, discount, categoryId } = req.body
        console.log(req.file)
        const filename = req.file ? req.file.filename : "http://www.listercarterhomes.com/staff-member/natalie-naples/attachment/dummy-image-square/"
        if (!productName || !productDescription || !productPrice || !productTotalStock || !categoryId) {
            res.status(400).json({
                message: "please provide productName, productDescription, productPrice, productTotalStock, discount, categoryId"
            })
            return
        }
        await Product.create({
            productName,
            productDescription,
            productPrice,
            productTotalStock,
            discount: discount || 0, //discount xa vaney discount janxa or(natra) 0 janxa
            categoryId,
            productImageUrl: filename
        })
        res.status(200).json({
            message: "product created successfully"
        })

    }
    async getAllProducts(req: Request, res: Response): Promise<void> {
        const datas = await Product.findAll({
            include: [                     // include vaneko sequelize ma join ma
                {
                    model: Category,
                    attributes:['id','categoryName']        //Category lai product ma join gareko
                }
            ]
        })                                  // aba chai product ko data with category ko data pani aayo
        res.status(200).json({
            message: "Products fetched successfully",
            data: datas
        })
    }

    async getSingleProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const datas = await Product.findAll({
            where: {
                id: id
            },
            include: [
                {
                    model: Category,
                    attributes:['id','categoryName'] 
                }
            ]
        })
        res.status(200).json({
            message: "Product fetched successfully",
            data: datas
        })

    }
    async deleteProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const datas = await Product.findAll({
            where: {
                id: id
            }
        })
        if (datas.length === 0) {
            res.status(400).json({
                message: "No product with this id"
            })
        } else {
            await Product.destroy({
                where: {
                    id: id
                }
            })
            res.status(200).json({
                message: "Product deleted successfully"
            })
        }

    }
    async updateProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const { productName, productDescription, productPrice, productTotalStock, discount,categoryId } = req.body
        const filename = req.file ? req.file.filename : "http://www.listercarterhomes.com/staff-member/natalie-naples/attachment/dummy-image-square/"
        if (!productName || !productDescription || !productPrice || !productTotalStock || !categoryId) {
            res.status(400).json({
                message: "please provide all fields"
            })
            return
        }
        const datas = await Product.findByPk(id)
        if (!datas) {
            res.status(404).json({
                message: "No products of this id"
            })
            return
        }
        await Product.update({
            productName,
            productDescription,
            productPrice,
            productTotalStock,
            categoryId,
            discount: discount || 0,
            productImageUrl: filename

        }, {
            where: {
                id: id
            }
        })
        res.status(200).json({
            message: "product updated successfully"
        })
    }

}
export default new productController()