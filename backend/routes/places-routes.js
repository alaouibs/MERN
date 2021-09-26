const express = require('express');
const HttpError = require('../models/http-error');
const router = express.Router();
const {
    check
} = require('express-validator');
const checkAuth = require('../middleware/check-auth');

const fileUpload = require('../middleware/file-upload')
const placesControllers = require('../controllers/places-controller');

router.get('/user/:uid', placesControllers.getPlacesByUserId);
router.get('/:pid', placesControllers.getPlaceById);

router.use(checkAuth);

router.post('/', fileUpload.single('image'), [check('title').not().isEmpty(), check('description').isLength({
    min: 5
}), check('address').notEmpty()], placesControllers.createPlace);

router.patch('/:pid', placesControllers.updatePlace);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;