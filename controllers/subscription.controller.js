import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";

export const  createSubscription = async(req,res,next)=>{
    try {
        const subscription = await Subscription.create({
            ...req.body, user:req.user._id}
        );
        
        const {workflowRunId} = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body:JSON.stringify({
                subscriptionId: subscription.id
            }),
            headers:{
                'content-type':'application/json',
            },
            retries: 0
        })

        res.status(201).json({success:true, data: subscription, workflowRunId});

        
    } catch (error) {
        next(error);
        
    }
};

export const getUserSubscriptions = async(req,res,next)=>{
    try {
        // req.user._id is an objectId in mongodb , then req.user.id returns the string representation of the objectId that can be used for comparisons with other strings eg  req.params.id
        if(req.user.id !== req.params.id) return res.status(401).json({message:'You are not owner of this account'});
        
        const subscriptions  = await Subscription.find({user:req.user._id});
        res.status(200).json({success:true, data: subscriptions});
    } catch (error) {
        next(error);
        
    }
};

export const getAllSubscriptions = async(req,res,next)=>{
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json({success:true, data: subscriptions});
        
    } catch (error) {
        next(error);
        
    }
};

export const getSubscription = async(req,res,next)=>{
    try {
        const subscription = await Subscription.findById(req.params.id);
        res.status(200).json({success:true, data: subscription});
        
    } catch (error) {
        next(error);
        
    }
}