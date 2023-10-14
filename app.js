// const express = require('express');


// const app = express();
// const port = 3000;


// Middleware setup
// // app.use(scrapeRoutes);


// // app.use(async (req, res, next) => {
// //     next(createError.NotFound("The path or URL doesn't exist"));
// // });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);c
// });

const cors = require('cors');
const express = require('express');
const scrapeRoutes = require('./routes/scrape');
const createError = require('http-errors');
const app = express();
const port = 3000;
app.use(cors()); // Enable CORS
app.use(express.json()); // En
app.use(express.urlencoded({ extended: false }));
app.use(scrapeRoutes);
app.use('/yg', async (req, res) => {
    res.send('Hello, Node.js!');
});
app.use('/', async (req, res, next) => {
    res.send('Hello from Server');
});


app.use(async (req, res, next) => {
    next(createError.NotFound("The path or URL doesn't exist"));
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
