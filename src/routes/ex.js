import dotenv from "dotenv";
dotenv.config();

import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

import { UserModel } from "../models/Users.js";

const ROUNDS = parseInt(process.env.ROUNDS, 10);
const SECRET_KEY = process.env.SECRET_KEY;

const exRouter = express.Router();

exRouter.get("/", (req, res)=> {
    // const {messageText} = req.body;
    // console.log(req);
    console.log(req?.query);
    console.log(req?.query?.messageText);
    res.json({message: "Hi from Server"});
})

exRouter.post("/register", async(req, res)=> {
    const {username, password} = req?.body;
    console.log(req?.body);
    const user = await UserModel.findOne({username});
    if (user) {
        res.json({message: "Username Already Taken"});
    } else {
        const hashedPassword = await bcrypt.hash(password, ROUNDS);
        const newUser = new UserModel({username, password: hashedPassword, data: [0, 0]});
        try{
            await newUser.save();
            res.json({message: "User Registered Successfully! Now Log In"});
        } catch (err) {
            console.error(err);
            res.json({message: err});
        }
    }
})

exRouter.post("/login", async(req, res)=> {
    console.log(req?.body);
    const {username, password} = req?.body;

    try {
        const user = await UserModel.findOne({username});
        if (!user) {
            return res.json({message: "Username incorrect"});
        } else {
            const passwordValid = await bcrypt.compare(password, user.password);
            if (passwordValid) {
                const token = jwt.sign({id: user._id}, SECRET_KEY); // SECRET_KEY is env variable
                res.json({message: "Logged in successfully", token, userID: user._id});
            } else res.json({message:"Wrong Password"});
        }
    } catch(err) {
        console.error(err);
    }
})

// This request will be made by Telescope
exRouter.get("/getData", async(req, res)=> {
    const {username, password} = req?.query;
    console.log(req?.query);
    try{
        const user = await UserModel.findOne({username});
        if (!user) {
            return res.json({message: "Username Incorrect"});
        } else {
            const passwordValid = bcrypt.compare(password, user.password);
            if (!passwordValid) return res.json({message: "Wrond Password"});
            else {
                return res.json({message: "Logged IN", data: user.data});
            }
        }
    } catch (err) {
        res.json({message: err});
        console.error(err);
    }
})

// This request will require user to prove logged-in by giving jwt token
exRouter.post("/setData", async(req, res) => {
    const token = req?.headers?.authorization;

    if (!token) res.json({message: "No token"});
    console.log("No token provided");
    // console.log(req?.headers?.authorization);
    // const id = req?.body?.id;
    // console.log(req?.body, token);

    const decodedToken = jwt.verify(token, SECRET_KEY); // SECRET_KEY is an env variable
    console.log(decodedToken?.id);

    if (!decodedToken) {
        console.log("Invalid token"); 
        return res.json({message: "Login Again"});
    }

    try {
        const user = await UserModel.findById(decodedToken?.id);
        if (!user) {
            return res.json({message: "Username incorrect"});
        } else {
            try {
                await UserModel.findByIdAndUpdate(user._id, {data: req?.body?.data});
                res.json({message: "DATA HAS BEEN SET"});
            } catch (err) {
                res.json({message: err});
                console.error(err);
            }
        }
    } catch(err) {
        console.error(err);
        res.json({message: err});
    }
})

export {exRouter};