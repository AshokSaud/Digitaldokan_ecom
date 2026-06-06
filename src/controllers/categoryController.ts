import { Request, Response } from "express"
import Category from "../database/model/categoryModel"


class CategoryController {
    categoryData = [
        {
            categoryName: "Electronics",
        },
        {
            categoryName: "Groceries",
        },
        {
            categoryName: "Foods"
        }
    ]
    async seedCategory(): Promise<void> {
        const datas = await Category.findAll()
        if (datas.length === 0) {
            await Category.bulkCreate(this.categoryData as any)
            console.log("Category seeded successfully")
        } else {
            console.log("Category already seeded")
        }
    }
    async addCategory(req: Request, res: Response): Promise<void> {
        const { categoryName } = req.body
        if (!categoryName) {
            res.status(400).json({
                message: "please provide categoryName"
            })
            return
        }
        await Category.create({
            categoryName
        })
        res.status(200).json({
            message: "Category added successfully"
        })

    }

    async getCategories(req: Request, res: Response): Promise<void> {
        const data = await Category.findAll()
        res.status(200).json({
            message: "Categories retrieved successfully",
            data
        })
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        if (!id) {
            res.status(400).json({
                message: "please provide category id"
            })
            return
        }
        const data = await Category.findByPk(id)
        if (!data) {
            res.status(404).json({
                message: "No category with that id"
            })
        } else {
            await Category.destroy({
                where: {
                    id
                }
            })
            res.status(200).json({
                message: "Category deleted successfully"
            })
        }
    }
    async updateCategory(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const { categoryName } = req.body // yo id ko new category name k rakhney vanera pathayenxa
        if (!id || !categoryName) {
            res.status(400).json({
                message: "please provide category id and categoryName"
            })
            return
        }
        const data = await Category.findByPk(id)
        if (!data) {
            res.status(404).json({
                message: "No category with that id"
            })
            return
        }

        await Category.update({         // update ley 2 arg magxa, first chai kun field lai update garne vanera, second chai kasko(id) update garne vanera
            categoryName: categoryName
        }, {
            where: {
                id
            }
        })
        res.status(200).json({
            message: "category updated successfully"
        })

    }


}

export default new CategoryController // export garda new lekhera(class ko instance banayera) export garyo vaney mathi async ko aagadi static lekhna pardaina...natra lekhnu parxa