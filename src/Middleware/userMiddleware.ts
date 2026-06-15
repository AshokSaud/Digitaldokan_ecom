import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import User from "../database/model/userModel";
import { envConfig } from "../config/config";

export enum Role{
    Admin = 'admin', 
    Customer = "customer"
}

interface IExtendedRequest extends Request{
    user? : {
        username : string, 
        email : string, 
        role : string, 
        password : string, 
        id : string

    }
}
class UserMiddleware{
    async isUserLoggedIn(req:IExtendedRequest,res:Response,next:NextFunction):Promise<void>{
        // receive token 
       const token =  req.headers.authorization 
       if(!token){
        res.status(403).json({
            message : "Token must be provided"
        })
        return
       }
        // validate token 
       jwt.verify(token,envConfig.jwtSecretKey as string, async (err,result:any)=>{ //token verify vayo ki nai vanera func ma aayera ko hunxa,1st vayena vaney error aauxa,2nd ma vayo vaney result aauxa(err,result) 
        if(err){
            res.status(403).json({
                message : "Invalid token !!!"
            })
        }else{
         //{userId : 123123123}
            const userData = await User.findByPk(result.userId) // {email:"",pass:"",role:""}
            if(!userData){
                res.status(404).json({
                    message : "No user with that userId"
                })
                return
            }
            req.user = userData 
            next()  // yesley chai route ma next function lai execute huna dinxa, important
        }
       })

    }
    accessTo(...roles:Role[]){ 
        return (req:IExtendedRequest,res:Response,next:NextFunction)=>{
            let userRole = req.user?.role as Role
           if(!roles.includes(userRole)){
                res.status(403).json({
                     message : "You dont have permission!!"
                })
                return
            }
            next()
        }
    }
}





export default new UserMiddleware