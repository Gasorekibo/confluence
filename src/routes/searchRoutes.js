const express = require('express');
const router = express.Router();
const searchController = require('../controllers/intelligentSearch');

router.get('/', searchController.search);
router.post('/intelligent', searchController.intelligentSearch);

module.exports = router;