const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

let users = [
  {
    id: 1,
    Name: "Harry",
    favoriteMovies: [],
  },
  {
    id: 2,
    Name: "larry",
    favoriteMovies: ["Deathrace"],
  },
  {
    id: 3,
    Name: "carry",
    favoriteMovies: ["forestgump"],
  },
];

let movies = [
  {
    Title: "Avatar",
    Director: {
      Name: "Steven Spielsberg",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Science-fiction",
      description:
        "The film is set in the mid-22nd century when humans are colonizing Pandora, a lush habitable moon of a gas giant in the Alpha Centauri star system, in order to mine the valuable mineral unobtanium",
    },
  },
  {
    Title: "True Grit",
    Director: {
      Name: "Joel and Ethan Coen",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Thriller",
      Description:
        " It is the second film adaptation of Charles Portis  novel of the same name from 1968. In the first film, which was released in 1969 and has the German title Der Marshal , John Wayne played the role of Rooster Cogburn.",
    },
  },
  {
    Title: "Pulp Fiction",
    //Director: "Quentin Tarantino",
    Director: {
      Name: "Quentin Tarantino",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Crime",
      Description:
        "The title refers to the pulp magazines and hardboiled crime novels popular during the mid-20th century, known for their graphic violence and punchy dialogue.",
    },
  },
  {
    Title: "The Guard",
    //Director: "John Michael McDonagh",
    Director: {
      Name: "John Michael McDonagh",
      Bio: "this is a Director",
    },
    " Genre": {
      Name: "Crime comedy",
      Description:
        "The film received critical acclaim and was a box office success. Both Gleeson and Cheadle received acclaim for their performances, with Gleeson receiving a Golden Globe Award nomination",
    },
  },
  {
    Title: "E.T. The Extra-Terrestrial",
    //Director: "Steven Spielberg",
    Director: {
      Name: "Steven Spielberg",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Crime comedy",
      Description:
        "The film received critical acclaim and was a box office success. Both Gleeson and Cheadle received acclaim for their performances, with Gleeson receiving a Golden Globe Award nomination",
    },
  },
  {
    Title: "Gravity",
    //Director: "Alfonso Cuarón",
    Director: {
      Name: "Alfonso Cuarón",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Crime comedy",
      Description:
        "The film received critical acclaim and was a box office success. Both Gleeson and Cheadle received acclaim for their performances, with Gleeson receiving a Golden Globe Award nomination",
    },
  },

  {
    Title: "Snowpiercer",
    //Director: "oon-ho Bong",
    Director: {
      Name: "oon-ho Bong",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Crime comedy",
      Description:
        "The film received critical acclaim and was a box office success. Both Gleeson and Cheadle received acclaim for their performances, with Gleeson receiving a Golden Globe Award nomination",
    },
  },
  {
    Title: "Lock Stock and Two Smoking Barrels",
    //Director: "Guy Ritchie",
    Director: {
      Name: "Guy Ritchie",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Crime comedy",
      Description:
        "The film received critical acclaim and was a box office success. Both Gleeson and Cheadle received acclaim for their performances, with Gleeson receiving a Golden Globe Award nomination",
    },
  },
  {
    Title: "Birdman",
    //Director: "Alejandro González Iñárritu",
    Director: {
      Name: "Alejandro González Iñárritu",
      Bio: "this is a Director",
    },
    Genre: {
      Name: "Crime comedy",
      Description:
        "The film received critical acclaim and was a box office success. Both Gleeson and Cheadle received acclaim for their performances, with Gleeson receiving a Golden Globe Award nomination",
    },
  },
];

const { CREATED, OK, BAD_REQUEST, NOT_FOUND } = {
  CREATED: 201,
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// GET request
app.get("/movies", (req, res) => {
  res.json(movies);
});
app.get("/users", (req, res) => {
  res.json(users);
});

//gets the data about single movie by title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(OK).json(movie);
  } else res.status(BAD_REQUEST).send("no such movie was found");
});

//gets the data about single movie by genre
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(OK).json(genre);
  } else res.status(BAD_REQUEST).send("no such genre was found");
});
//gets the data about single movie by Director
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(OK).json(director);
  } else res.status(BAD_REQUEST).send("no such director was found");
});

app.get("/", (req, res) => {
  res.send("Welcome to my Movies club!...");
});

// Create: New user
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(OK).json(newUser);
  } else {
    res.status(BAD_REQUEST).send("New user must have a name.");
  }
});
// Update: User info
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);
  if (user) {
    user.name = updatedUser.name;
    res.status(OK).json(user);
  } else {
    res.status(BAD_REQUEST).send("no such user");
  }
});
// Create: Add movie to a user's list of favorite movies
app.post("/users/:id/:newMovie", (req, res) => {
  const { id, newMovie } = req.params;

  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies.push(newMovie);
    res.status(OK).send(`${newMovie} has been added to your favorite's list.`);
  } else {
    res.status(BAD_REQUEST).send("no such user");
  }
});
//Delete
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(OK)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(NOT_FOUND).send("no such user");
  }
});
//Delete
app.delete("/users/:id/", (req, res) => {
  const { id } = req.params;
  user = users.find((user) => user.id == id);
  if (user) {
    let user = users.filter((user) => user.id != id);
    res.status(OK).send(`user ${id} has been removed`);
  } else {
    res.status(BAD_REQUEST).send("no such user");
  }
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
