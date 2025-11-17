const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labelController');

router.get('/:pageId', labelController.getLabels);
router.post('/:pageId', labelController.addLabels);

module.exports = router;

module.exports = router;