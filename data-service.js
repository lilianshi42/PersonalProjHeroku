var employees = [];
var departments = [];
const fs = require("fs");
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
    if (employees.length == 0) reject("no results returned");
    else resolve(employees);
  });
};

module.exports.getManagers = function () {
  var managers = employees.filter((employee) => employee.isManager == true);
  return new Promise((resolve, reject) => {
    if (managers.length == 0) reject("no results returned");
    else resolve(managers);
  });
};

module.exports.getDepartment = function () {
  return new Promise((resolve, reject) => {
    if (departments.length == 0) reject("no results returned");
    else resolve(departments);
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.employeeNum = employees.length + 1;
    employeeData.isManager = employeeData.isManager ? true : false;
    employees.push(employeeData);
    resolve();
  });
};

module.exports.getEmployeesByStatus = function (status) {
  var filteredEmps = employees.filter((employee) => employee.status == status);
  return new Promise((resolve, reject) => {
    if (filteredEmps.length == 0) reject("no results returned");
    else resolve(filteredEmps);
  });
};

module.exports.getEmployeesByDepartment = function (departmentNum) {
  var filteredEmps = employees.filter(
    (employee) => employee.department == departmentNum
  );
  return new Promise((resolve, reject) => {
    if (filteredEmps.length == 0) reject("no results returned");
    else resolve(filteredEmps);
  });
};

module.exports.getEmployeesByManager = function (managerNum) {
  var filteredEmps = employees.filter(
    (employee) => employee.employeeManagerNum == managerNum
  );
  return new Promise((resolve, reject) => {
    if (filteredEmps.length == 0) reject("no results returned");
    else resolve(filteredEmps);
  });
};

module.exports.getEmployeeByNum = function (empNum) {
  return new Promise((resolve, reject) => {
    var foundEmp = null;
    for (let i = 0; i < employees.length && !foundEmp; i++) {
      if (employees[i].employeeNum == empNum) foundEmp = employees[i];
    }
    if (!foundEmp) reject("no results returned");
    else resolve(foundEmp);
  });
};
