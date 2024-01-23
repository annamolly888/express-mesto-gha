const User = require('../modules/user');
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errors');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка: ${err.message}` }));
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
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
      } else if (err.name === 'CastError') {
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

const updateProfile = (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  User.findByIdAndUpdate(userId, { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('Not found'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при обновлении профиля',
          });
      } else if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({
            message: 'Передан некорректный id пользоателя',
          });
      } else if (err.name === 'Not found') {
        res
          .status(NOT_FOUND)
          .send({
            message: 'Пользователь с таким id не найден',
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

const updateAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  User.findByIdAndUpdate(userId, { avatar }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('Not found'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при обновлении профиля',
          });
        // eslint-disable-next-line no-constant-condition
      } else if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({
            message: 'Передан некорректный id пользоателя',
          });
      } else if (err.name === 'Not found') {
        res
          .status(NOT_FOUND)
          .send({
            message: 'Пользователь с таким id не найден',
          });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR)
          .send({
            message: `Произошла ошибка: ${err.message}`,
          });
      }
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
