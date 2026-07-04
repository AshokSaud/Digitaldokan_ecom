import { Request, Response } from "express";
import User from "../database/model/userModel";
import bcrypt from 'bcrypt'
import generateToken from "../services/generateToken";
import generateOtp from "../services/generateOtp";
import sendMail from "../services/sendMail";
import sendResponse from "../services/sendResponse";
import checkOtpExpiration from "../services/checkOtpExpiration";
import findData from "../services/findData";


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
        const [data] = await User.findAll({
            where: {
                email: email
            }
        })
        if (data) {
            res.status(400).json({
                message: "User already exists"
            })
            return
        }
        // data --> users table ma insert garne 
        const user = await User.create({
            username,
            email,
            password: bcrypt.hashSync(password, 10)
        })
        await sendMail({
            to: email,
            subject: "Registration successful",
            text: `Welcome to Digital Dokan, ${username}! Your registration was successful.`
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

        //if email exist then compare password
        if (!user) {
            res.status(404).json({
                message: "user not found"
            })
        } else {
            //compare password
            const isPasswordMatch = bcrypt.compareSync(password, user.password)//password --> user le login garda pathako password, user.password --> database ma hash bhako password
            if (!isPasswordMatch) {
                res.status(400).json({
                    message: "Invalid password"
                })
            } else {
                //if password mathches then --> generate token(jwt)
                const token = generateToken(user.id)
                res.status(200).json({
                    message: "Login successful",
                    token: token
                })

            }
        }
    }
    static async handleForgotPassword(req: Request, res: Response) {
        const { email } = req.body
        if (!email) {
            res.status(400).json({
                message: "please provide email"
            })
            return
        }
        const [user] = await User.findAll({
            where: {
                email: email
            }
        })
        if (!user) {
            res.status(404).json({
                message: "Email not registered"
            })
            return
        }
        //generate otp, send otp to mail
        const otp = generateOtp()
        await sendMail({
            to: email,
            subject: "Password reset OTP",
            text: `Your OTP for password reset is ${otp}`
        })
        //store otp and otp generated time in database
        user.otp = otp.toString()
        user.otpGeneratedTime = Date.now().toString()
        await user.save()

        res.status(200).json({
            message: "OTP sent to email"
        })

    }
    static async verifyOtp(req: Request, res: Response) {
        const { otp, email } = req.body
        if (!otp || !email) {
            sendResponse(res, 400, "Please provide email and otp")
            return
        }
        const user = await findData(User, email)
        if (!user) {
            sendResponse(res, 404, "No user with that email")
            return
        }
        // otp verification 
        const [data] = await User.findAll({
            where: {
                otp,
                email
            }
        })
        if (!data) {
            sendResponse(res, 404, 'Invalid OTP')
            return
        }
        const otpGeneratedTime = data.otpGeneratedTime
        checkOtpExpiration(res, otpGeneratedTime, 1200000)
    }
    static async resetPassword(req: Request, res: Response) {
        const { newPassword, confirmPassword, email } = req.body
        if (!newPassword || !confirmPassword || !email) {
            sendResponse(res, 400, 'please provide newPassword,confirmPassword,email,otp')
            return
        }
        if (newPassword !== confirmPassword) {
            sendResponse(res, 400, 'newpassword and confirm password must be same')
            return
        }
        const user = await findData(User, email)
        if (!user) {
            sendResponse(res, 404, 'No email with that user')
        }
        user.password = bcrypt.hashSync(newPassword, 12)
        await user.save()
        sendResponse(res, 200, "Password reset successfully!!!")

    }
    static async fetchUsers(req: Request, res: Response) {
        const users = await User.findAll({
            attributes: ["id", "username", "email"]
        })
        res.status(200).json({
            message: "Users fetched successfully",
            data: users
        })
    }
    static async deleteUser(req: Request, res: Response) {
        const { id } = req.params
        if (!id) {
            res.status(400).json({
                message: "Please provide Id "
            })
            return
        }
        await User.destroy({
            where: {
                id
            }
        })
        res.status(200).json({
            message: "Users deleted successfully",

        })
    }
} 
export default UserController