import { Request, Response } from "express";
import User from "../database/model/userModel";
import bcrypt from 'bcrypt'


class UserController {
    static async register(req: Request, res: Response) {

        const { username, email, password } = req.body
        if (!username || !email || !password) {
            res.status(400).json({
                message: "All fields are required"
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
            password: bcrypt.hashSync(password, 10)
        })
        res.status(201).json({
            message: "User registered successfully",
        })
    }
   
    
    static async login(req: Request, res: Response) {
     //accept incoming data --> email and password
        const { email, password } = req.body
        if (!email || !password) {
            res.status(200).json({
                message: "Enter email and password"
            })
            return   // if xa but else xaina vaney return hannu paryo but else xa vaney return na hanney
        }
        //Check whether email exist or not
        const [user] = await User.findAll({
            where: {
                email: email
            }
        })
        console.log(user)
    

        //if email exist then compare password
        if (!user) {
            res.status(404).json({
                message: "user not found"
            })
        }else{
            //compare password
            const isPasswordMatch = bcrypt.compareSync(password, user.password)//password --> user le login garda pathako password, user.password --> database ma hash bhako password
            if(!isPasswordMatch){
                res.status(400).json({
                    message : "Invalid password"
                })
            }else{
            //if password mathches then --> generate token(jwt)
            res.status(200).json({
                message: "Login successful"
            })

            }
        }
    }


}

export default UserController