//jshint esversion:6
/* jshint devel: true */
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
require('dotenv').config();
//connecting mongodb
mongoose.connect(process.env.DBURL,{useNewUrlParser:true,useUnifiedTopology:true});

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

const Post = mongoose.model("Post",postSchema);



const homeStartingContent = "Welcome to your Blog Journal! Here you can write your thoughts into words. Update and delete them whenever you feel like. Press Compose to start!";
const aboutContent = "This app was made by me, Mohammed Abbas Hussain currently pursuing my Engineering in the field of Information Technology. I am currently practicing Web Development and how the fromt-end and back-end is done. This website was made using : HTML,CSS,NodeJS,Express,MongoDB(with mongoose). The aim of this website was to practice in databases, rather than UI Design or JS";
const contactContent = "You can mail me here:";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){
 Post.find(function(err,posts){
   res.render("home",{
     startingContent: homeStartingContent,
     posts:posts,
     });
   });
 });


app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/save",function(req,res){
  const mainId= req.body.postId;
  console.log(req.body.updatedContent + "hiii");
  if(req.body.origContent === req.body.updatedContent){
    console.log(req.body.updatedContent + "hiii");
    res.redirect("/posts/"+ mainId );
  }
  else{
    Post.updateOne({_id:mainId},{content: req.body.updatedContent},function(err,data){
      console.log(req.body.updatedContent+"hiiii");
      console.log(mainId);
      res.redirect("/posts/"+ mainId );//
    });
  }
});
app.post("/update", function(req,res){
  res.render("update",{title:req.body.updateTitle,content: req.body.updateContent,_id: req.body.updateId});
});

app.post("/compose", function(req, res){
Post.findOne({title:req.body.postTitle},function(err,foundPost){
  if(!err){
    if(!foundPost){
      const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody
      });
      post.save();
      res.redirect("/");
    }
    else{
      res.render("home",{startingContent: homeStartingContent,posts:foundPost});
    }
  }
});


});

app.get("/posts/:postId", function(req, res){
  const requestedId = req.params.postId;

  Post.findOne({_id:requestedId},function(err,foundPost){
    res.render("post",{_id:foundPost._id,title:foundPost.title,content:foundPost.content});

  });

});

app.post("/delete",function(req,res){
  const deletedId = req.body.deletedItem;
  console.log(deletedId);
  Post.deleteOne({_id:deletedId},function(err){
    res.redirect("/");
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
