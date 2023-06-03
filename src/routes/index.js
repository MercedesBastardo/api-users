const express = require('express');
const userRouter = require('./user.router');
const router = express.Router();

// Acá van las rutas
router.use("/users", userRouter)


module.exports = router;