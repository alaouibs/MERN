const express = require('express');
const HttpError = require('../models/http-error');
const router = express.Router();
const fileUpload = require('../middleware/file-upload');
const {
    check
} = require('express-validator');
const usersControllers = require('../controllers/users-controller');

router.get('/', usersControllers.getUsers);

router.post('/signup', fileUpload.single('image'),  [
    check('name').notEmpty(), check('email').normalizeEmail().isEmail(), check('password').isLength({
        min: 8
    })
], usersControllers.signup);

router.post('/login', usersControllers.login);

router.delete('/login', usersControllers.login);

module.exports = router;