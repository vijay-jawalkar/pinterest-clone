var express = require("express");
var router = express.Router();
var userModel = require("./users");
var postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");
const nodemailer = require("nodemailer");

const randomString = require("randomstring");
const passwordResetModel = require("./passwordReset");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});

router.get("/register", function (req, res, next) {
  res.render("register", { nav: false });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  console.log(user);

  res.render("profile", { user, nav: true });
});

router.get("/show/posts", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");

  res.render("show", { user, nav: true });
});

router.get("/feed", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user");

  res.render("feed", { user, posts, nav: true });
});

router.get("/add", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("add", { user, nav: true });
});

router.get("/forgot-password", function (req, res, next) {
  res.render("forgot-password", { nav: false });
});

router.get("/edit", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { user, nav: true });
});

router.post(
  "/createpost",
  isLoggedIn,
  upload.single("postimage"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      user: user._id,
      postImage: req.file.filename,
      title: req.body.title,
      description: req.body.description,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/register", function (req, res, next) {
  var userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
  });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.post("/forgot-password", async function (req, res, next) {
  try {
    const { email } = req.body;
    const userData = await userModel.findOne({ email });
    console.log(userData);

    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email doesn't exist",
      });
    }

    const token = randomString.generate();
    const msg = `<p>Hii User, please click on <a href = "http://localhost:3000//forgot-password?token=${token}">here</a> to reset your password</p>`;

    await passwordResetModel.deleteMany({ user_id: userData._id });

    const passwordReset = await passwordResetModel.create({
      user_id: userData._id,
      token: token,
    });

    await passwordReset.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vijay.jawalkar.786@gmail.com",
        pass: "ftug rtyf mnor osyd",
      },
    });

    const mailOption = {
      from: "vijay.jawalkar.786@gmail.com",
      to: req.body.email,
      subject: "password reset",
      text: msg,
    };

    transporter.sendMail(mailOption);

    return res.status(201).json({
      success: true,
      message: "Reset password link send to your email, please check !",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
