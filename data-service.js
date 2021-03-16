const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
var sequelize = new Sequelize(
  "d3u9e2q24t0css",
  "etebvfkllpumky",
  "7213b9da85d5524e86c3c01df369c667e13bff783f4d44de8e9787bd4083f143",
  {
    host: "ec2-54-209-43-223.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

// Define a "Employee" model
var Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "employeeNum" as a primary key
    autoIncrement: true, // automatically increment the value
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  martialStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  hireDate: Sequelize.STRING,
});

// Define a "Department" model
var Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: Sequelize.STRING,
});

// Define foreign key relationship
Department.hasMany(Employee, { foreignKey: "department" });

module.exports.intialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to sync the database");
      });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getDepartment = function () {
  return new Promise((resolve, reject) => {
    Department.findAll()
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (const prop in employeeData) {
      if (employeeData[prop] === "") {
        employeeData[prop] = null;
      }
    }
    Employee.create(employeeData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create employee");
      });
  });
};

module.exports.getEmployeesByStatus = function (statusData) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: { status: statusData },
    })
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByDepartment = function (departmentId) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: { department: departmentId },
    })
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByManager = function (managerNum) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: { employeeManagerNum: managerNum },
    })
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeeByNum = function (empNum) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: { employeeNum: empNum },
    })
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

//function to find employee by ID and save updated employee data
module.exports.updateEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (const prop in employeeData) {
      if (employeeData[prop] === "") {
        employeeData[prop] = null;
      }
    }
    Employee.update(employeeData, {
      where: { employeeNum: employeeData.employeeNum },
    })
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch((err) => {
        reject("unable to update employee");
      });
  });
};

module.exports.deleteEmployeeByNum = function (empNum) {
  return new Promise((resolve, reject) => {
    Employee.destroy({
      where: { employeeNum: empNum },
    })
      .then(function () {
        resolve();
      })
      .catch((err) => {
        reject();
      });
  });
};

module.exports.addDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    for (const prop in departmentData) {
      if (departmentData[prop] === "") {
        departmentData[prop] = null;
      }
    }
    Department.create(departmentData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create department");
      });
  });
};

module.exports.updateDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    for (const prop in departmentData) {
      if (departmentData[prop] === "") {
        departmentData[prop] = null;
      }
    };
    console.log(departmentData);
    Department.update(departmentData, {
      where: { departmentId: departmentData.departmentId },
    })
      .then(function (data) {
        resolve(data.dataValues);
      })
      .catch((err) => {
        console.log(err);
        reject("unable to create department");
      });
  });
};

module.exports.getDepartmentById = function (departmentId) {
  return new Promise((resolve, reject) => {
    Department.findAll({
      where: { departmentId: departmentId },
    })
      .then(function (data) {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.deleteDepartmentById = function (departmentId) {
  return new Promise((resolve, reject) => {
    Department.destroy({
      where: { departmentId: departmentId },
    })
      .then(function () {
        resolve();
      })
      .catch((err) => {
        reject();
      });
  });
};
