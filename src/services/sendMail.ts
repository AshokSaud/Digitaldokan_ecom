
import nodemailer from "nodemailer"

interface IData { //type for data to be sent in sendMail 
    to: string,
    subject: string,
    text: string
}

const sendMail = async (data: IData) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
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