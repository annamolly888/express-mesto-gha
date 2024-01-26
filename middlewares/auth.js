// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/Unauthorized');

// eslint-disable-next-line consistent-return
const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new Unauthorized('Необходимо авторизоваться'));
  }

  req.user = payload;

  next();
};

module.exports = { auth };
