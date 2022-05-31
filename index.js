const express = require("express");

(morgan = require("morgan")),
  (fs = require("fs")), // import built in node modules fs and path
  (path = require("path"));
const app = express();
app.use(express.static("public"));

let topMovies = [
  {
    title: "Avatar",
    director: "steven Spielsberg",
  },
  {
    title: "True Grit",
    Director: "Joel and Ethan Coen",
  },
  {
    title: "Pulp Fiction",
    Director: "Quentin Tarantino",
  },
  {
    title: "The Guard",
    Director: "John Michael McDonagh",
  },
  {
    title: "E.T. The Extra-Terrestrial",
    Director: "Steven Spielberg",
  },
  {
    title: "Gravity",
    Director: "Alfonso Cuarón",
  },
  {
    title: "Shaun of the Dead",
    Director: "Edgar Wright",
  },
  {
    title: "Snowpiercer",
    Director: "oon-ho Bong",
  },
  {
    title: "Lock Stock and Two Smoking Barrels",
    Director: "Guy Ritchie",
  },
  {
    title: "Birdman",
    Director: "Alejandro González Iñárritu",
  },
];

// GET request
app.get("/movies", (req, res) => {
  res.json(topMovies);
});
app.get("/", (req, res) => {
  res.send("Welcome to my Movies club!");
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
  res.status(500).send("Something broke!");
});
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
