const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");
const ObjectId = mongoose.Types.ObjectId

///--------------- middleware for token verification 
//--------- Authentication
let authentication = function (req , res , next){
    //console.log("innerAuth");
    try {

        // taking encrypted token from header 
        let token = req.headers['x-api-key']
        
        // return this message if token is not present in headers
        if(!token) return res.status(401).send({message: "token must be present" })
        
        // perforing this operation to decode the token
        let decodedToken = jwt.verify( token , "functionup-uranium")
        
        // if returned decoded token is undefined
        if(!decodedToken){
            return res.status(404).send({status: false , msg: "Token is not present"})
        }
        // set decoded token value in request
        req.decodedToken = decodedToken
        next()
    } 
    catch(err) {
        return res.status(401).send({  message: "token is invalid"})
    }

}

/// --------------- Authorization
let authorisation = async function (req, res , next){

    try {
        // validate blogID
        if(!ObjectId.isValid(req.params.blogId)){
            return res.status(400).send({status: false , msg:"Invalid Blog-Id"})
        }
        // finding blog document with the help of blogID
        blog = await blogModel.findById(req.params.blogId)
        
        let decodedToken = req.decodedToken
        // perform Authorization
        if(decodedToken.authorId != blog.authorId)
            return res.status(401).send({  error: 'Author is not allowed to perform this task'})
    
        next()
    } 
    catch(err) {
        return res.status(401).send({  message: "token is invalid"})
    }
}
/*
let auth1 = async function (req, res , next){

    try {

        let data = req.query

        blogAuthorId = await blogModel.find(data).select({ authorId: 1, _id: 0})
        
        let decodedToken = req.decodedToken

        let flag  = false
        let aId = ''
        for( let i = 0 ; i < blogAuthorId ; i++){
            if(decodedToken.authorId == blogAuthorId[i]){
                aId =  blogAuthorId[i]
                flag = true;
                break;
            }
        }
        if(flag == true){
            req.query.authorId = aId
            next()
        } 



        return res.status(401).send({  error: 'Author is not allowed to perform this task'})
    
    } 
    catch(err) {
        return res.status(401).send({  message: "token is invalid"})
    }
} */

module.exports.authentication = authentication
module.exports.authorisation = authorisation