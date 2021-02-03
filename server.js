var express = require("express");
var app = express();
var path = require("path");
var dataService = require('./data-service.js');


var HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart(){
    console.log("Express http server listening on port " + HTTP_PORT);
}

app.use(express.static('public')); 
 
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
    res.status(404).send("404 Page Not Found");
});


dataService.intialize()
    .then(()=>{
        app.listen(HTTP_PORT, onHTTPStart)
    })
    .catch((error)=>{
    console.log(error);
});
  