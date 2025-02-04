const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
require(`dotenv`).config();
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection (ensure dbcon.js exports the connection object)
// For example, if you're using the mysql module, it will use callbacks.
const connection = require('./dbcon');

// Serve the static index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Route to store a thought in the database using callback-style
app.post('/api/thoughts', (req, res) => {
    console.log(req.body.data);

    connection.execute(
        'INSERT INTO thoughts (thought_text) VALUES (?)',
        [req.body.data],
        (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send(`
                    <html>
                    <head>
                        <title>Error</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                text-align: center;
                                padding: 50px;
                            }
                            .container {
                                background: white;
                                padding: 20px;
                                border-radius: 10px;
                                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                                display: inline-block;
                            }
                            h1 {
                                color: red;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Error!</h1>
                            <p>Something went wrong while storing your thought.</p>
                            <a href="/">Go Back</a>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                res.status(201).send(`
                    <html>
                    <head>
                        <title>Success</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                baczakground-color: #f4f4f4;
                                text-align: center;
                                padding: 50px;
                            }
                            .container {
                                background: white;
                                padding: 20px;
                                border-radius: 10px;
                                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                                display: inline-block;
                            }
                            h1 {
                                color: green;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Success!</h1>
                            <p>Your thought has been stored successfully.</p>
                            <a href="/">Go Back</a>
                        </div>
                    </body>
                    </html>
                `);
            }
        }
    );
});

// Route to retrieve previous thoughts and display them using an EJS template (callback style)
app.post('/api/prevthoughts', (req, res) => {
    const color = req.body.color;
    console.log('Color received is:', color);

    if (color ===process.env.COLORPASS ) {
        connection.execute(
            'SELECT * FROM thoughts ORDER BY created_at DESC',
            (error, rows) => {
                if (error) {
                    console.error(error);
                    res.status(500).send(`
                        <html>
                        <head>
                            <title>Error</title>
                            <style>
                                body { font-family: Arial, sans-serif; background: #f0f0f0; text-align: center; padding: 50px; }
                                .container { background: white; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                                h1 { color: red; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>Database Error</h1>
                                <p>There was an error retrieving your thoughts.</p>
                            </div>
                        </body>
                        </html>
                    `);
                } else {
                    console.log(rows);
                    // Render the EJS template with the retrieved rows
                    res.render('prevthoughts', { rows });
                }
            }
        );
    } else {
        res.status(400).send(`
            <html>
            <head>
                <title>Invalid Color</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #f0f0f0; text-align: center; padding: 50px; }
                    .container { background: white; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    h1 { color: orange; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Invalid Color</h1>
                    <p>The color provided is invalid.</p>
                </div>
            </body>
            </html>
        `);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
