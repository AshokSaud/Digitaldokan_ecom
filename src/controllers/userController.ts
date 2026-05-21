import { Request,Response } from "express";
import User from "../database/model/userModel";
import bcrypt from 'bcrypt'


class UserController{
    static async register(req:Request,res:Response){

        const {username,email,password} = req.body
        if(!username || !email || !password){
            res.status(400).json({
                message : "All fields are required"
            })
            return   //data aayena bhane tala ko code execute hunna, return le function lai terminate garxa
        }
        //check whether user already exists or not
        // const [data] = await User.findAll({
        //     where : {
        //         email : email
        //     }
        // })
        // if(data){
        //     res.status(400).json({
        //         message : "User already exists"
        //     })
        //     return
        // }
        // data --> users table ma insert garne 
        const user = await User.create({
            username,
            email,
            password : bcrypt.hashSync(password,10)
        })
        res.status(201).json({
            message : "User registered successfully",
        })
    }

   
}

export default UserController