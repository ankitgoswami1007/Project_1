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
        if(!token) return res.status(403).send({message: "token must be present" })
        
        // perforing this operation to decode the token
        let decodedToken = jwt.verify( token , "functionup-uranium")
        
        // if returned decoded token is undefined
        if(!decodedToken){
            return res.status(403).send({status: false , msg: "Invalid authentication Token in request"})
        }
 
        // set decoded token value in request
        req.decodedToken = decodedToken
        next()
    } 
    catch(err) {
        return res.status(500).send({ status: false, msg: err.message });
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
        if(!blog || blog.isDeleted == true){
            return res.status(404).send({status: false , msg: "Document Not Found"})
        }
        
        let decodedToken = req.decodedToken
        // perform Authorization
        if(decodedToken.authorId != blog.authorId)
            return res.status(401).send({  error: 'Author is not allowed to perform this task'})
    
        next()
    } 
    catch(err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports.authentication = authentication
module.exports.authorisation = authorisation