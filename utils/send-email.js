import dayjs from "dayjs";
import { emailTemplates } from "./email-template.js";
import { EMAIL } from "../config/env.js";
import { transporter } from "../config/nodemailer.js";

export const sendReminderEMail = async({to,type,subscription})=>{
    if(!to || !type) throw new Error("Missing Required Parameters");
   
    const template = emailTemplates.find((t) => t.label === type);
    if(!template) throw new Error("Invalid Email Type");

    const mailInfo= {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D,YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.paymentMethod,
    }
    
    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions = {
        from: EMAIL,
        to: to,
        subject: subject,
        html: message
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) return console.log(error,'Error sending Email');

        console.log(`Email Sent: `+ info.response);
    });

}