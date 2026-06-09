import { Request, Response } from "express";
import Order from "../database/model/orderModel";
import OrderDetail from "../database/model/orderDetail";
import { PaymentMethod, PaymentStatus } from "../globals/types";
import Payment from "../database/model/paymentModel";
import axios from "axios";  //Khalti ko api backend bata hit garauna


interface IProduct {
    productId: string,
    productQty: string
}

interface OrderRequest extends Request {
    user?: {
        id: string
    }
}


class OrderController {
    async createOrder(req: OrderRequest, res: Response):Promise<void> {
        const userId = req.user?.id  //userMilldeware dekhi taneko userId
        const { phoneNumber, AddressLine, totalAmount, paymentMethod } = req.body
        const products: IProduct[] = req.body.products
        if (!phoneNumber || !AddressLine || !totalAmount || products.length == 0) {
            res.status(404).json({
                message: "please provide phoneNumber,AddressLine,totalAmount,products"
            })
            return
        }
        //for order
        const orderData = await Order.create({
            phoneNumber,
            AddressLine,
            totalAmount,
            userId
        })
        //for orderDetails
        products.forEach(async function (product) {
            await OrderDetail.create({
                quantity: product.productQty,  //not a product of database
                productId: product.productId,
                orderId: orderData.id
            })
        })
        //for payment
        const paymentData = await Payment.create({
            orderId: orderData.id,
            paymentMethod: paymentMethod
        })
        if (paymentMethod == PaymentMethod.Khalti) {
            const data = {
                return_url: "http://localhost:5173",
                website_url: "http://localhost:5173",
                amount: totalAmount * 100,
                purchase_order_id: orderData.id,
                purchase_order_name: "order_" + orderData.id
            }
            const response = await axios.post("https://dev.khalti.com/api/v2/epayment/initiate/", data, {
                headers: {
                    Authorization: "Key 9928c8c6082e40faac06604f2f3ccd3a"
                }
            })
            const khaltiResponse = response.data
            paymentData.pidx = khaltiResponse.pidx
            paymentData.save()
            console.log(khaltiResponse)
            res.status(200).json({
                message: "Order created successfully",
                url : khaltiResponse.payment_url,
                pidx : paymentData.pidx
            })
        } else if(paymentMethod ==PaymentMethod.Esewa) {

        }else{
            res.status(200).json({
                message:"Order created Successfully"
            })
        }
    }
    async verifyTransaction(req:OrderRequest,res:Response):Promise<void> {
        const {pidx} = req.body
        if(!pidx){
            res.status(400).json({
                message: "Please provide pidx!!"
            })
            return
        }
        const response = await axios.post("https://dev.khalti.com/api/v2/epayment/lookup/",{
            pidx : pidx
        },{
            headers:{
                Authorization: "Key 9928c8c6082e40faac06604f2f3ccd3a"
            }
        })
        const data = response.data
        if(data.status === "Completed"){
            await Payment.update({
                paymentStatus : PaymentStatus.Paid
            },{
                where:{
                    pidx: pidx
                }
            })
            res.status(200).json({
                message:"Payment verified successfully"
            })
        }else{
             res.status(200).json({
                message:"Payment not verified or cancelled"
            })
        }

    }

}

export default new OrderController