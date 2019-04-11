const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();



// body-parser middleware
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// 加载model
require('../models/User');
const User = mongoose.model("users");

// users login & register
router.get("/login",(req,res) => {
  res.render("users/login");
})


router.post("/login",urlencodedParser,(req,res,next) => {
  passport.authenticate('local', {
    successRedirect:'/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
  // // 查询数据库
  // User.findOne({email:req.body.email})
  //     .then((user) => {
  //       if(!user){
  //         req.flash("error_msg","用户不存在!");
  //         res.redirect("/users/login");
  //         return;
  //       }

  //       // 密码验证
  //       bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
  //         if(err) throw err;

  //         if(isMatch){
  //           req.flash("success_msg","登录成功!");
  //           res.redirect("/ideas");
  //         }else{
  //           req.flash("error_msg","密码错误!");
  //           res.redirect("/users/login");
  //         }
  //       });
  //     })
})


router.get("/register",(req,res) => {
  res.render("users/register");
})

router.post("/register",urlencodedParser,(req,res) => {
  // console.log(req.body);
  // res.send("register");
  let errors = [];

  if(req.body.password != req.body.password2){
    errors.push({
      text:"两次的密码不一致!"
    })
  }

  if(req.body.password.length < 4){
    errors.push({
      text:"密码的长度不能小于4位!"
    })
  }

  if(errors.length > 0){
    res.render('users/register',{
      errors:errors,
      name:req.body.name,
      email:req.body.email,
      password:req.body.password,
      password2:req.body.password2
    })
  }else{
    

    User.findOne({email:req.body.email})
      .then((user) => {
        if(user){
          req.flash("error_msg","邮箱已经存在, 请更换邮箱注册~!");
          res.redirect("/users/register");
        }else{
          const newUser = new User({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password
          })

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                .then((user) => {
                  req.flash("success_msg","账号注册成功!");
                  res.redirect("/users/login")
                }).catch((err) => {
                  req.flash("error_msg","账号注册失败!");
                  res.redirect("/users/register")
                });
            });
          });
          
        }
      })

    
  }
})


// Logout User
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', '退出登录成功');
  res.redirect('/users/login');
});



module.exports = router;