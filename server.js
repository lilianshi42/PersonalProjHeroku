/*********************************************************************************
 *  WEB322 – Assignment 05
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: ___Lilian Shi________ Student ID: __109261206____ Date: ___03/31/2021___
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
const clientSessions = require("client-sessions"); //add client-sessions library to the project -A6 NEW Parts
const dataService = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const fs = require("fs");

const HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart() {
  console.log("Express http server listening on port " + HTTP_PORT);
}

//helper middleware function
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
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

//Set up client-sessions - A6 NEW Parts
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

//conditionally hide/show elements to the user depending on whether they're currently logged in
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

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
app.get("/employees", ensureLogin, function (req, res) {
  const status = req.query.status;
  const department = req.query.department;
  const manager = req.query.manager;
  try {
    if (status)
      dataService.getEmployeesByStatus(status).then((data) => {
        res.render("employees", { employees: data }).catch((err) => {
          res.status(500).send("Unable to find employees");
        });
      });
    else if (department)
      dataService.getEmployeesByDepartment(department).then((data) => {
        res.render("employees", { employees: data }).catch((err) => {
          res.status(500).send("Unable to find employees");
        });
      });
    else if (manager)
      dataService.getEmployeesByManager(manager).then((data) => {
        res.render("employees", { employees: data }).catch((err) => {
          res.status(500).send("Unable to find employees");
        });
      });
    else
      dataService.getAllEmployees().then((data) => {
        res.render("employees", { employees: data }).catch((err) => {
          res.status(500).send("Unable to find employees");
        });
      });
  } catch (error) {
    res.render({ message: "no results" });
  }
});

app.get("/employee/:empNum", ensureLogin, function (req, res) {
  // initialize an empty object to store the values
  let viewData = {};

  dataService
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        viewData.employee = data; //store employee data in the "viewData" object as "employee"
      } else {
        viewData.employee = null; // set employee to null if none were returned
      }
    })
    .catch(() => {
      viewData.employee = null; // set employee to null if there was an error
    })
    .then(dataService.getDepartment)
    .catch((err) => {
      res.status(500).send("Departments Not Found");
    })
    .then((data) => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"

      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    })
    .then(() => {
      if (viewData.employee == null) {
        // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
      }
    })
    .catch((err) => {
      res.status(500).send("Unable to find employee");
    });
});

//once employee data is updated, it will show all the data from form
app.post("/employee/update", ensureLogin, function (req, res) {
  dataService
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((error) => {
      res.status(500).send("Unable to update employee");
    });
});

app.get("/employees/delete/:empNum", ensureLogin, function (req, res) {
  dataService
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => {
      res.redirect("/employees");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

// Department data
app.get("/departments", ensureLogin, function (req, res) {
  dataService
    .getDepartment()
    .then((data) => {
      res.render("departments", { departments: data });
    })
    .catch((err) => {
      res.status(500).send("Departments Not Found");
    });
});

app.get("/department/:departmentId", ensureLogin, function (req, res) {
  dataService
    .getDepartmentById(req.params.departmentId)
    .then((data) => {
      if (data.length == 0) res.status(404).send("Department Not Found");
      else res.render("department", { department: data[0] });
    })
    .catch((error) => {
      res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, function (req, res) {
  dataService
    .deleteDepartmentById(req.params.departmentId)
    .then((data) => {
      res.redirect("/departments");
    })
    .catch((error) => {
      res
        .status(500)
        .send("Unable to Remove Department / Department not found");
    });
});

//once department data is updated, it will show all the department data
app.post("/department/update", ensureLogin, (req, res) => {
  dataService
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((error) => {
      res.status(500).send("Unable to update department");
    });
});

//get images
/* This route will return a JSON formatted string (res.json()) consisting of a single "images" property, 
which contains the contents of the "./public/images/uploaded" directory as an array */
app.get("/images", ensureLogin, function (req, res) {
  fs.readdir("./public/images/uploaded", function (err, files) {
    if (err) console.log(err);
    else res.render("images", { images: files });
  });
});

//add employees
app.get("/employees/add", ensureLogin, function (req, res) {
  dataService
    .getDepartment()
    .then((data) => {
      res.render("addEmployee", { departments: data });
    })
    .catch(() => {
      res.render("addEmployee");
    });
});
app.post("/employees/add", ensureLogin, function (req, res) {
  dataService
    .addEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to add employee");
    });
});

//add departments
app.get("/departments/add", ensureLogin, function (req, res) {
  res.render("addDepartment");
});
app.post("/departments/add", ensureLogin, function (req, res) {
  dataService
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to add department");
    });
});

//add images
app.get("/images/add", ensureLogin, function (req, res) {
  res.render("addImage");
});
app.post(
  "/images/add",
  ensureLogin,
  upload.single("imageFile"),
  function (req, res) {
    res.redirect("/images");
  }
);

//Routes enables users to register or login/logout of the system
//Display the login html page
app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  req.body.userAgent = req.get("User-Agent");
  dataServiceAuth
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email, // authenticated user's email
        loginHistory: user.loginHistory, // authenticated user's loginHistory
      };
      res.redirect("/employees");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

//Register page
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  dataServiceAuth
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

//Log a user out by destroying their session and redirecting them to /login
app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/login");
});

//render user history view
app.get("/userHistory", ensureLogin, function (req, res) {
  res.render("userHistory");
});

//404 page
app.use((req, res) => {
  res.status(404).render("404page", { layout: false });
});

dataService
  .intialize()
  .then(dataServiceAuth.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHTTPStart);
  })
  .catch((error) => {
    console.log("unable to start server:" + error);
  });
