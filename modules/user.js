const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, 'Минимальная длина поля name'],
    maxlength: [30, 'Максимальная длина поля name'],
  },
  about: {
    type: String,
    required: true,
    minlength: [2, 'Минимальная длина поля about'],
    maxlength: [30, 'Максимальная длина поля about'],
  },
  avatar: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('user', userSchema);
