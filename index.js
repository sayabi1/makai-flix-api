const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const app = express();
const passport = require("passport");
require("./passport");

app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
//app.use(cors()); // it will set the application to allow rquest from all origin
let allowedOrigins = ["http://localhost:8080 ", "http://testsite.com"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // if a specific origin is not found on the list of allowed origins
        let message =
          "The CORS policy for the application does not allow access from the origin" +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
let auth = require("./auth")(app);
app.use(bodyParser.json());
app.use(morgan("common"));

app.use(express.static("public"));
const mongoose = require("mongoose");
const Models = require("./models.js");
const res = require("express/lib/response");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

/*mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});*/
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
/*mongoose.connect(
  "",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);*/
const { CREATED, OK, BAD_REQUEST, NOT_FOUND, SERVER_ERROR } = {
  CREATED: 201,
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// GET default text response when at /
app.get("/", (req, res) => {
  res.send("welcome to makaiflix");
});

// GET  text response when at /movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      if (!movies) {
        res.status(NOT_FOUND).send("No movies found");
      } else {
        res.status(CREATED).json(movies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(SERVER_ERROR).send("Error: " + err);
    });
});

//Get the users at /users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Users.find()
      .then(function (users) {
        if (!users) {
          res.status(NOT_FOUND).send("No users found");
        } else {
          res.status(OK).json(users);
        }
      })
      .catch(function (err) {
        console.error(err);
        res.status(SERVER_ERROR).send("Error: " + err);
      });
  }
);

// Get a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(NOT_FOUND).send(req.params.Username + "not found");
        } else {
          res.status(OK).json(user);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(SERVER_ERROR).send("Error: " + err);
      });
  }
);

//gets the JSON movie about single movie by title
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        if (!movie) {
          res.status(NOT_FOUND).send(req.params.Title + "not found");
        } else {
          res.status(OK).json(movie);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(SERVER_ERROR).send("Error: " + err);
      });
  }
);
//get the movie json when looking for specific genre
app.get(
  "/movies/genre/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Genre.Name": req.params.name })
      .then((genre) => {
        if (!genre) {
          res.status(NOT_FOUND).send("Genre not found");
        } else {
          res.status(OK).json(genre);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(SERVER_ERROR).send("Error: " + err);
      });
  }
);

//gets the data about single movie by Director
app.get(
  "/movies/director/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Director.Name": req.params.Name })
      .then((director) => {
        if (!director) {
          res.status(NOT_FOUND).send(" Director not found");
        }
        res.status(OK).json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(SERVER_ERROR).send("Error: " + err);
      });
  }
);

// allow user register
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumberic charecter - not allowed"
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appeared to be valid").isEmail(),
  ],
  (req, res) => {
    // check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: error.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password); // before storing the users password in DB this function modify the endpoint to hash the password before storing it
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res
            .status(BAD_REQUEST)
            .send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(SERVER_ERROR).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(SERVER_ERROR).send("Error: " + error);
      });
  }
);
// Update: User info
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(SERVER_ERROR).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);
// Create: Add movie to a user's list of favorite movies
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(SERVER_ERROR).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Delete
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(BAD_REQUEST).send(req.params.Username + " was not found");
        } else {
          res.status(OK).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(SERVER_ERROR).send("Error: " + err);
      });
  }
);

//Delete movie from user's favouriteMovies list
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(SERVER_ERROR).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Morgan middelware liabraries to log all the request
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
// Error handling in Express
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(SERVER_ERROR).send("Something broke!");
});
const port = process.env.PORT || 8080; // changing the port so othe people can also use the app
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port" + port);
});
