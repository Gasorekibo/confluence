const config = require('../config/confluence');
const { handleResponse } = require('../utils/responseHandler');

class ConfluenceService {
  constructor() {
    this.authHeader = config.getAuthHeader();
    this.apiBase = config.getApiBase();
    this.baseUrl = config.baseUrl;
  }

  async getPage(pageId, expand = 'body.view,version,space') {
    const url = `${this.apiBase}/${pageId}?expand=${expand}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': this.authHeader, 
        'Accept': 'application/json' 
      }
    });
    return handleResponse(response);
  }

  async createPage(title, content, parentId = null, spaceKey = null) {
    const payload = {
      type: 'page',
      title,
      space: { key: spaceKey || config.spaceKey },
      body: {
        storage: {
          value: content || '<p>New page</p>',
          representation: 'storage'
        }
      }
    };

    if (parentId) {
      payload.ancestors = [{ id: parentId }];
    }

    const response = await fetch(this.apiBase, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return handleResponse(response);
  }

  async updatePage(pageId, title, content, version) {
    const payload = {
      id: pageId,
      type: 'page',
      title,
      version: { number: version + 1 },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    };

    const response = await fetch(`${this.apiBase}/${pageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return handleResponse(response);
  }

  async deletePage(pageId) {
    const response = await fetch(`${this.apiBase}/${pageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': this.authHeader }
    });

    if (response.status !== 204) {
      await handleResponse(response);
    }
    
    return { success: true, pageId };
  }

  async getChildPages(pageId, limit = 25, start = 0) {
    const url = `${this.apiBase}/${pageId}/child/page?limit=${limit}&start=${start}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': this.authHeader, 
        'Accept': 'application/json' 
      }
    });
    return handleResponse(response);
  }

  async getAttachments(pageId) {
    const url = `${this.apiBase}/${pageId}/child/attachment`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': this.authHeader, 
        'Accept': 'application/json' 
      }
    });
    return handleResponse(response);
  }

  async getSpacePages(spaceKey, limit = 25, start = 0) {
    const url = `${this.apiBase}?spaceKey=${spaceKey}&limit=${limit}&start=${start}&expand=version,space`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': this.authHeader, 
        'Accept': 'application/json' 
      }
    });
    return handleResponse(response);
  }

  async copyPage(pageId, newTitle, parentId = null, spaceKey = null) {
    const url = `${this.baseUrl}/rest/api/content/${pageId}/copy`;
    const payload = {
      destination: {
        type: parentId ? 'parent_page' : 'space',
        value: parentId || spaceKey || config.spaceKey
      },
      pageTitle: newTitle,
      copyDescendants: false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return handleResponse(response);
  }

  async search(cql, limit = 25, start = 0) {
    console.log('Executing CQL Search:', cql);
    const url = `${this.baseUrl}/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=${limit}&start=${start}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': this.authHeader, 
        'Accept': 'application/json' 
      }
    });
    console.log('Search Response Status:', response);
    return handleResponse(response);
  }

  async getLabels(pageId) {
    const url = `${this.apiBase}/${pageId}/label`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': this.authHeader, 
        'Accept': 'application/json' 
      }
    });
    return handleResponse(response);
  }

  async getAllPage() {
    const url = `${this.apiBase}?limit=1000`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': this.authHeader, 
        'Accept': 'application/json' 
      }
    });
    return handleResponse(response);
  }
  async addLabels(pageId, labels) {
    const payload = labels.map(label => ({
      prefix: 'global',
      name: label
    }));

    const url = `${this.apiBase}/${pageId}/label`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return handleResponse(response);
  }
}

module.exports = new ConfluenceService();