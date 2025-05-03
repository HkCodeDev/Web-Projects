const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true // Ensures the username is unique
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    loginHistory: [{ // Array of objects to store login history
        dateTime: {
            type: Date,
            required: true
        },
        userAgent: {
            type: String,
            required: true
        }
    }]
});

let User; // to be defined on new connection

// Initialize Database Connection
function initialize(dbUrl) {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(dbUrl); // Removed deprecated options
        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model('User', userSchema);
            resolve();
        });
    });
}

// Register a new user
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }
        bcrypt.hash(userData.password, 10, (err, hash) => {
            if (err) {
                reject("Error hashing password");
                return;
            }
            let newUser = new User({
                userName: userData.userName,
                password: hash,
                email: userData.email
            });
            newUser.save()
                .then(() => resolve("User registered successfully"))
                .catch((err) => {
                    if (err && err.code === 11000) {
                        reject("User Name already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                });
        });
    });
}

// Check user login
function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    reject("Unable to find user: " + userData.userName);
                    return;
                }
                bcrypt.compare(userData.password, user.password, (err, isMatch) => {
                    if (err) {
                        reject("Authentication failed");
                        return;
                    }
                    if (!isMatch) {
                        reject("Incorrect password for user: " + userData.userName);
                        return;
                    }
                    user.loginHistory.push({
                        dateTime: new Date(),
                        userAgent: userData.userAgent
                    });
                    user.save()
                        .then(() => resolve(user))
                        .catch(err => reject("There was an error verifying the user: " + err));
                });
            })
            .catch(err => reject("Unable to find user: " + err));
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser
};
