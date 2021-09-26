const uuid = require('uuid/v4');
const {
  validationResult
} = require('express-validator');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch {
    const error = new HttpError(
      'Signing up failed, please try again later.', 500
    );

    return next(error)
  }

  res.status(201).json({
    users: users.map(user => user.toObject({
      getters: true
    }))
  });

};

const signup = async (req, res, next) => {

  console.log('signup request received')
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const {
    name,
    email,
    password
  } = req.body;

  console.log(req.body);

  let existingUser;
  try {
    existingUser = await User.findOne({
      email: email
    });
  } catch {
    const error = new HttpError(
      'Signing up failed, please try again later.', 500
    );

    return next(error)
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead',
      422
    );
    return next(error);
  }
  console.log(password)
  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Creating user failed, please try again.',
      500
    );
    return next(error);
  }


  console.log(hashedPassword)
  const createdUser = new User({
    name, // name: name
    email,
    image: req.file.path,
    password: hashedPassword,
    places : []
  });

  try {
    await createdUser.save()
  } catch (err) {

    console.log(err);
    const error = new HttpError(
      'Creating user failed, please try again.',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Creating user failed, please try again.',
      500
    );
    return next(error);

  }



  res.status(201).json({
    userId: createdUser.id, email: createdUser.email, token: token
  });

};

const login = async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({
      email: email
    });
  } catch {
    const error = new HttpError(
      'Login input failed, please try again later.', 500
    );

    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError('Invalid creds, could not log you', 401);
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch {
    const error = new HttpError(
      'Login input failed, please try again later.', 500
    );

    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid password, could not log you', 401);
    return next(error);
  }
  let token;
  try {
    token = await jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Creating user failed, please try again.' + err,
      500
    );
    return next(error);

  }


  res.json({
    userId: existingUser.id, email: existingUser.email, token: token
 });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;