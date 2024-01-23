const router = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const { NOT_FOUND } = require('../utils/errors');

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);

router.use('*', (req, res) => {
  res.status(NOT_FOUND).send({ message: 'Такой ссылки не существует' });
});

module.exports = router;
