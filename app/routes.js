// app/routes.js

var Data            = require('../app/models/data');
var User            = require('../app/models/user');
var Climber            = require('../app/models/climber');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {

      Climber.find({}, function(err, climber) {
        if (err) throw err;
        res.render('profile.ejs', {climber:climber, user:req.user});
      });

    });

    app.post('/addClimberToTeam', isLoggedIn, function(req, res){
      console.log(req.body)
      req.body.cimberId
      Data.findOne({ 'username' :  req.body.currentUsername }, function(err, user) {
          if (err)
              return done(err);

          // if no user is found, return the message
          if (!user){
            var tier = "tier" + req.body.tier

            Data.create({ "username":req.body.currentUsername, tier: req.body.climberId},
             function (err, small) {
              if (err) return handleError(err);
              console.log(small);
            });

            Data.findOne({ 'username' :  req.body.currentUsername }, function(err, user2) {
              console.log(user2)
              var tier = "tier" + req.body.tier
              user2["tier" + req.body.tier].push(req.body.climberId)
              Data.findOneAndUpdate(
                { 'username' :  req.body.currentUsername },
              user2,
               function(error,success){
                 if (err){console.log("failed")}
                 else{return console.log("succesfully saved");}
              })
              // all is well, return successful user
            })
          }
          // if the user is found but the password is wrong
          if (user){
            var tier = "tier" + req.body.tier
            user["tier" + req.body.tier].push(req.body.climberId)
            Data.findOneAndUpdate(
              { 'username' :  req.body.currentUsername },
            user,
             function(error,success){
               if (err){console.log("failed")}
               else{return console.log("succesfully saved");}
            })
            // all is well, return successful user
          }
      });

      res.redirect('/profile')

    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));



};





// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
