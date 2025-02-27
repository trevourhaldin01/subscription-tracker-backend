import nodemailer from 'nodemailer';
import { EMAIL, EMAIL_PASSWORD } from './env.js';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: EMAIL,
        pass: EMAIL_PASSWORD
    }
});