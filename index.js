// Project needs NODE.JS as the back-end server
// Express JS is the framework that will allow us to pass in variables / db

/* -- CONSTANTS ---------------------------------------------- */
// These are constant variables required to run the poject
const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const exp = require('constants');
const { Console } = require('console');

// this to parse JSON data that gets retrieve from the data base
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// kinda like session login token
app.use(session({
    secret: 'groupSix',
    resave: true,
    saveUnitialized: true
}));

// this to serve / render static css stylesheet "style.css" and other
app.use(express.static(__dirname));

// this will convert normal html to ejs files that Express Framework
app.set('views', __dirname + '/pages');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// DEFINE THE SQL CONNECTION - given by our prof
var pool = mysql.createPool({
    host: "107.180.1.16",
    port: "3306",
    user: "fall2021group6",
    password: "group6fall2021",
    database: "cis440fall2021group6"
});

// Calling the variable above and connecting the db
// IF connect, terminal will say "Connection establish..."
pool.query('select 1+1', (err, results) => {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});

app.listen(3000);
console.log('Website Sever Is Running on Port 3000. Access via LOCALHOST:3000');
/* ----------------------------------------------------------- */
// .
// .
// .
// .


/* ----------------------------------------------------------- */
/* -- WEBSITE GLOBAL VARIABLES ------------------------------- */
// camelCase coding convention

let companyId;
let companyName;
let companyLogo;
let canAddNewMessage = true;
let canAddNewMessage1 = true;
let canAddNewMessage2 = true;
let roles = ["Admin", "Program Manager", "Mentor", "Mentee"];
let activeUserId;
let activeUserFName;
let activeUserLName;
let activeUserFullName = activeUserFName + ' ' + activeUserLName;
/*---------------------------------------------------------------*/
/*
    NOTES:
    (reference:
        - https://expressjs.com/en/guide/routing.html
        - https://masteringjs.io/tutorials/express/app-get)

    APP.GET() ---> this is the route method used to serve the client request back to the website
        - you use this when you want to render a view (html page), retrieve something from the db etc...
        app = is just the var name we defined above ...(line 7)

        ex --> app.get('/method', function(request, respond) {})
            -- the website front-end will listen for requests to '/method' and run the function when it sees one..GET THEN RETURN VALUE.
            -- request, respond can also be abbrievated to req, res...these are just parameters
            -- '/method' is what gets define inside action="" of <form> inside HTML

    APP.POST() ---> like the name say....this will send the client request back to the server
        -- you use this to do things like...
            - INSERT to database
            - UPDATE to database
            - DELETE to database

        ex ---> user creating new deck then saving / storing that into db (a call to the server)
*/

/* -- INVALID LOG IN SCREEN ---------------------------------- */
app.get('/invalidLogin', function(req, res) {
    res.render('invalidLoginScreen');
})

app.post('/goBackToLogin', function(req, res) {
    res.redirect('/');
})

/* -- LOGIN FUNCTIONS (LOGIN.HTML) --------------------------- */
// GET - Render Login Screen
// since this is main page upon loading website, we can just define '/' as the request / route
app.get('/', function(req, res) {
    // res.render('page') will render the html to localhost:3000
    res.render('login', {canAddNewMessage, canAddNewMessage1, canAddNewMessage2});
  });


// The actual method that will get the sign in values typed in and then validate it
// compare to db record - validate --> then redirect as needed
app.post('/login', (req, res) => {

    // use req.body.varName when we want to retrieve the value entered on the HTML textboxes...etc
        var username = req.body.username;
        var password = req.body.password;
    
        console.log('Begin validating user...');
        console.log(`Username: ${req.body.username}`);
        console.log(`Password: ${req.body.password}`);
    
        // if (username == valid && password == valid)
        if (username && password) {
    
            // call to db --> pass in the username && passwod as the parameters [] for the QUERY string below
            // inside the query statement, we also define a function that will handle the error, results from the SQL query
            pool.query('SELECT * FROM Users WHERE uName = ? AND uPass = ?', [username, password], function (err, results) {
                if (err) throw err;
    
                if (results.length > 0) {
                    // the query will return a result if parameters matched
                    console.log('Found user record.');
                    console.log(results);
    
                    // now we set our session.loggedin to be true
                    // set the session username to the signed in username --> in case of needing to reference it in other methods below
                    req.session.loggedin = true;
                    req.session.username = username;
    
                    // we will also assign that to a global variable above ---> in also case of needing to reference it in other methods below
                    activeUserId = results[0].uId;
                    activeUserFName = results[0].uFName;
                    activeUserLName = results[0].uLName;
                    console.log(`Account ID: ${activeUserId}`);
    
                    // redirect user to HOMEPAGE
                    res.redirect('/homepage');
                }
                else
                {
                    res.redirect('/invalidLogin');
                }
            });
        } else {
            res.redirect('/invalidLogin');
        }
    }); //End /login
/* ----------------------------------------------------------- */

// LOG USER OUT REDIRECT TO LOGIN PAGE
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
}); // End /logout

/* ----------------------------------------------------------- */

// RENDER COMPANY PAGE
app.post('/getStarted', function(req, res) {
    res.render('company');
})

/* ----------------------------------------------------------- */

/* -- COMPANY SETUP------------------------------------ */
app.post('/initCompany', function(req, res) {

    companyName =  req.body.companyName;
    companyLogo = req.body.companyLogo;
    let adminFName = req.body.adminFName;
    let adminLName = req.body.adminLName;
    let adminEmail = req.body.adminEmail;
    let adminPW = req.body.adminPW;

    console.log(companyName);
    console.log(companyLogo);
    console.log(adminFName);
    console.log(adminLName);
    console.log(adminEmail);
    console.log(adminPW);

    //Create New Company and 1st Admin User
    if (req.session.loggedin) {
        pool.query('INSERT INTO Company (cName, cLogo) VALUES ("${companyName}", $"{companyLogo}"); INSERT INTO User (uFName, uLName, uEmail, uPass, uRole, ucId) VALUES ("${adminFName}", "${adminLName}", "${adminEmail}", "${adminPW}", "Admin", "${companyId}");',
        function (err, results) {
            if (err) {
                console.log(err);                
            }
            else {
                companyId = results.insertId
                console.log("Company Created");
                canAddNewMessage = true;
            }
        }) // End session
    } // End  Create new company
    else {
        console.log("Not loggedin to session.");
    }
}); //End /initCompany
/* ----------------------------------------------------------- */

/* -- HOMEPAGE ----------------------------------------------- */
app.get('/homepage', function (req, res) {
    if (req.session.loggedin) {
    //     // canAddNewMessage = true;
    //     // Do whatever needed / whatever to be display when upon rendering the homepage

    //     // 1. get courses from the database --> then store into our Courses list --> to display in a dropdown HTML list
    //     pool.query(`SELECT courseName FROM Courses WHERE accountID= ?`, [userAccountID], function(err, results) {
    //         if (err) throw err;

           
    //         courses = [];
    //         // for each row retrieved from the Course list in the db, iterate through to add to our new course variable
    //         (results).forEach(x => {
    //             courses.push(x.courseName);
    //         });

    //         console.log(courses);

            // when rendering a page, we can also pass in variables to be reference directly on the HTML using <%= .... %> syntax
            // we would pass the variables in like res.render('page.html', {var}) --> can also pass multiple vars with commas
            res.render('homepage.html', {companyName, companyLogo, activeUserFullName});
    //    });
    }
}); //End /Homepage

/* ----------------------------------------------------------- */



/* ----------------------------------------------------------- */
