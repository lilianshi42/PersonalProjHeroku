/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: ___Lilian Shi________ Student ID: __109261206____ Date: ___02/14/2021___
 *
 *  Online (Heroku) Link: __https://lilianshi-web-project.herokuapp.com/___
 *
 ********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer"); //for images
const bodyParser = require("body-parser"); //non-images
const dataService = require("./data-service.js");
const fs = require("fs");

const HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart() {
  console.log("Express http server listening on port " + HTTP_PORT);
}

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    // we write the filename as the current date down to the millisecond
    // in a large web service this would possibly cause a problem if two people
    // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
    // this is a simple example.
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

app.use(express.static("/public"));
app.use("/public/css", express.static(__dirname + "/public/css"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

//updated route to support optional filters
app.get("/employees", function (req, res) {
  const status = req.query.status;
  const department = req.query.department;
  const manager = req.query.manager;
  try {
    if (status)
      dataService.getEmployeesByStatus(status).then((data) => {
        res.json(data);
      });
    else if (department)
      dataService.getEmployeesByDepartment(department).then((data) => {
        res.json(data);
      });
    else if (manager)
      dataService.getEmployeesByManager(manager).then((data) => {
        res.json(data);
      });
    else
      dataService.getAllEmployees().then((data) => {
        res.json(data);
      });
  } catch (error) {
    console.log(error);
  }
});

//get the "/employee/value" route, returns employee whose employeeNum matches value
app.get("/employee/:value", function (req, res) {
  try {
    dataService.getEmployeeByNum(req.params.value).then((data) => {
      res.json(data);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/managers", function (req, res) {
  try {
    dataService.getManagers().then((data) => {
      res.json(data);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/departments", function (req, res) {
  try {
    dataService.getDepartment().then((data) => {
      res.json(data);
    });
  } catch (error) {
    console.log(error);
  }
});

//get images
/* This route will return a JSON formatted string (res.json()) consisting of a single "images" property, 
which contains the contents of the "./public/images/uploaded" directory as an array */
app.get("/images", function (req, res) {
  fs.readdir("./public/images/uploaded", function (err, files) {
    if (err) console.log(err);
    else res.json({ images: files });
  });
});

//add employees
app.get("/employees/add", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});
app.post("/employees/add", function (req, res) {
  dataService.addEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

//add images
app.get("/images/add", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/addImage.html"));
});
app.post("/images/add", upload.single("imageFile"), function (req, res) {
  res.redirect("/images");
});

//404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404page.html"));
});

dataService
  .intialize()
  .then(() => {
    app.listen(HTTP_PORT, onHTTPStart);
  })
  .catch((error) => {
    console.log(error);
  });
