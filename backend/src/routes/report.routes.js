const express = require('express');
const { generateReport, getReports, getReportById, updateReport, deleteReport } = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/generate', generateReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

module.exports = router;
