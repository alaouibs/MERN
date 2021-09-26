const fs = require('fs')
const uuid = require('uuid/v4');
const HttpError = require('../models/http-error');
const {
    validationResult
} = require('express-validator');
const Place = require('../models/place.js');
const User = require('../models/user.js');
const getCoordsForAddress = require('../utils/location');
const mongoose = require('mongoose');

const getPlaceById = async (req, res, next) => {


    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError(
            'Could not find a place for the provided id.',
            404
        );
        return next(error);
    }

    console.log('GET Request in Places');
    res.json({
        place: place.toObject({
            getters: true
        })
    });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        const error = new HttpError(
            'Could not find a place for the provided id.',
            404
        );
        return next(error);
    }

    console.log('GET Request in Places');
    res.json({
        places: userWithPlaces.places.map(place => place.toObject({
            getters: true
        }))
    });
};

const createPlace = async (req, res, next) => {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const {
        title,
        description,
        address,
        creator
    } = req.body;

    console.log(address)
    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image : req.file.path,
        creator

    })

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'User not found',
            500
        );
        return next(error);
    }

    if (!user) {
        return next(new HttpError('could not find user', 500));
    }
    try {

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({
            session: sess
        });
        user.places.push(createdPlace);
        await user.save({
            session: sess
        });

        await sess.commitTransaction();


        await createdPlace.save()
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again.' + err,
            500
        );
        return next(error);
    }

    res.status(201).json({
        place: createdPlace.toObject({
            getters: true
        })
    })
};

const updatePlace = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        throw new HttpError('Invalid inputs passed, please check your data', 422);
    }

    const {
        title,
        description,
    } = req.body;

    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to edit this place', 401
        );
        return next(error);
    }
    if (title) {
        place.title = title;
    }

    if (description) {
        place.description = description;
    }

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            err, 500
        );
        return next(error);
    }

    res.status(200).json({
        place: place.toObject({
            getters: true
        })
    })
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }

    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to delete this place', 401
        );
        return next(error);
    }

    const imagePath = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await place.remove({
            session: sess
        });

        place.creator.places.pull(place);
        await place.creator.save({ session: sess });

        await sess.commitTransaction();

    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could delete place.', 500
        );
        return next(error);
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    });

    res.status(200).json({
        message: 'Deleted place'
    })
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;