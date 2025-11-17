const confluenceService = require('../services/confluenceService');

exports.search = async (req, res, next) => {
  try {
    const { cql, limit = 25, start = 0 } = req.query;
    
    if (!cql) {
      const error = new Error('CQL query parameter is required');
      error.status = 400;
      throw error;
    }

    const data = await confluenceService.search(cql, limit, start);
    res.json(data);
  } catch (err) {
    next(err);
  }
};