const express = require('express');
const router = express.Router();

// mongodb user model
const User = require("../../models/user");

router.delete('/delete/:userId', (req, res) => {
  const userId = req.params.userId;

  User.findOneAndDelete({ userId: userId })
    .then((result) => {
      if (result) {
        res.status(201).json({
          status: "SUCCESS",
          message: "Account deleted successfully"
        });
      } else {
        res.status(400).json({
          status: "FAILED",
          message: "Invalid account ID"
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        status: "FAILED",
        message: "An error occurred while deleting the account"
      });
    });
});

module.exports = router;