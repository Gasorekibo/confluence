const confluenceService = require('../services/confluenceService');
const geminiService = require('../services/geminiServices');

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

exports.intelligentSearch = async (req, res, next) => {
  try {
    const { query, limit = 25, start = 0 } = req.body;
    
    if (!query) {
      const error = new Error('Query parameter is required');
      error.status = 400;
      throw error;
    }

    // Step 1: Use Gemini AI to analyze the natural language query
    const aiAnalysis = await geminiService.generateCQLFromQuery(query);
    
    // Step 2: Search Confluence using generated CQL
    const searchResults = await confluenceService.search(aiAnalysis.cql, limit, start);
    
    // Step 3: Use AI to rank results based on relevance
    const rankedResults = await geminiService.rankSearchResults(query, searchResults);
    
    res.json({
      originalQuery: query,
      generatedCQL: aiAnalysis.cql,
      aiInsights: aiAnalysis.insights,
      results: rankedResults,
      metadata: {
        totalResults: searchResults.size || 0,
        limit,
        start
      }
    });
  } catch (err) {
    next(err);
  }
};