var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
var path = require("path");
var router = require("./router");

var db = {};

MongoClient.connect("mongodb://localhost:27017/flymeet", function(err, database) {
    if(err){
        throw err;
    } else {
    console.log("connected!");
        db = database;
    }
});

var app = express();
app.set("port",80);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, "../static")));


app.use(function(req,res,next){
  console.log("Query recieved");
  req.db = db;
  next();
});


app.use("/",router);

app.listen(app.get("port"),function(err){
    if(err) throw err;
    console.log("Server running on port "+app.get("port"));
});

