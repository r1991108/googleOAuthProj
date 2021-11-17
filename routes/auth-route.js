// deal with any auth routes
const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res) => {
  console.log(req.body);
  let { name, email, password } = req.body;
  //check if the data is already in database
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    req.flash("error_msg", "Email has already been registered.");
    res.redirect("/auth/signup");
  }

  const hash = await bcrypt.hash(password, 10);
  password = hash;
  let newUser = new User({ name, email, password });
  try {
    await newUser.save();
    // res.status(200).send({
    //   msg: "User saved.",
    //   savedObj: savedUser,
    // });
    req.flash("success_msg", "Registration succeeds. You can login now.");
    res.redirect("/auth/login");
  } catch (err) {
    console.log(err.errors.name.properties);
    req.flash("error_msg", err.errors.name.properties.message);
    res.redirect("/auth/signup");
  }
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "wrong email or password.",
  }),
  (req, res) => {
    // res.redirect("/profile");
    if (req.session.returnTo) {
      let newPath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newPath);
    } else {
      res.redirect("/profile");
    }
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  // console.log("redirect to profile");
  // res.redirect("/profile");
  // res.send("test0");
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newPath);
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;
