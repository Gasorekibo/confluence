const confluenceService = require('../services/confluenceService');

exports.getLabels = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const data = await confluenceService.getLabels(pageId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.addLabels = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { labels } = req.body;

    if (!labels || !Array.isArray(labels)) {
      const error = new Error('Labels array is required');
      error.status = 400;
      throw error;
    }

    const data = await confluenceService.addLabels(pageId, labels);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};