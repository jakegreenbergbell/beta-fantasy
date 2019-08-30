// app/routes.js

var Data            = require('../app/models/data');
var User            = require('../app/models/user');
var Climber         = require('../app/models/climber');
var League = require ('../app/models/league')

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/addClimbers', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/addClimbers', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    app.post('/addClimbers', function(req,res){
      user_master = req.user.local.email || req.user.google.email
      allInfo = req.body;
      var userData = true;
      Data.findOne({ 'username' :  allInfo.currentUsername }, function(err, user) {
          userData = user;
      Climber.find({}, function(err, climber) {
        // console.log("user=" + req.user)
        // console.log("climber=" + climber)
        // console.log("userData=" + userData)
        res.render("addClimbers.ejs", {user:req.user, climber:climber, data:userData})
        })
      })
    })

    app.get('/addClimbers', isLoggedIn, function(req, res) {

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
            res.render('addClimbers.ejs', {climber:climber, user:req.user, data:myData});
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
      res.redirect('/addClimbers')

    });

    app.post('/removeClimberFromTeam',isLoggedIn, function(req, res){
      var reqq = req;
      allInfo = req.body;
      console.log(res)
      console.log(allInfo)
      Data.findOne({ 'username' :  allInfo.currentUsername }, function(err, user) {
          if (err) console.log("error")
          if (user){
            console.log(user["tier" + allInfo.tier].length)
            tier = "tier" + allInfo.tier
            var index = user[tier].indexOf(allInfo.climberId)
            console.log("index="+index)
            user[tier].splice(index, 1)
            user["tierFull" + allInfo.tier] = false;
            console.log("afterupdating  "+user)
            Data.findOneAndUpdate(
              { 'username' :  allInfo.currentUsername },
            user,
             function(error,success){
               if (err){console.log("failed")}
            });
          }
        })
        res.redirect(307, "/addClimbers")
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
        teamScore = {
          score: 0
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
            res.render('myTeam.ejs', {user:req.user, climber:climbersArray, score:teamScore});
          }, 1500)
      })

      function findById(id,tier){
          Climber.findById(id, function(err, climber){
            climbersArray[tier].push(climber);
            teamScore.score += climber.score;
          });
      }

      app.post('/leagues', function(req, res){
        user_master = req.user.local.email || req.user.google.email
        allInfo = req.body;
        var userData = true;
        var climberData = true;
        Data.findOne({ 'username' :  allInfo.currentUsername }, function(err, user) {
            userData = user;
            Climber.find({}, function(err, climber) {
                climberData = climber;
              League.find({}, function(err, league){
                var password = {
                  false : false
                }
                  res.render("leagues.ejs", {user:req.user, climber:climberData, data:userData, league:league, password: password})
              })
            })
        })
      });

      app.post('/createLeague', function(req, res){
        var allInfo = req.body;
        League.create({ name: req.body.name,
                        password: req.body.password,
                        members: [req.body.currentUsername]
                      }, function (err, newLeagueData) {
          if (err) return handleError(err);
          else
          var newLeagueInfo = newLeagueData;
          console.log("id= " + newLeagueInfo.id);
          var id = newLeagueInfo.id;
          Data.findOne({"username":allInfo.currentUsername}, function(req,user){
            user.groups.push(id);
            Data.findOneAndUpdate({"username":allInfo.currentUsername}, user, function(error,success){
               if (error){console.log("failed")}
               else console.log(success)
              });
          })
        });
        res.redirect('/leagues', 307);
      })

      app.post('/joinLeague', function(req,res){
        //making the body info easier to use and usable throughout whole function
        var info = req.body;
        //first the group id is added to the users data
        Data.findOne({"username":info.username}, function(req, user){
          //check if user is already in group
          if(user.groups.indexOf(info.leagueId) == -1){
                user.groups.push(info.leagueId);
                Data.findOneAndUpdate({"username":info.username}, user, function(error,success){
                   if (error){console.log("failed")}
                   else console.log(success)
                  });
            //then the users data is added to the league
            League.findById(info.leagueId, function(err, league){
              league.members.push(info.username);
              league.memberAmount += 1;
              if(league.memberAmount == 10){
                league.groupFull = full;
              }
              console.log("before update=" + league)
              League.findOneAndUpdate({"_id":info.leagueId}, league, function(error, doc){
                if (error){console.log("failed")}
                console.log("succesfully added user data to league")
              })
            });
        } else {
            console.log("user has already joined this league")
          }
          })
            res.redirect('/leagues', 307)
        })


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
                    successRedirect : '/addClimbers',
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
