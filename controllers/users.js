const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const User = require('../modules/user');
const {
  DUBLICATE_KEY,
  STATUS_CREATED,
} = require('../utils/statuses');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');

const { ValidationError, CastError } = mongoose.Error;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then(() => res.status(STATUS_CREATED).send({
      name, about, avatar, email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании профиля'));
      } else if (err.code === DUBLICATE_KEY) {
        next(new Conflict('Пользователь с таким Email уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => new NotFound('Пользователь с таким id не найден'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Введён некорректный id'));
      } else {
        next(err);
      }
    });
};

const sendError = (err, res, next) => {
  if (err instanceof ValidationError) {
    next(new BadRequest('Переданы некорректные данные'));
  } else if (err.message === 'Not found') {
    next(new NotFound('Объект с таким id не найден'));
  } else {
    next(err);
  }
};

const updateUser = (userId, updateBody) => User.findByIdAndUpdate(userId, updateBody, {
  new: true,
  runValidators: true,
})
  .orFail(new Error('Not found'));

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  updateUser(req.user._id, { name, about })
    .then((user) => res.send({ data: user }))
    .catch((err) => sendError(err, res));
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  updateUser(req.user._id, { avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => sendError(err, res));
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      return res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      }).send({ token });
    })
    .catch((err) => {
      sendError(err, res, next);
    });
};

const getLoggedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).orFail(() => { throw new Error('Not found'); });
    res.send({ data: user });
  } catch (err) {
    if (err instanceof CastError) {
      err.message = 'Передан некорректный id пользователя';
    }
    sendError(err, res, next);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getLoggedUser,
};
