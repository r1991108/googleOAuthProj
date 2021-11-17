// deal with any auth routes
const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("testForm");
});


router.post("/testForm", (req, res) => {
  res.sends(req.body);
});

module.exports = router;
