// app/routes.js

var Data            = require('../app/models/data');
var User            = require('../app/models/user');
var Climber         = require('../app/models/climber');

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

      console.log("Google Email:" + req.user.google.email)
      console.log("Local Email:" + req.user.local.email)

      //made a global user name var here - good idea to
      //make one and use throughout - this works in nested functions
      //which was your problem before
      // maybe make sense to make the global "req.user" instead of the email?
      user_master = req.user.local.email || req.user.google.email
      var myData = true;
      Data.findOne({ 'username' :  user_master }, function(err, userData) {
          if (err) return done(err);
          if (!userData){
            Data.create({ username: user_master }, function (err, newUserData) {
              if (err) return handleError(err);
              myData = newUserData;
            });
          }else{
            myData = userData;
          }
          Climber.find({}, function(err, climber) {
            if (err) throw err;
            res.render('profile.ejs', {climber:climber, user:req.user, data:myData});
          });
        })
      })

    app.post('/addClimberToTeam', isLoggedIn, function(req, res){
      allInfo = req.body;
      Data.findOne({ 'username' :  allInfo.currentUsername }, function(err, user) {
          if (err) console.log("error")
          if (user){
            console.log(user["tier" + allInfo.tier].length)
            if(user["tier" + allInfo.tier].length>2){
              user["tierFull" + allInfo.tier] = true;
              console.log(user["tierFull" + allInfo.tier])
            }else{
              user["tierFull" + allInfo.tier] = false;
            }
            tier = "tier" + allInfo.tier
            user[tier].push(allInfo.climberId)
            console.log(user)
            Data.findOneAndUpdate(
              { 'username' :  allInfo.currentUsername },
            user,
             function(error,success){
               if (err){console.log("failed")}
            })
          }
      });
      res.redirect('/profile')

    });

    climbersArray = {
          tier1 : [],
          tier2 : [],
          tier3 : []
        }


    app.post("/myTeam", isLoggedIn, function(req, res){
      climbersArray = {
            tier1 : [],
            tier2 : [],
            tier3 : []
          }
      Data.findOne({ 'username' :  req.body.currentUsername }, function(err, user) {
          if(err){console.log("shit")}
          else{
            for(var i = 1; i <= 3; i++){
                for(var j =0; j < user["tier" + i].length; j++){
                  var stringI = parseInt(i)
                  var tier = "tier" + stringI
                  findById(user[tier][j], tier)
                }
              }
            }
          })

          setTimeout(function() {
            console.log(climbersArray)
            res.render('myTeam.ejs', {user:req.user, climber:climbersArray});
          }, 1500)
      })

      function findById(id,tier){
          Climber.findById(id, function(err, climber){
            climbersArray[tier].push(climber);
          });
      }

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
