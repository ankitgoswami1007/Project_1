const mongoose = require('mongoose');



const internSchema = new mongoose.Schema ({

    name: {
        type: String,
        trim: true,
        required: "Student Name is Required",
    },

    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: "Email address is Required",
        validate: {
            validator: function(email) {
                return  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
            }, message: 'Please fill a valid email address', isAsynic: false

        }

    },

    mobile: {
        type: String,
        required: "Mobile Number is Required",
        unique: true,
        trim: true,
        validate: {
            validator: function (mobile) {
                return /^([+]\d{2}[ ])?\d{10}$/.test(mobile)
              }, msg: "Please enter 10 digit number", isAsync: false,

        },
        
    },
    collegeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref : 'College',
        required: "Student's College Name is Required ",
        trim: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
    

}, { timestamps : true})

module.exports = mongoose.model("Intern", internSchema);

//name: {mandatory}, email: {mandatory, valid email, unique}, 
//mobile: {mandatory, valid mobile number, unique}, 
//collegeId: {ObjectId, ref to college model, 
//isDeleted: {boolean, default: false}