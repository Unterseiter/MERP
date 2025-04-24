const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestEventController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/requests', requestController.createRequest);
router.get('/requests', requestController.getRequests);
router.get('/requests/:id', requestController.getRequestDetails);
router.patch('/requests/:id/status', requestController.updateRequestStatus);
router.patch('/requests/:id/report', requestController.updateReport);
router.delete('/requests/:id', requestController.deleteRequest);

module.exports = router;