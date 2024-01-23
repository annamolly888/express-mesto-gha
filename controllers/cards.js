const mongoose = require('mongoose');
const Card = require('../modules/card');
const {
  BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, STATUS_CREATED,
} = require('../utils/statuses');

const { ValidationError, CastError } = mongoose.Error;

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка: ${err.message}` }));
};

const createCard = (req, res) => {
  Card.create({
    ...req.body,
    owner: req.user._id,
  })
    .then((card) => res.status(STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res
          .status(BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при создании карточки',
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
      message: 'Элемент с указанным id не найден',
    });
  } else if (err instanceof CastError) {
    res.status(BAD_REQUEST).send({
      message: 'Введён некорректный id',
    });
  } else {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: `Произошла ошибка ${err.name}: ${err.message}`,
    });
  }
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('Not found'))
    .then(() => res.send({ message: 'Карточка удалена' }))
    .catch((err) => {
      sendError(err, res);
    });
};

const likeCard = (req, res) => {
  const userID = req.user._id;
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userID } },
    { new: true },
  )
    .orFail(new Error('Not found'))
    .then((card) => res.status(STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      sendError(err, res);
    });
};

const dislikeCard = (req, res) => {
  const userID = req.user._id;
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userID } },
    { new: true },
  )
    .orFail(new Error('Not found'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      sendError(err, res);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
