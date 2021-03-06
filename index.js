/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
// Dependencies
const ejs = require("ejs");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const app = express();
const port = process.env.PORT || 3000;

// Initialize EJS (render engine for server-side rendering)
app.set("views", `${__dirname}/views/pages`);
app.set("view engine", "ejs");

// Configure session store
const sqlite_store = new SQLiteStore({
    db: 'sessions.db',
    concurrentDB: true
});

// Load 'session' middleware
const sess = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    store: sqlite_store,
    saveUninitialized: true, // Save session for every visitor
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Sessions last for 1 day
    }
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

const fix_redirect = redirect => {
    redirect = redirect.replace("/sign_up", "");
    redirect = redirect.replace("/user/create", "");
    redirect = redirect.replace("/user/auth", "");
    redirect = redirect.replace("/sign_in", "");

    return redirect;
};

// Authentication middleware. Use when you want to restrict route access to moderators only
const check_moderator = () => (req, res, next) => {
    if (req.isAuthenticated())
    {
        if (req.user.moderator === 1)
            return next();
    }
    return res.redirect("/error/403");
};

// Authentication middleware. Use when you want to restrict page access
const require_authentication = () => (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    req.session.returnTo = fix_redirect(req.headers.referer);
    return res.redirect("/sign_in");
};

// Authentication middleware. Use when you want to check whether a user is authenticated
const check_authentication = () => (req, res, next) => {
    if (req.isAuthenticated())
        return res.redirect(`/user/${req.user.user_id}`);

    return next();
};

// Initialize passport session
app.use(passport.initialize());
app.use(passport.session());

// Load assets
app.use("/assets", express.static("assets"));

// Load api routes
app.use("/api", require("./routes/api.js"));
app.use("/user", require("./routes/user.js"));

// Handle dynamic quiz/leaderboard creation server-side
app.use("/quiz", require("./routes/quiz.js"));
app.use("/leaderboard", require("./routes/leaderboard.js"));

// Create page routes
app.get("/", (req, res) => {
    return res.render("index.ejs", { pageTitle: "Home", user: req.user, navbarMargin: 0 });
});

app.get("/log_out", (req, res) => {
    req.logout();
    req.session.destroy();
    return res.redirect(req.headers.referer);
});

app.get("/error/:status_code", (req, res) => {
    const status_code = Number.parseInt(req.params.status_code);

    const status_codes = {
        400: "Bad request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not found",
        500: "Internal server error"
    };

    // Invalid status code
    if (!status_codes[status_code])
        return res.status(404).redirect("/error/404");
    else
        return res.status(status_code).render("error.ejs", {
            pageTitle: `${status_code} Error`,
            user: req.user,
            statusCode: status_code,
            msg: status_codes[status_code]
        });
});

app.get("/sign_in", check_authentication(), (req, res) => {
    if (!req.session.returnTo) {
        req.session.returnTo = req.headers.referer || "/";
    }

    req.session.returnTo = fix_redirect(req.session.returnTo);

    return res.render("sign_in.ejs", { pageTitle: "Log in", user: req.user });
});

app.get("/sign_up", check_authentication(), (req, res) => {
    return res.render("sign_up.ejs", { pageTitle: "Sign up", user: req.user });
});

app.get("/map", (req, res) => {
    return res.render("map.ejs", { pageTitle: "Map", user: req.user, navbarMargin: 0 });
});

app.get("/submit_quiz", require_authentication(), (req, res) => {
    return res.render("submit_quiz.ejs", { pageTitle: "Submit Quiz", user: req.user });
});

// Allow for moderators to download copies of the database
app.get("/download", check_moderator(), (req, res) => {
    res.download(`${__dirname}/db/QuizDatabase.db`, "QuizDatabase.db", err => {
        if (err) {
            console.error(err);
            return res.redirect("/error/500");
        }
    });
});

// Handle non-existent routes
app.use((req, res) => {
    return res.redirect("/error/404");
});

// Start server and listen on port 3000 (http://localhost:3000)
app.listen(port, () => console.log(`QuizQuest is running on port: ${port}`));
