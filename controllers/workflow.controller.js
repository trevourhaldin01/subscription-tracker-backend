import {createRequire} from 'module';
import Subscription from '../models/subscription.model.js';
import dayjs from 'dayjs';
import { sendReminderEMail } from '../utils/send-email.js';
const require = createRequire(import.meta.url);
const {serve} = require('@upstash/workflow/express');

const REMINDERS = [7,5,2,1];

export const sendReminders = serve( async(context)=>{
    
    const {subscriptionId} = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);
    
    if(!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);
    
    if(renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}, Stopping Workflow`);
        return;
    }

    for (const daysBefore of REMINDERS){
        const reminderDate = renewalDate.subtract(daysBefore,'day');
        // renewal date = 22nd feb, reminder date = 15th feb,17,20,21
        if(reminderDate.isAfter(dayjs())) {
            
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);

        }

        if (dayjs().isSame(reminderDate, 'day')) {
            await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
          }
            
    }

});

const fetchSubscription = async(context, subscriptionId)=>{
    console.log("sub id",subscriptionId)
    return await context.run('get subscription',async()=>{
        return  Subscription.findById(subscriptionId).populate('user','name email');
    })
};

const sleepUntilReminder = async(context,label,date)=>{
   
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(date.toDate());
};

const triggerReminder = async(context, label, subscription)=>{
    
    return await context.run(label,async()=>{
        console.log(`Triggering ${label} reminder`);
        // send email, sms, push notification etc
        await sendReminderEMail({to: subscription.user.email, type: label, subscription});
    })

}
