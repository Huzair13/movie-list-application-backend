const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase, getDatabaseInstance } = require('../database/database');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

connectToDatabase();

// Show all movies
app.get('/', async (req, res) => {
    try {
        const dbo = getDatabaseInstance();
        const movies = await dbo.collection('MoviesData').find().toArray();
        const movieNames = movies.map(movie => movie.movieName);
        res.json(movieNames);
    } catch (error) {
        console.error("Error fetching movie names:", error);
        res.status(500).json({ error: 'Error' });
    }

});

// Add new movie
app.post('/addMovies', async (req, res) => {

    const dbo = getDatabaseInstance();

    let movieName=req.body.movieName;
    let director=req.body.director;
    let releaseYear= req.body.releaseYear;
    let language=req.body.language;
    let rating =req.body.rating;

    console.log(releaseYear)
    const newMovie={
        movieName : movieName,
        director : director,
        releaseYear :parseInt(releaseYear),
        language :language,
        rating : parseFloat(rating)
    };

    dbo.collection("MoviesData").insertOne(newMovie)
    .then(()=>{
        console.log("One Movie Inserted Successfully !!!!");
        res.send("Insert Successfull :)")
    })
    .catch(()=>{
        console.log("Error at Insert !!!");
    });

});

// Update movies
app.put('/movies/:movieName', async (req, res) => {

    const dbo = getDatabaseInstance();

    const { movieName } = req.params;
    const update = req.body;

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ error: 'No update fields provided' });
    }

    try {
        const result = await dbo.collection('MoviesData').updateOne({ movieName : movieName }, { $set: update });
        if (result.modifiedCount > 0) {
            console.log("Update Sucessfull :)")
            res.send("Update Successfull :)")
        } else {
            res.json(null);
        }
    } catch (error) {
        console.error("Error updating movie details:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Filter movies
app.get('/filter', async (req, res) => {

    const dbo = getDatabaseInstance();

    const { name, director, releaseYear, language, rating } = req.query;
    const filter = {};
  
    if (name) filter.name = new RegExp(name, 'i');
    if (director) filter.director = new RegExp(director, 'i');
    if (releaseYear) filter.releaseYear = parseInt(releaseYear);
    if (language) filter.language = new RegExp(language, 'i');
    if (rating) filter.rating = parseInt(rating);
  
    try {
      const filteredMovies = await dbo.collection('MoviesData').find(filter).toArray();
      const movieNames = filteredMovies.map(movie => movie.movieName); 

      res.json(movieNames);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// // Delete movie
// app.delete('/delete', (req, res) => {

//     const dbo = getDatabaseInstance();

//     const movieName=req.body.movieName;

//     dbo.collection('MoviesData').deleteOne({movieName : movieName})
//     .then(function(result){
//         if(result.deletedCount ==1){
//             console.log("Movie Deleted Successfully :)");
//             res.send("Movie Deleted Successfully :)",movieName)
//         }
//         else{
//             console.log("Movie Data Not Found :(",movieName);
//             res.send("Movie Data Not Found :(");
//         }
//     })
//     .catch(function(err){
//         console.log(err);
//     })
// });

// Delete movie
app.delete('/delete', (req, res) => {
    const dbo = getDatabaseInstance();
    const movieName = req.body.movieName;

    dbo.collection('MoviesData').deleteOne({ movieName: movieName })
        .then(function (result) {
            if (result.deletedCount === 1) {
                console.log("Movie Deleted Successfully :)");
                // Set status 200 and send a message
                return res.status(200).send({ message: "Movie Deleted Successfully :)", movieName });
            } else {
                console.log("Movie Data Not Found :(", movieName);
                // Set status 404 and send a message
                return res.status(404).send({ message: "Movie Data Not Found :(", movieName });
            }
        })
        .catch(function (err) {
            console.log(err);
            // Set status 500 for server error
            return res.status(500).send({ message: "An error occurred while deleting the movie." });
        });
});


// Search for a movie
app.post('/search', (req, res) => {

    const dbo = getDatabaseInstance();

    const movieName=req.body.movieName;
    dbo.collection('MoviesData').find({movieName : movieName}).toArray()
    .then(function(result){
        if(result.length !=0){
            res.send(result);
        }
        else{
            res.send("Movie Not Found :(")
        }
    })
    .catch(function(err){
        res.send(err);
    });
});

// Number of movies based on certain languages
app.get('/number', (req, res) => {

    const dbo = getDatabaseInstance();

    const {language}= req.query;
    dbo.collection("MoviesData").find({language : language}).toArray()
    .then(function(result){
        const count=result.length;
        res.send({[`Number of ${language} movies`] : count});
    })
    .catch(function(err){
        res.send(err);
    });
});

module.exports = app;
