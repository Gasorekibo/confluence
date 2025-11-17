module.exports = {
  baseUrl: process.env.CONFLUENCE_BASE_URL,
  email: process.env.CONFLUENCE_EMAIL,
  apiToken: process.env.CONFLUENCE_API_TOKEN,
  spaceKey: process.env.CONFLUENCE_SPACE_KEY,
  
  getAuthHeader() {
    return 'Basic ' + Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
  },
  
  getApiBase() {
    return `${this.baseUrl}/rest/api/content`;
  }
};