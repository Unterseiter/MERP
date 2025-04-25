const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestEventController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', requestController.createRequest);
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestDetails);
router.patch('/:id/status', requestController.updateRequestStatus);
router.patch('/:id/report', requestController.updateReport);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;