const { getAll, create, getOne, remove, update, login, verifyEmail, getLoggetUser} = require('../controllers/user.controllers');
const express = require('express');
const verifyJWT = require('../utils/verifyJWR');

const userRouter = express.Router();

userRouter.route('/')
    .get(getAll)
    .post(create);

userRouter.route('/:id')
    .get(verifyJWT, getOne)
    .delete(verifyJWT, remove)
    .put(verifyJWT, update);

userRouter.route('/login')
    .post(login)

userRouter.route('/me')
    .get(verifyJWT, getLoggetUser)

userRouter.route('/verify_email/:code')
    .get(verifyEmail)

module.exports = userRouter;