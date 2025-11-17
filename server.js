// require('dotenv').config();
// const {
//   CONFLUENCE_BASE_URL,
//   CONFLUENCE_EMAIL,
//   CONFLUENCE_API_TOKEN,
//   CONFLUENCE_SPACE_KEY
// } = process.env;

// const authHeader = 'Basic ' + Buffer.from(`${CONFLUENCE_EMAIL}:${CONFLUENCE_API_TOKEN}`).toString('base64');

// const API_BASE = `${CONFLUENCE_BASE_URL}/rest/api/content`;
// async function handleResponse(response) {
//   const text = await response.text();
//   let json;
//   try {
//     json = text ? JSON.parse(text) : {};
//   } catch (e) {
//     json = { rawBody: text };
//   }

//   if (!response.ok) {
//     console.error(`HTTP ${response.status} ${response.statusText}`);
//     console.error('Error details:', json);
//     throw new Error(`API error: ${response.status}`);
//   }
//   return json;
// }
// async function getPage(pageId) {
//   const url = `${API_BASE}/${pageId}?expand=body.view,version,space`;
//   const res = await fetch(url, {
//     method: 'GET',
//     headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
//   });
//   const data = await handleResponse(res);
//   console.log('Page fetched:', data.title);
//   return data;
// }

// async function createPage(title, htmlContent = '<p>Hello from native fetch!</p>', parentId = null) {
//   const payload = {
//     type: 'page',
//     title,
//     space: { key: CONFLUENCE_SPACE_KEY },
//     body: {
//       storage: {
//         value: htmlContent,
//         representation: 'storage'
//       }
//     }
//   };

//   if (parentId) {
//     payload.ancestors = [{ id: parentId }];
//   }

//   const res = await fetch(API_BASE, {
//     method: 'POST',
//     headers: {
//       'Authorization': authHeader,
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     },
//     body: JSON.stringify(payload)
//   });

//   const data = await handleResponse(res);
//   console.log(`Page created → ID: ${data.id}, Title: "${data.title}"`);
//   console.log(`Link: ${data._links.webui}`);
//   return data;
// }
// async function updatePage(pageId, currentVersion, newTitle, newHtmlContent) {
//   const payload = {
//     id: pageId,
//     type: 'page',
//     title: newTitle,
//     version: { number: currentVersion + 1 },
//     body: {
//       storage: {
//         value: newHtmlContent,
//         representation: 'storage'
//       }
//     }
//   };

//   const res = await fetch(`${API_BASE}/${pageId}`, {
//     method: 'PUT',
//     headers: {
//       'Authorization': authHeader,
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     },
//     body: JSON.stringify(payload)
//   });

//   const data = await handleResponse(res);
//   console.log(`Page updated → New version: ${data.version.number}`);
//   return data;
// }

// // DELETE a page
// async function deletePage(pageId) {
//   const res = await fetch(`${API_BASE}/${pageId}`, {
//     method: 'DELETE',
//     headers: { 'Authorization': authHeader }
//   });

//   if (res.status === 204) {
//     console.log(`Page ${pageId} deleted successfully.`);
//   } else {
//     await handleResponse(res); // will throw if not 204
//   }
// }
// (async () => {
//   try {
//     const newPage = await createPage('Test Page from Native Fetch', '<h2>Hello Rwanda!</h2><p>Created on November 17, 2025 using only built-in fetch.</p>');

//     const pageId = newPage.id;

//     const page = await getPage(pageId);
//     await updatePage(pageId, page.version.number, 'Updated Title (Native Fetch)', '<p>Content updated at 12:02 PM CAT</p>');

//   } catch (err) {
//     console.log(err)
//     console.error('Something went wrong:', err.message);
//   }
// })();


require('dotenv').config();
const express = require('express');
const pageRoutes = require('./src/routes/pageRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const labelRoutes = require('./src/routes/labelRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(express.json());

// Routes
app.use('/api/pages', pageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/labels', labelRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Confluence API server running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
});

module.exports = app;