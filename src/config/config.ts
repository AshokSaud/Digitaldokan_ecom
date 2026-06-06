import {config} from 'dotenv'
config()

export const envConfig = {
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    adminUsername: process.env.ADMIN_USERNAME
}