const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/:pageId', pageController.getPage);
router.get('/', pageController.getAllPage);
router.post('/', pageController.createPage);
router.put('/:pageId', pageController.updatePage);
router.delete('/:pageId', pageController.deletePage);
router.get('/:pageId/children', pageController.getChildPages);
router.get('/:pageId/attachments', pageController.getAttachments);
router.post('/:pageId/copy', pageController.copyPage);
router.get('/spaces/:spaceKey', pageController.getSpacePages);

module.exports = router;