/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Lilian Shi________ Student ID: __109261206____ Date: ___02/02/2021___
*
*  Online (Heroku) Link: _____https://young-bayou-38535.herokuapp.com/___________
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require("path");
var dataService = require('./data-service.js');


var HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart(){
    console.log("Express http server listening on port " + HTTP_PORT);
}

app.use(express.static('public')); 
app.use('/public/css', express.static(__dirname + '/public/css'));

 
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});
  
app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees", function(req, res){
    try {
        dataService.getAllEmployees().then((data)=>{
            res.json(data);
        })
    } catch (error) {
        console.log(error);
    }
});

app.get("/managers", function(req, res){
    try {
        dataService.getManagers().then((data)=>{
            res.json(data);
        })
    } catch (error) {
        console.log(error);
    }
});

app.get("/departments", function(req, res){
    try {
        dataService.getDepartment().then((data)=>{
            res.json(data);
        })
    } catch (error) {
        console.log(error);
    }
});

app.use((req, res) =>{
    res.status(404).sendFile(path.join(__dirname, "/views/404page.html"));
});

dataService.intialize()
    .then(()=>{
        app.listen(HTTP_PORT, onHTTPStart)
    })
    .catch((error)=>{
    console.log(error);
});
  