const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; // to be defined on new connection (see initialize)
module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://dbUser:109261206@senecaweb.vkr6l.mongodb.net/web322A6?retryWrites=true&w=majority",
      { useNewUrlParser: true }
    );

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password != userData.password2)
      reject("Passwords do not match");
    else {
      bcrypt
        .genSalt(10) // Generate a "salt" using 10 rounds
        .then((salt) => bcrypt.hash(userData.password, salt)) // encrypt the password
        .then((hash) => {
          // TODO: Store the resulting "hash" value in the DB
          let newUser = new User({
            userName: userData.userName,
            password: hash,
            email: userData.email
          });
          newUser.save((err) => {
            if(err){
              if (err.code == 11000) {
                reject("User Name already taken");
              } else {
                reject(`There was an error creating the user: ${err}`);
              }
            }
            else resolve();
          });
        })
        .catch((err) => {
          reject(err); // reject if any error occurred during the process
        });
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (users.length == 0)
          reject(`Unable to find user: ${userData.userName}`);
        else {
          bcrypt
            .compare(userData.password, users[0].password)
            .then((result) => {
              // result === true if it matches and result === false if it does not match
              if (result === false)
                reject(`Incorrect Password for user: ${userData.userName}`);
              else {
                users[0].loginHistory.push({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });

                User.update(
                  { userName: users[0].userName },
                  { $set: { loginHistory: users[0].loginHistory } },
                  { multi: false }
                )
                  .exec()
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err) => {
                    reject(`There was an error verifying the user: ${err}`);
                  });
              }
            });
        }
      })
      .catch((err) => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
