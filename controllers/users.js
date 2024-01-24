const mongoose = require('mongoose');
const User = require('../modules/user');
const {
  BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, STATUS_CREATED,
} = require('../utils/statuses');

const { ValidationError, CastError } = mongoose.Error;

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка: ${err.message}` }));
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(STATUS_CREATED).send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res
          .status(BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при создании профиля',
          });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR)
          .send({
            message: `Произошла ошибка ${err.name}: ${err.message}`,
          });
      }
    });
};

const getUserById = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => new Error('Not found'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'Not found') {
        res
          .status(NOT_FOUND)
          .send({
            message: 'Пользователь с таким id не найден',
          });
      } else if (err instanceof CastError) {
        res
          .status(BAD_REQUEST)
          .send({
            message: 'Введён некорректный id',
          });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR)
          .send({
            message: `Произошла ошибка ${err.name}: ${err.message}`,
          });
      }
    });
};

const sendError = (err, res) => {
  if (err instanceof ValidationError) {
    res.status(BAD_REQUEST).send({
      message: 'Переданы некорректные данные',
    });
  } else if (err.message === 'Not found') {
    res.status(NOT_FOUND).send({
      message: 'Объект с таким id не найден',
    });
  } else {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: `Произошла ошибка ${err.name}: ${err.message}`,
      error: err,
    });
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

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
