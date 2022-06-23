const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
const mongoose = require("mongoose");
const Models = require("./models.js");
const res = require("express/lib/response");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { CREATED, OK, BAD_REQUEST, NOT_FOUND } = {
  CREATED: 201,
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// GET default text response when at /
app.get("/", (req, res) => {
  res.send("welcomeo to makaiflix");
});

// GET  text response when at /movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(CREATED).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(SERVER_ERROR).send("Error: " + err);
    });
});

//Get the users at /users
app.get("/users", function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(CREATED).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(SERVER_ERROR).send("Error: " + err);
    });
});

// Get a user by username
app.get("/users/:Username", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//gets the JSON movie about single movie by title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(SERVER_ERROR).send("Error: " + err);
    });
});
//get the movie json when looking for specific genre
app.get("/movies/genre/:name", (req, res) => {
  Movies.find({ "Genre.Name": req.params.name })
    .then((genre) => {
      res.status(201).json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//gets the data about single movie by Director
app.get("/movies/director/:Name", (req, res) => {
  Movies.find({ "Director.Name": req.params.Name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(SERVER_ERROR).send("Error: " + err);
    });
});

// allow user register
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});
// Update: User info
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});
// Create: Add movie to a user's list of favorite movies
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Delete
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Delete movie from user's favouriteMovies list
app.delete("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

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
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
