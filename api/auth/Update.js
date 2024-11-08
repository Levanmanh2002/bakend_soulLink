const express = require('express');
const router = express.Router();

// mongodb user model
const User = require("../../models/user");

// env variables
require('dotenv').config();

router.post('/profile', (req, res) => {
    let update = {
        name: req.body.name,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        sex: req.body.sex
    }
    User.findByIdAndUpdate(req.body.id, update, { new: true, useFindAndModify: false })
        .then((result) => {
            if (result) {
                res.json({
                    status: "SUCCESS",
                    message: "Update successful",
                    data: result
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid update entered!"
                })
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while saving user account!"
            })
        })

})

module.exports = router;