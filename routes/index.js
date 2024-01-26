const router = require('express').Router();
const { auth } = require('../middlewares/auth');
const { login, createUser } = require('../controllers/users');
const { signInValidation, signUpValidation } = require('../utils/validation');
const NotFound = require('../errors/NotFound');

router.use('/signin', signInValidation, login);
router.use('/signup', signUpValidation, createUser);

router.use(auth);

router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

router.use('/*', (req, res, next) => {
  next(new NotFound('Такой ссылки не существует'));
});

module.exports = router;
