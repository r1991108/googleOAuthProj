const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes/auth-route");
const profileRoute = require("./routes/profile-route");
const testRoute = require("./routes/test-route");
require("./config/passport");
const passport = require("passport");
const cookieSession = require("cookie-session");
const session = require("express-session");
const flash = require("connect-flash");

// copy the url from monboDB atlas
// replace <password> with the password for the user.
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connect to mongoDB atlas.");
  })
  .catch((err) => {
    console.log(err);
  });

// middleware

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// app.use((req,res,next)=>{
//   console.log("middleware test");
// })
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

app.use("/test", testRoute);



app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

// error handler
app.use((err,req,res,next)=>{
  console.log("something is wrong. The following error is caught by error handler");
  console.log(err);
})

app.listen(8080, () => {
  console.log("Server running.");
});
