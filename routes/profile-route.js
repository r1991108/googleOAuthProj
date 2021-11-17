const router = require("express").Router();
const Post = require("../models/post-model");
// use req.isAuthenticated() to check if authenticated
const authCheck = (req, res, next) => {
  // console.log(req.isAuthenticated());
  // console.log(req.originalUrl);

  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
  } else {
    next();
  }
};

// use req.user to get user informations
router.get("/", authCheck, async (req, res) => {
  // console.log(req.user);
  let postFound = await Post.find({ author: req.user._id });
  res.render("profile", { user: req.user, posts: postFound });
  // res.send("testProfile");
});

router.get("/post", authCheck, (req, res) => {
  res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save().then(() => {
      console.log(req.body);
    });
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "Both title and content are required.");
    res.redirect("/profile/post");
  }
});

module.exports = router;
