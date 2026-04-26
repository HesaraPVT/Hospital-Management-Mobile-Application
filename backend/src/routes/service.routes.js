const express = require('express');
const { createService, getServices, getServiceById, updateService, deleteService } = require('../controllers/service.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', getServices);
router.post('/', authMiddleware, roleMiddleware('admin'), createService);
router.get('/:id', getServiceById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateService);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteService);

module.exports = router;
