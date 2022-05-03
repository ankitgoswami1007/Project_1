const blogModel = require('../models/blogModel')
const authorModel = require('../models/authorModel')
const mongoose = require('mongoose');
const { query } = require('express');
const ObjectId = mongoose.Types.ObjectId

//--- function to check every element of Array TAGS to be string 
const check = function(x) {
    return x.every(i => (typeof i === "string"));
}

const validData = ( obj,arr,arr2) => {
    
    for ( let i=0;i<arr.length;i++)
    {
       
        if (typeof obj[arr[i]]!= "string" || typeof obj[arr[i]]!= 'undefined')
        return [false, arr[i]]
    }
    for ( let i=0;i<arr2.length;i++)
    {
        if (Array.isArray(obj[arr2[i]]) || typeof obj[arr2[i]] != 'undefined')
        return [false, arr2[i]]
    }
    return [true]
}




//------------ API for create blog for Author
const createBlog = async function (req , res) {

    
    try {
        
        let data = req.body

         // Validate the blog data is present or not
        if (Object.keys(data).length == 0) { 
            return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details"})
          }

          // Validate that authorid is coming or not in blog
          if (data.authorId.length==0) {
            return res.status(400).send({ status: false, msg: "Please Provide Blog Author Id"})
        }
        data.authorId = data.authorId.trim()
        // Validate the authorId
        if(!ObjectId.isValid(data.authorId)) {
            return res.status(400).send({status: false , msg:"Invalid Author-Id"})
         }

         // authorization
         let decodedToken =  req.decodedToken
        if( data.authorId != decodedToken.authorId ){
            return res.status(401).send({status: false , msg: "Author is Different, unauthorized"})
        }
       
          const dv = /[a-zA-Z]/;
        // Validate the title in blog
        if ( data.title.length==0 || !dv.test(data.title)) {
            return res.status(400).send({ status: false, msg: "Please Provide Blog Title"})
        }

        // Validate the Body in blog
        if ( data.body.length==0 || !dv.test(data.body)) { 
            return res.status(400).send({ status: false, msg: "Please Provide Blog's Body"})
        }

        // Validate the Category in Blog
        if (data.category.length == 0 || !dv.test(data.category)) {
            return res.status(400).send({ status: false, msg: "Please Provide Blog category"})
        }
        data.category = data.category.toLowerCase().trim()
        
        // Validate the Tags in Blog
        if( data.tags != undefined && check(data.tags) == false){
            return res.status(400).send({ status: false, msg: "Please Provide Valid Tags"})
        }
       
        // Validate the Subcategory in Blogs
        if( data.subcategory != undefined &&  check(data.subcategory)== false){
            return res.status(400).send({ status: false, msg: "Please Provide Valid Subcategory"})
        }
        // for removing white space and empty string in tags or subcategory
        for (let key in data) {
            if (Array.isArray(data[key])) {
                let arr=[];
                for (let i = 0; i < data[key].length; i++) {
                        if(data[key][i].trim().length>0)
                    arr.push(data[key][i].toLowerCase().trim())
                }
                data[key] = [...arr];
            }
        }
        
        // checking that author is present in AuthorModel or not
        let authorId = await authorModel.findById(data.authorId)
        
        if(!authorId) {
            return res.status(400).send({status: false , msg:"Invalid Author-Id"})   
        }
        // add the date if isPublished is true
        if(data.isPublished == true){
            data.publishedAt =  new Date().toISOString()
        }
        // creating blog document for the valid author 
        let blog = await blogModel.create(data)
        res.status(201).send({status: true , data: blog})
        
           
    } 
    catch (err) {
        res.status(500).send({status: false , error: err.message})
    } 

   
}


const getBlogs = async function (req , res) {
    try{
        
        
        let queryData = req.query
        
        
        
        if (Object.keys(queryData).length == 0) { 
        
            let blogInfo = await blogModel.find({isPublished: true , isDeleted: false})
            if(!blogInfo){
                return res.status(404).send({status: false , msg:"Document not found"})
            }
            return res.status(200).send({status: true , data:blogInfo})
          }

          //   check if filters have these attributes 
          // checking that any of these filter is not present then user is not allowed to get the data
        if(!(queryData.authorId || queryData.category || queryData.tags || queryData.subcategory ) ){
            return res.status(400).send( {status: false , msg: "Invalid Filters"})
        }

        let valid = validData( queryData , ['category'],[ 'tags', 'subcategory'])
        if(valid[0] == false){
            return res.status(400).send({status:false , msg: valid[1] + " is not a valid value"  })
        }

        // perform  Authorization
        let decodedToken =  req.decodedToken
        if(queryData.authorId != undefined && queryData.authorId != decodedToken.authorId ){
            return res.status(401).send({status: false , msg: "Author is Different, unauthorized"})
        }
        if(queryData.authorId == undefined) queryData.authorId =  decodedToken.authorId
        
        // removing extra fields from query param which we do not need
        if(req.query.title && !req.query.body) delete req.query.title
        else if(req.query.body && !req.query.title) delete req.query.body
        else if(req.query.title && req.query.body){
            delete req.query.title
            delete req.query.body
        }

        queryData = req.query
       
        // Validate the authorId
        if(queryData.authorId && !(ObjectId.isValid(queryData.authorId))){
            return res.status(400).send( {status: false, msg: 'AuthorId is Invalid'})
        }
        
        if(queryData.authorId ){ 
             let authorId = await authorModel.findById(queryData.authorId)
             if(!authorId) {
                return res.status(404).send({status: false , msg:"Author not Found"})   
            }
        }
            // converting given fields to the proper format

            // remove the space in category and save in lowecase
            if(queryData.category){
                queryData.category = queryData.category.toLowerCase().trim()
            }

            // remove the space in tags and save in lowercase
            if(typeof queryData.tags == 'string') queryData.tags = queryData.tags.toLowerCase().trim()
              // remove the space in subcategory and save in lowercase
            if(typeof queryData.subcategory == 'string') queryData.subcategory = queryData.subcategory.toLowerCase().trim()

            for (let key in queryData) {
                if (Array.isArray(queryData[key])) {
                    let arr=[];
                    for (let i = 0; i < queryData[key].length; i++) {
                            if(queryData[key][i].trim().length>0)
                        arr.push(queryData[key][i].toLowerCase().trim())
                    }
                    queryData[key] = [...arr];
                    queryData[key] = {'$all': queryData[key]}
                }
            }

            
          //console.log(queryData)
             //  check if blog is not deleted and it is published
            queryData.isDeleted = false
            queryData.isPublished = true

            // fetching data from database called blogs
            const blogData = await blogModel.find(queryData)
           // console.log(blogData);
            if(blogData.length == 0){
                return res.status(404).send({status: false , msg: 'Document Not Found'})
            } 
            return res.status(200).send({status: true , Data: blogData})
        

    }
    catch(err){
        res.status(500).send({status: false , error: err.message})
    } 
    
}

const updateBlogs = async function ( req , res) {
    try {
        let blog = req.body

         // Validate that filter is present in request query  or not
        if (Object.keys(blog).length == 0) { 
            return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details"})
          }

        //   check if filters have these attributes 
        // checking that any of these filter is not present then user is not allowed to get the data
        if(! (blog.title || blog.body || blog.tags || blog.subcategory || blog.isPublished) ){
            return res.status(400).send( {status: false , msg: "Invalid Filters"})
        }
        // taking blog id from path param
        let blogId = req.params.blogId

       
        
        // checking that blog data is present or not in database called blogs
        let blogData = await blogModel.findById(blogId)
        
         // converting given tags Array and subcategory array elements into proper format
        for (let key in blog) {
            if (Array.isArray(blog[key])) {
                let arr=[];
                for (let i = 0; i < blog[key].length; i++) {
                        if(blog[key][i].trim().length>0)
                    arr.push(blog[key][i].toLowerCase().trim())
                }
                blog[key] = [...arr];

            }
        }
        //  checking if blog is published or not
        // checking that request body's published property is true and database document published is false
        if(blogData.isPublished == false && blog.isPublished == true){
            blogData.isPublished = true
            blogData.publishedAt = new Date().toISOString()
        }
        await blogData.save()
        // updating attributes values in blog database
        let updatedBlog = await blogModel.findByIdAndUpdate( {_id : blogId},
                {$addToSet : {tags : blog.tags , subcategory: blog.subcategory} , $set : {title: blog.title , body: blog.body }},
                {new : true}
            )
        // sending the data as a response to the user
            return res.status(200).send({status: true , updatedData: updatedBlog})
            
            
    } catch (err) {
        res.status(500).send({status: false , error: err.message})  
    }
}

const deleteByBlogId = async function ( req , res){
    try {
        let blogId = req.params.blogId
       

        //checking that given blog id is exist or not in blog's database
        let blogData =  await blogModel.findById(blogId)
        // if(!blogData || blogData.isDeleted == true){
        //     res.status(404).send({status: false , msg: "Data Not Found"})
        // }


      // set isDeleted to true and set the deleted at with current date
        blogData.isDeleted = true
        blogData.deletedAt = new Date().toISOString()
        await blogData.save()
        res.status(200).send({ status: true , msg:"Document is Successfully Deleted"})

           
    } catch (err) {
        res.status(500).send({status: false , error: err.message}) 
    }
}




const deleteByQuery = async function (req, res) {
    try {
        

        // perform authorization with valid author id
        let queryData = req.query
        let decodedToken = req.decodedToken
        if(queryData.authorId && decodedToken.authorId != queryData.authorId ){
            return res.status(401).send({status: false , msg: "Author is not allowed to perform this task"})
        } 
        
        queryData.authorId = decodedToken.authorId 
        
        //   check if filters have these attributes 
        if (!(queryData.category || queryData.authorId || queryData.tags || queryData.subcategory)) {
            return res.status(400).send({ status: false, msg: "Invalid Request...." })
        }

         // Validate the authorId
        if (queryData.authorId && !(ObjectId.isValid(queryData.authorId))){
            return res.status(400).send( {status: false, msg: 'AuthorId is Invalid'})
        }

        // checking author is present or not in author model
        if(queryData.authorId){
            let authorId = await authorModel.findById(queryData.authorId)
            if(!authorId) {
                return res.status(404).send({status: false , msg:"Author not Found"})   
            }
        }
        // converting given fields to the proper format
        if(queryData.category){
            queryData.category = queryData.category.toLowerCase().trim()
        }

        if(typeof queryData.tags == 'string') queryData.tags = queryData.tags.toLowerCase().trim()
        if(typeof queryData.subcategory == 'string') queryData.subcategory = queryData.subcategory.toLowerCase().trim()


        for (let key in queryData) {
            if (Array.isArray(queryData[key])) {
                let arr=[];
                for (let i = 0; i < queryData[key].length; i++) {
                        if(queryData[key][i].trim().length>0)
                    arr.push(queryData[key][i].toLowerCase().trim())
                }
                queryData[key] = [...arr];
                queryData[key] = {'$all': queryData[key]}
            }
        }

    
        
        // set isDeleted to true and set the deleted at with current date
      let deletedDate = new Date().toISOString()
      queryData.isDeleted = false
      let data1 = await blogModel.updateMany(queryData, { isDeleted: true, deletedAt: deletedDate }, { new: true })
    
      if(data1.matchedCount == 0){
          return res.status(404).send( {status: false , msg: 'No match found'})
      }
      return res.status(200).send({ status: true, msg: "Document is Successfully Deleted" })
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  }



module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlogs = updateBlogs
module.exports.deleteByBlogId = deleteByBlogId
module.exports.deleteByQuery = deleteByQuery



// for remove white space var arr = ['Apple', '  ', 'Mango  man', '', '    Banana     ', ' ', '     Strawberry'];
// const helper =arr=>arr.join().split(/\s|,/).filter(Boolean);
// console.log(helper(arr))