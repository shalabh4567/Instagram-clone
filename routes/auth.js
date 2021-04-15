const express = require("express");
const router = express();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} =require("../config/keys")
const requireLogin = require("../middleware/requireLogin")

router.post("/signup", (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: "Please provide all the fields" });
  }

  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "User already exists with that email" });
      }
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          email,
          password: hashedPassword,
          name,
          pic
        });
        user
          .save()
          .then(res.status(200).json({ message: "saved succesfully" }))
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });

  //console.log(req.body)
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(442).json({ error: "please provide both the fields" });
  }
  User.findOne({ email: email })
  .then((savedUser) => {
    if (!savedUser) {
      return res.status(442).json({ error: "Wrong email Id  or password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          const {_id, name, email,followers,following,pic} = savedUser
          token = jwt.sign({_id: savedUser._id}, JWT_SECRET)
          res.json({token, user: {_id, name, email, followers,following,pic}})
        } else {
          return res.status(442).json({ error: "Wrong email Id  or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

module.exports = router;
