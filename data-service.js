var employees = [];
var departments = [];
var fs = require("fs");
const empFile = "./data/employees.json";
const depFile = "./data/departments.json";

module.exports.intialize = function () {
  //Define a function reads employees.json file and parse to array
  function readEmp() {
    return new Promise((resolve, reject) => {
      fs.readFile(empFile, (err, empData) => {
        if (err) reject("unable to read file");
        else employees = JSON.parse(empData);
        resolve(employees);
      });
    });
  }
  //Define a function reads departments.json file and parse to array
  function readDep() {
    return new Promise((resolve, reject) => {
      fs.readFile(depFile, (err, depData) => {
        if (err) reject("unable to read file");
        else departments = JSON.parse(depData);
        resolve(departments);
      });
    });
  }

  //Read employees data first and then departments data
  return(readEmp().then(readDep));
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    resolve(employees);
    reject("no results returned");
  });
};

module.exports.getManagers = function () {
  const managers = employees.filter((employees) => employees.isManager == true);
  return new Promise((resolve, reject) => {
    resolve(managers);
    reject("no results returned");
  });
};

module.exports.getDepartment = function () {
  return new Promise((resolve, reject) => {
    resolve(departments);
    reject("no results returned");
  });
};
