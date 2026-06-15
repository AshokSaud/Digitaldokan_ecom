
import nodemailer from "nodemailer"
import { envConfig } from "../config/config"

interface IData { //type for data to be sent in sendMail 
    to: string,
    subject: string,
    text: string
}

const sendMail = async (data: IData) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: envConfig.email,
            pass: envConfig.emailPassword
        }
    })
    const mailOptions = {
        from: "Digital Dokan<ashoksaud@gmail.com>",
        to: data.to,
        subject: data.subject,
        text: data.text
    }
    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log("Error sending email", error)
    }

}

export default sendMail