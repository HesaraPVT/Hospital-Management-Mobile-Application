const express = require('express');
const { registerUser, loginUser, getMe, changePassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/change-password', authMiddleware, changePassword);
router.get('/me', authMiddleware, getMe);

module.exports = router;
