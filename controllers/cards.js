const mongoose = require('mongoose');
const Card = require('../modules/card');
const {
  STATUS_CREATED,
} = require('../utils/statuses');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

const { ValidationError, CastError } = mongoose.Error;

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

const createCard = (req, res, next) => {
  Card.create({
    ...req.body,
    owner: req.user._id,
  })
    .then((card) => res.status(STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

const sendError = (err, res, next) => {
  if (err instanceof CastError) {
    next(new BadRequest('Введён некорректный id'));
  } else if (err.message === 'Not found') {
    next(new NotFound('Карточка с указанным id не найдена'));
  } else {
    next(err);
  }
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const ownerId = req.user._id;

  Card.findById(cardId)
    .orFail(() => new NotFound('Карточка с указанным id не найдена'))
    .then((card) => {
      if (card.owner.equals(ownerId)) {
        Card.deleteOne(card)
          .then(() => res.send({ message: `Карточка ${card.name} удалена` }));
      } else {
        next(new Forbidden('Невозможно удалить карточку, созданную другим пользователем'));
      }
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные для удаления карточки'));
      } else {
        next(err);
      }
    });
};

const updateCard = (cardId, updateBody) => Card.findByIdAndUpdate(cardId, updateBody, {
  new: true,
  runValidators: true,
})
  .orFail(new Error('Not found'));

const likeCard = (req, res, next) => {
  const userID = req.user._id;
  const { cardId } = req.params;
  const updateBody = { $addToSet: { likes: userID } };

  updateCard(cardId, updateBody)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      sendError(err, res, next);
    });
};

const dislikeCard = (req, res, next) => {
  const userID = req.user._id;
  const { cardId } = req.params;
  const updateBody = { $pull: { likes: userID } };

  updateCard(cardId, updateBody)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      sendError(err, res, next);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
