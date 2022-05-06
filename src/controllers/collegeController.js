const collegeModel = require('../models/collegeModel');
const internModel = require('../models/internModel')
const jwt = require('jsonwebtoken');
const { find } = require('../models/collegeModel');


const isValid = function(value) {
    
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    
    return true
 }

 const isValid2 = function(value) {
    const dv = /[a-zA-Z]/;
    if(typeof value !== 'string') return false
    if(dv.test(value)=== false) return false
    return true
 }


 const isValidRequestBody = function(requestBody) {
     return Object.keys(requestBody).length > 0
 }

 const isValidURL = function(url) {
    return  (/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gmi).test(url.trim())
 }

 const createCollege = async function (req, res){
     try {
         const requestBody = req.body
         if(!isValidRequestBody(requestBody)){
             return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide college details'})
         }
         const {name, fullName, logoLink, isDeleted } = requestBody // Object Destructing

         if(!isValid(name)) {
             res.status(400).send({status: false, message: 'Name is required'})
             return
         }

         if(!isValid2(name)) {
            res.status(400).send({status: false, message: 'Name is not a valid name'})
            return
        }

        if(name !== name.toLowerCase()){
            res.status(400).send({status: false, message: 'Name should be in lowerCase only'})
            return
        }

        if (name.split(' ').length > 1) {
            res.status(400).send({status: false, message: 'Please provide the valid Abbreviation'})
            return
        }

         if(!isValid(fullName)) {
             res.status(400).send({status: false, message: 'College name is required!!!'})
             return
         }

         if(!isValid2(fullName)) {
            res.status(400).send({status: false, message: 'College name is not a valid name!!!'})
            return
        }

         if(!isValid(logoLink)) {
            res.status(400).send({status: false, message: 'LogoLink is required!!!'})
            return
         }

         if(!isValid2(logoLink)) {
            res.status(400).send({status: false, message: 'LogoLink is not a valid link'})
            return
         }

         if(!isValidURL(logoLink)) {
            res.status(400).send({status: false, message:  `${logoLink} --> is not a valid link`})
            return
         }

         const duplicateLogo = await collegeModel.findOne({logoLink: logoLink})
         if(duplicateLogo){
                 res.status(400).send( {status: false, message: 'The logo link which you have entered belongs to some other college'})
                 return
         }

         let duplicateData = await collegeModel.find();
         if(duplicateData.length != 0 ){

            const duplicateAbbrev = await collegeModel.findOne({name: name})
            if(duplicateAbbrev){
                res.status(400).send({status: false , message:'Name already Exist'})
                return
            }

            const duplicateFullName = await collegeModel.findOne({fullName: fullName})
            if(duplicateFullName){
                res.status(400).send({status: false , message:'College FullName is already Exist'})
                return
            }
         }
         

         if (isDeleted === true) {
            return res.status(400).send({ status: false, msg: "New Entries can't be Deleted" });
        }

         const collegeData = {name, fullName, logoLink} 

         let newCollege = await collegeModel.create(collegeData)
         res.status(201).send({status: true, message: 'College created Successfully', data: newCollege })

     } 
     catch (err) {
         res.status(500).send({status: false , error: err.message})
     }
 }



 const getCollegeDetails = async function (req, res) {
    try {

    let name1 = req.query.collegeName

    // if(isValidRequestBody(req.query)){
    //     return res.status(400).send({status: false , message:'Please provide valid filter'})
    // }
    
    if(!isValid(name1)) {
        res.status(400).send({status: false, message: 'College Name is required'})
        return
    }

    if(!isValid2(name1)) {
       res.status(400).send({status: false, message: 'College Name is not a valid name'})
       return
   }

   if(name1 !== name1.toLowerCase()){
       res.status(400).send({status: false, message: 'College Name should be in lowerCase only'})
       return
   }

   if (name1.split(' ').length > 1) {
       res.status(400).send({status: false, message: 'Please provide the valid Abbreviation'})
       return
   }

   const college = await collegeModel.findOne({name: name1 , isDeleted: false})
   if(!college){
       return res.status(404).send({status:false , message:"College not found!!!!"})
   }
   const { name, fullName, logoLink } = college

   const interneeData = await internModel.find({collegeId: college._id, isDeleted: false }).select({name:1 , email:1 ,mobile:1})

   const finalData = { name: name, fullName: fullName, logoLink: logoLink, interns: interneeData.length  ? interneeData : {message: 'No one is applied for Internship in this college'}}
   return res.status(200).send({status: true , data: finalData })
   
        
    } 
    catch (err) {
        res.status(500).send({status: false , error: err.message})
    }

     
 }



module.exports.createCollege = createCollege
module.exports.getCollegeDetails = getCollegeDetails