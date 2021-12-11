const express = require('express');
const bodyParser = require('body-parser');
const placesRouter = require('./routes/places-routes')
const usersRouter = require('./routes/users-routes')
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, DELETE');
  
    next();
  });

app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);


app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

app.use((error, req, res, next) => {

    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500);
    res.json({
        message: error.message || 'message eee'
    });
});

mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hxrzo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });