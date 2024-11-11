// Ensure that all traffic is served over SSL
// A valid certificate and key is generated and used to serve web traffic over SSL for the web app
const https = require('https');
const fs = require('fs');

// Import express
const express = require('express');
// use express
const router = express();

// Import mongoose
const mongoose = require('mongoose');
// Import customer model
const Customer = require('./models/customerModel');
// Import bcrypt for salt and hashing password
const bcrypt = require('bcrypt');
// Import helmet to protect against attacks
const helmet = require('helmet');
// Import express-rate-limit to limit requests and prevent brute force attacks
const rateLimit = require('express-rate-limit');
// Import cors 
const cors = require('cors');


// Middleware

// Enforce all traffic is redirected to HTTPS
router.use((req, res, next) => {
    if (req.protocol !== 'https'){
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// Use Helmet config in the API
router.use(helmet());
// Enable JSON in API
router.use(express.json());
// Enable cors
router.use(cors({
    origin: 'http://localhost:3001', // Specify your frontend origin here
    credentials: true, // Allow credentials like cookies to be sent
  }));

  router.options('*', cors({
    origin: 'http://localhost:3001',
    credentials: true,
  }));
  


// Load SSL certificate and key
const options = {
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
}


// Set up rate limiter: maximum of 5 requests per minue for login attempts
const loginLimiter = rateLimit({
    // 5 minute
    windowMs: 5 * 60 * 1000,
    // Limit each IP to 5 login requests per window
    max: 5,
    // Error message
    message: "Too many login attempts, please try again later."
});

// Set up rate limiter: maximum of 10 requests per minute for registrations attempts
const registerLimiter = rateLimit({
    // 5 minute
    windowMs: 5 * 60 * 1000,
    // Limit each IP to 5 registration requests per window
    max: 5,
    // Error message
    message: "Too many registration attempts, please try again later."
});

// Utility function to validate inputs using advanced RegEx patterns
const validateInput = (value, pattern) => {
    return pattern.test(value);
}

// Advanced RegEx patterns for input validation

// Full name Regular Expression pattern for whitelisting
const fullNamePattern = /^[a-zA-Z\s\-']{3,100}$/;
// ID Number Regular Expression pattern for whitelisting
const idNumberPattern = /^[a-zA-Z0-9]{10,13}$/
// Account number Regular Expression pattern for whitelisting
const accountNumberPattern = /^[0-9]{8,12}$/
// Username Regular Expression pattern for whitelisting
const usernamePattern = /[a-zA-Z0-9_]{3,30}$/
// Passwor Regular Expression for whitelisting
const passwordPattern = /^[a-zA-Z0-9!@£$%^&*]{6,50}$/


// Routes

// Register Route
router.post('/register', registerLimiter ,async (req, res) => {
    // Store values from requst body
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    // Perform input whitelisting checks on all inputs

    // Input whitelisting through RegEx for full name
    if (!validateInput(fullName, fullNamePattern)){
        return res.status(400).json({ message: "Invalid full name format." });
    }
    // Input whitelisting through RegEx for ID number
    if (!validateInput(idNumber, idNumberPattern)){
        return res.status(400).json({ message: "Invalid ID number format." });
    }
    // Input whitelisting through RegEx for account number
    if (!validateInput(accountNumber, accountNumberPattern)){
        return res.status(400).json({ message: "Invalid account number format." });
    }
    // Input whitelisting through RegEx for username
    if (!validateInput(username, usernamePattern)){
        return res.status(400).json({ message: "Invalid username format." });
    }
    // Input whitelisting through RegEx for password
    if (!validateInput(password, passwordPattern)){
        return res.status(400).json({ message: "Inavlid password format." })
    }

    // Perform additional checks and only register user if pass
    try{
        // Check if username or account number already exists in DB
        const existingUser = await Customer.findOne({ $or: [{ username }, { accountNumber }] });
        // If a user already exists
        if (existingUser){
            // Display error message to user
            return res.status(400).json({ message: "Username or acccount number already exists"})
        }

        // Password Security
        // Get Salt
        const salt = await bcrypt.genSalt(10);
        // Hash Password
        const passwordHash = await bcrypt.hash(password, salt);

        // Create a new customer
        const customer = await Customer.create({
            fullName,
            idNumber,
            accountNumber,
            username,
            passwordHash
        });

        // Success message
        await customer.save();
        res.status(201).json({ message: "User registered successfully"});
    } 
    // Catch error from try
    catch (error){
        // Server error message
        res.status(500).json({message: "Server error: " + error});
    }
})

// Login Route
router.post('/login', loginLimiter, async (req, res) => {
    // Get username, password, and accountNumber from request
    const { username, password, accountNumber } = req.body;

    // Perform input whitelisting checks on all inputs
    if (!validateInput(username, usernamePattern)) {
        return res.status(400).json({ message: "Invalid username." });
    }
    if (!validateInput(password, passwordPattern)) {
        return res.status(400).json({ message: "Invalid password." });
    }
    // Input whitelisting through RegEx for account number
    if (!validateInput(accountNumber, accountNumberPattern)) {
        return res.status(400).json({ message: "Invalid account number." });
    }

    // Perform additional checks and only login user if checks pass
    try {
        // Find user by username
        const user = await Customer.findOne({ username });

        // If the user doesn't exist
        if (!user) {
            return res.status(401).json({ message: "Username does not exist" });
        }

        // Check if account number matches
        if (user.accountNumber !== accountNumber) {
            return res.status(401).json({ message: "Account number is incorrect" });
        }

        // Salt and hash password verification
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Password is incorrect" });
        }

        // Else login is successful
        res.status(200).json({
            message: "Login successful",
            user: { fullName: user.fullName, username: user.username }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error: " + error });
    }
});


// Get Route
router.get('/get', loginLimiter, (req, res)=>{
    res.send("This is is a get response from the ADPS API")
})


// Connect to MongoDB
mongoose
.connect('mongodb+srv://denzel:Password123@mongodbcluster.uos1u.mongodb.net/APDS-Node-API?retryWrites=true&w=majority&appName=MongoDbCluster')
.then(() => {
    // Only connect to API after connecting to MongoDB successfully
    // Start HTTPS server
    https.createServer(options, router).listen(3000, ()=> {
        console.log("Secure APDS Node API is running on https://localhost:3000")
    });
    console.log('Connected to MongoDB');
}).catch((error) =>{
    // Display the error if fails
    console.log(error);
})