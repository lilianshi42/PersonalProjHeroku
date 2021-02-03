var employees = [];
var departments = [];
var fs = require("fs");
const empFile = "./data/employees.json";
const depFile = "./data/departments.json";

module.exports.intialize = function () {
  return new Promise((resolve, reject) => {
    //read employees.json file and parse to array first
    fs.readFile(empFile, (err, empData) => {
      if (err) reject("unable to read file");
      else {
        employees = JSON.parse(empData);
        //only whem employees data successfully read, read departments.json file and parse to array
        fs.readFile(depFile, (err, depData) => {
          if (err) reject("unable to read file");
          else departments = JSON.parse(depData);
          resolve();
        });
      }
    });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    if(employees.length == 0) {
      reject("no results returned");
    }
    resolve(employees);
  });
};

module.exports.getManagers = function () {
  const managers = employees.filter((employees) => employees.isManager == true);
  return new Promise((resolve, reject) => {
    if(managers.length == 0){
      reject("no results returned");
    }
    resolve(managers);
  });
};

module.exports.getDepartment = function () {
  return new Promise((resolve, reject) => {
    if(departments.length == 0){
      reject("no results returned");
    }
    resolve(departments);
  });
};
