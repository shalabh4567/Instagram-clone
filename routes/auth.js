const express = require("express");
const router = express();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin");
const nodemailer = require("nodemailer");
const sendgridtransport = require("nodemailer-sendgrid-transport");
const { SEND_GRID, EMAIL, SEND_MAILID } = require("../config/keys");


const transporter = nodemailer.createTransport(
  sendgridtransport({
    auth: {
      api_key: SEND_GRID,
    },
  })
);

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
          pic,
        });
        user
          .save()
          .then((user) => {
            console.log(user.email);
            transporter.sendMail(
              {
                to: user.email,
                from: {
                  name: "Instagramclone",
                  address: SEND_MAILID,
                },
                subject: "Signup Success",
                html: "<h1>Welcome to instagram</h1>",
              },
              (err, res) => {
                if (err) {
                  console.log(err);
                }
                console.log(res);
              }
            );

            res.status(200).json({ message: "saved succesfully" });
          })
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
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(442).json({ error: "Wrong email Id  or password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          const { _id, name, email, followers, following, pic } = savedUser;
          token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          res.json({
            token,
            user: { _id, name, email, followers, following, pic },
          });
        } else {
          return res.status(442).json({ error: "Wrong email Id  or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post("/reset-password", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "User dont exist with that email" });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        transporter.sendMail(
          {
            to: user.email,
            from: {
              name: "Instagramclone",
              address: SEND_MAILID,
            },
            subject: "password reset",
            html: `
            <p>you requested for password reset</p>
            <h5>Click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
            `,
          },
          (err, res) => {
            if (err) {
              console.log(err);
            }
            console.log(res);
          }
        );
        res.json({ message: "Check your mail" });
      });
    });
  });
});

router.post("/new-password", (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "try again session expired!" });
      }
      bcrypt.hash(newPassword, 12).then((hashedPassword) => {
        (user.password = hashedPassword),
          (user.resetToken = undefined),
          (user.expireToken = undefined);
        user.save().then((savedUser) => {
          res.json({ message: "password updated successfully" });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
