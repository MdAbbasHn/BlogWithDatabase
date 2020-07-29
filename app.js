//jshint esversion:6
/* jshint devel: true */
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
require('dotenv').config();
const app = express();
var mainUserId = "";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:"RandomwEirdSenTEnce",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
//connecting mongodb
mongoose.connect(process.env.DBURL,{useNewUrlParser:true,useUnifiedTopology:true, useFindAndModify: false });
mongoose.set("useCreateIndex",true);


const postSchema = new mongoose.Schema({
  title: {
    type:String,
    required:true
  },
  content: {
    type:String,
    required:true
  }
});

const bloguserSchema = new mongoose.Schema({

  fName: {
    type:String,
    required:true
  },
  lName:{
    type:String,
    required:true
  },
  fullName:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true,
    unique:true,
    minlength:4,
    maxlength:10,
    trim:true
  },
  password:{
    type:String
  },
  answer:
    {
      type:String,
      required:true
    },
  blogs: [postSchema],
});
bloguserSchema.plugin(passportLocalMongoose);

const BlogUser = mongoose.model("BlogUser",bloguserSchema);
const Post = mongoose.model("Post",postSchema);

passport.use(BlogUser.createStrategy());

passport.serializeUser(BlogUser.serializeUser());
passport.deserializeUser(BlogUser.deserializeUser());

const homeStartingContent = "Convert your thoughts into words. Update and delete them whenever you feel like. Press Compose to start!";
const nohomeStartingContent = "Welcome to the Blog Journal web app! Convert your thoughts into words. Update and delete them whenever you feel like. Press Login to start your journey!!";

app.get("/", function(req, res){
  if(req.isAuthenticated()){
    res.render("homelogged",{
      startingContent: homeStartingContent
    });
  }
  else{
    res.render("home",{
      startingContent: nohomeStartingContent
    });
  }

 });
 app.post("/", (err,res) =>{
   res.render("home",{startingContent: homeStartingContent,userId: req.body.userId});
 });
 app.get("/signup",(req,res) => {
   res.render("signup",{taken:"",suguser:"",fName:req.body.fName,lName:req.body.lName});
 });

 app.post("/signup",(req,res) => {
   BlogUser.findOne({username:req.body.username},(err,user) => {
     if(err){
       res.redirect("/signup");
       console.log(err);
     }
     else{
       if(!user){
          res.render("securityq",{username:req.body.username,fName:req.body.fName,lName:req.body.lName,password:req.body.password});

         }
         else{
           res.render("signup",{taken:"Username has already been taken",suguser:"",fName:req.body.fName,lName:req.body.lName});
         }
       }

       }
     );
});

app.post("/securityq",(req,res) => {
              BlogUser.register({
               fName:req.body.fName,
               lName:req.body.lName,
               fullName:req.body.fName + " " + req.body.lName,
               username:req.body.username,
               answer:req.body.answer},req.body.password,function(err,user){
                 if(!err){
                     res.render("login",{invalidpass:""});
                   }
                 else{

                   res.render("signup",{taken:"Username length needs to be between 4 and 10",suguser:"",fName:req.body.fName,lName:req.body.lName});
                    }
               });
});

 app.get("/login",(req,res) => {
   if(req.isAuthenticated()){
     res.redirect("/blogposts");
   }
   else{
   res.render("login",{invalidpass:""});
 }
 });
app.get("/faillogin",(req,res) =>{
  if(req.isAuthenticated()){
    res.redirect("/login");
  }
  else{
    res.render("login",{invalidpass:"Invalid Username / Password"});
  }
});

 app.post("/login",(req,res) => {
          const user = new BlogUser({
            username:req.body.username,
            password:req.body.password
          });
          req.login(user,(err) =>{
            if(err){
              console.log(err);
              res.redirect("/login");
            }
            else{
              passport.authenticate("local",{failureRedirect: "/faillogin"})(req,res,function(){
                BlogUser.findOne({username:req.body.username},(err,foundUser) =>{
                  if(err){
                    console.log(err);
                    return res.render("login",{invalidpass:"Invalid Username / Password"});
                  }
                  else{
                    if(foundUser){
                      mainUserId = foundUser._id;
                      res.redirect("/blogposts");
                    }
                    else{
                      return res.render("login",{invalidpass:"Invalid Username / Password"});
                    }
                  }
                });
              });
            }
          });
        });

app.get("/blogposts",(req,res) =>{
  if(req.isAuthenticated()){
    BlogUser.findOne({_id:mainUserId},(err,user) => {
      if(err){
        console.log(err);
      }
      else{
        if(user){
          res.render("blogposts",{userId:user._id,posts:user.blogs});
        }
        else{
          res.redirect("/login");
        }

      }
    });

  }
  else{
    res.redirect("/login");
  }
});



app.get("/logout",(req,res) => {
  mainUserId = "";
  req.logout();
  res.redirect("/");
});

app.get("/compose", function(req, res){
  if(req.isAuthenticated()){
    res.render("compose",{userId:mainUserId});
  }
  else{
    res.redirect("/login");
  }

});

app.post("/save",function(req,res){
  const mainId= req.body.postId;
  if(req.body.origContent === req.body.updatedContent){
    res.redirect("/posts/"+ mainId );
  }
  else{
    Post.updateOne({_id:mainId},{content: req.body.updatedContent},function(err,data){
      BlogUser.findOneAndUpdate({ _id : mainUserId, "blogs._id" : mainId },{$set:{"blogs.$.content": req.body.updatedContent}},(err) =>
    {
      if(err){
        console.log(err);
        res.redirect("/posts/"+ mainId );
      }
      else{
        res.redirect("/posts/"+ mainId );
      }
    });


    });
  }
});
app.post("/update", function(req,res){
  if(req.isAuthenticated()){
    res.render("update",{title:req.body.updateTitle,content: req.body.updateContent,_id: req.body.updateId});
  }
  else{
    res.redirect("/login");
  }

});

app.post("/compose", function(req, res){
  if(req.isAuthenticated()){
    BlogUser.findOne({_id:req.body.userId},function(err,foundUser){
      if(!err){
        if(foundUser){
          const post = new Post({
            title: req.body.postTitle,
            content: req.body.postBody
          });
          post.save((err) => {
            if(!err){
              console.log("Success");
            }
            else{
              console.log("Failed");
            }
          });
          foundUser.blogs.push(post);
          foundUser.save((err) => {
            if(!err){
              console.log("Success");
            }
            else{
              console.log("Failed");
            }
          });
          res.redirect("/blogposts");
        }
        else{
          res.redirect("/");
        }
      }
    });
  }
  else{
    res.redirect("/login");
  }



});

app.get("/posts/:postId", function(req, res){
  if(req.isAuthenticated()){
    const requestedId = req.params.postId;
    Post.findOne({_id:requestedId},function(err,foundPost){
      res.render("post",{_id:foundPost._id,title:foundPost.title,content:foundPost.content});

    });
  }
  else{
    res.redirect("/login");
  }


});

app.post("/delete",function(req,res){
  if(req.isAuthenticated()){
    const deletedId = req.body.deletedItem;
    Post.deleteOne({_id:deletedId},function(err){
      if(err){
        console.log(err);
      }
    });
    BlogUser.findOneAndUpdate({_id:mainUserId},{$pull:{blogs:{_id:deletedId}}},function(err,foundList){
    if(!err){
      res.redirect("/blogposts");
    }
    else{
      console.log(err);
    }
  });
  }
  else{
    res.redirect("/login");
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
