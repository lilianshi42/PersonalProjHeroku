/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: ___Lilian Shi________ Student ID: __109261206____ Date: ___02/18/2021___
 *
 *  Online (Heroku) Link: __https://lilianshi-web-project.herokuapp.com/___
 *
 ********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer"); //for images
const bodyParser = require("body-parser"); //non-images
const exphbs = require("express-handlebars"); //use handlebars
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

//for handlebars
app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      /*This helper allows us to replace all of our existing navbar links, 
      ie: <li><a href="/about">About</a></li> with code that looks like this 
      {{#navLink "/about"}}About{{/navLink}}. */
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      /*This helper will give us the ability to evaluate conditions for equality, 
      ie {{#equals "a" "a"}} … {{/equals}} will render the contents */
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", ".hbs");

app.use(express.static("/public"));
app.use("/public/css", express.static(__dirname + "/public/css"));
app.use("/public/images", express.static(__dirname + "/public/images"));

app.use(bodyParser.urlencoded({ extended: true }));
//add the property "activeRoute" to "app.locals" whenever route changes
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/about", function (req, res) {
  res.render("about");
});

//updated route to support optional filters
app.get("/employees", function (req, res) {
  const status = req.query.status;
  const department = req.query.department;
  const manager = req.query.manager;
  try {
    if (status)
      dataService.getEmployeesByStatus(status).then((data) => {
        res.render("employees", { employees: data });
      });
    else if (department)
      dataService.getEmployeesByDepartment(department).then((data) => {
        res.render("employees", { employees: data });
      });
    else if (manager)
      dataService.getEmployeesByManager(manager).then((data) => {
        res.render("employees", { employees: data });
      });
    else
      dataService.getAllEmployees().then((data) => {
        res.render("employees", { employees: data });
      });
  } catch (error) {
    res.render({ message: "no results" });
  }
});

//get the "/employee/value" route, returns employee whose employeeNum matches value
app.get("/employee/:value", function (req, res) {
  try {
    dataService.getEmployeeByNum(req.params.value).then((data) => {
      res.render("employee", { employee: data });
    });
  } catch (error) {
    res.render("employee", { message: "no results" });
  }
});

app.get("/departments", function (req, res) {
  try {
    dataService.getDepartment().then((data) => {
      res.render("departments", { departments: data });
    });
  } catch (error) {
    console.log(error);
  }
});

//once employee data is updated, it will show all the data from form
app.post("/employee/update", (req, res) => {
  try {
    dataService.updateEmployee(req.body).then(() => {
      res.redirect("/employees");
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
    else res.render("images", { images: files });
  });
});

//add employees
app.get("/employees/add", function (req, res) {
  res.render("addEmployee");
});
app.post("/employees/add", function (req, res) {
  dataService.addEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

//add images
app.get("/images/add", function (req, res) {
  res.render("addImage");
});
app.post("/images/add", upload.single("imageFile"), function (req, res) {
  res.redirect("/images");
});

//404 page
app.use((req, res) => {
  res.status(404).render("404page", { layout: false });
});

dataService
  .intialize()
  .then(() => {
    app.listen(HTTP_PORT, onHTTPStart);
  })
  .catch((error) => {
    console.log(error);
  });
