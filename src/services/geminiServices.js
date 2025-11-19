const dotenv = require('dotenv');
dotenv.config();
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';



async function callGeminiAPI(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const extractedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!extractedText) {
      throw new Error('Unexpected API response structure');
    }

    return extractedText.trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Generate CQL query from natural language
 */
exports.generateCQLFromQuery = async (query) => {
const today = new Date();
const isoToday = today.toISOString().split('T')[0];

// Pre-calculate useful dates (all safe YYYY-MM-DD strings)
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0];

const recent30 = daysAgo(30);   // "recently"
const recent60 = daysAgo(60);   // slightly broader for "my recent page"
const recent90 = daysAgo(90);   // "last few months"
const lastWeek = daysAgo(7);
const startOfYear = `${today.getFullYear()}-01-01`;

const prompt = `You are an expert Confluence CQL builder for a team wiki powered by the REST API.

Current date: ${isoToday}

User query: "${query}"

Generate the BEST possible CQL that works reliably with Confluence Cloud REST API.

CRITICAL RULES:
- NEVER use creator = currentUser() → it does NOT work in API calls
- NEVER use functions like startOfMonth(), startOfWeek(), endOfDay() → they cause 400 errors
- When user says "I wrote", "my page", "I created", "recently I made" → interpret as "recent pages on this topic" and add a recent date filter
- Always search BOTH title and text → use (title ~ "x" OR text ~ "x")
- Be smart with keywords:
   → "nodejs" or "node" → search for "node.js" OR "nodejs" OR "node js"
   → acronyms like "api" → search "api" only (case-insensitive by default)
- Only add date filters when time is implied ("recently", "yesterday", "last week", "my page" etc.)
- Default type = page unless "blog" or "post" is mentioned

Date mapping (use exact dates below):
- "recently", "recent", "lately", "the other day" → created >= "${recent60}"
- "my page", "I wrote", "I created" (no explicit time) → created >= "${recent60}"
- "last week" → created >= "${lastWeek}"
- "last month" or "last 30 days" → created >= "${recent30}"
- "last 3 months" → created >= "${recent90}"
- "this year" → created >= "${startOfYear}"
- If NO time reference → do NOT add any date filter

Examples you must follow:
- "nodejs page I wrote recently" → type = page AND (title ~ "node" OR text ~ "node") AND created >= "${recent60}"
- "my google calendar integration" → type = page AND (title ~ "calendar" OR text ~ "calendar" OR title ~ "google" OR text ~ "google") AND created >= "${recent60}"
- "old kubernetes deployment guide" → type = page AND (title ~ "kubernetes" OR text ~ "kubernetes") 
- "rest api with fetch" → type = page AND (text ~ "fetch" OR text ~ "rest api")

Respond ONLY with valid JSON (no markdown, no extra text, no code blocks):
{
  "cql": "exact working CQL string",
  "insights": "short, user-friendly explanation of the search",
  "entities": ["main", "keywords", "detected"]
}`;

  try {
    const response = await callGeminiAPI(prompt);
    
    // Clean response - remove markdown code blocks if present
    let cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const parsed = JSON.parse(cleanedResponse);
    
    return {
      cql: parsed.cql || `text ~ "${query}"`,
      insights: parsed.insights || "Basic text search",
      entities: parsed.entities || [query]
    };
  } catch (error) {
    console.error('Error generating CQL from query:', error);
    
    // Fallback to basic search
    return {
      cql: `text ~ "${query}"`,
      insights: "Basic text search (AI generation failed)",
      entities: [query]
    };
  }
};

/**
 * Rank search results based on relevance
 */
exports.rankSearchResults = async (query, searchResults) => {
  if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
    return searchResults;
  }

  // Prepare results summary for AI
  const resultsText = searchResults.results.slice(0, 10).map((result, index) => {
    return `${index}. Title: ${result.title || 'Untitled'}
   Excerpt: ${result.excerpt || result.body?.view?.value?.substring(0, 200) || 'No content available'}`;
  }).join('\n\n');

  const prompt = `Given the user's search query and the following Confluence search results, 
rank them by relevance and provide a relevance score (0-100) for each.

User Query: "${query}"

Search Results:
${resultsText}

Respond ONLY with a valid JSON array (no markdown, no code blocks):
[
  {
    "index": 0,
    "relevanceScore": 95,
    "reason": "why this is relevant"
  }
]

Provide scores for all ${Math.min(searchResults.results.length, 10)} results.`;

  try {
    const response = await callGeminiAPI(prompt);
    
    // Clean response
    let cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const rankings = JSON.parse(cleanedResponse);
    
    // Apply rankings to results
    const rankedResults = searchResults.results.map((result, index) => {
      const ranking = rankings.find(r => r.index === index);
      return {
        ...result,
        relevanceScore: ranking?.relevanceScore || 50,
        relevanceReason: ranking?.reason || 'Standard match'
      };
    });
    
    // Sort by relevance score
    rankedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return {
      ...searchResults,
      results: rankedResults
    };
  } catch (error) {
    console.error('Error ranking results:', error);
    
    // Return original results if ranking fails
    return searchResults;
  }
};