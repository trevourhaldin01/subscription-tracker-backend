import mongoose from "mongoose"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from "../models/users.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// req body -> req.body is an object containing data from the client
export const signUp = async(req, res, next)=>{
    const session =await mongoose.startSession();
    session.startTransaction();

    try {
        // create new user
        // console.log(req.body)
        const {name, email, password}=req.body;
        
        // check if a user already exists
        const existingUser = await User.findOne({email});

        if(existingUser){
            const error  = new Error('User Already Exists');
            error.statusCode = 409;
            throw error;
        };

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{name, email, password:hashedPassword}],{session});

        const token = jwt.sign({userId: newUsers[0]._id},JWT_SECRET,{expiresIn: JWT_EXPIRES_IN})



        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            sucess: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0]
            }
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
        
    }

}

export const signIn = async(req,res,next)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user){
            const error = new Error("User Not Found")
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            const error = new Error("Invalid password");
            error.statusCode=401; //unauthorized
            throw error; 
        }

        const token = jwt.sign({userId:user._id}, JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});

        res.status(200).json({
            sucess: true,
            message: "User signed in successfully",
            data: {
                token,
                user,
            }
        });
        
    } catch (error) {
        next(error);
        
    }
}

// export const signOut = async(req,res,next)=>{}