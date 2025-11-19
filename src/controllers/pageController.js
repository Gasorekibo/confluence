const confluenceService = require('../services/confluenceService');

exports.getPage = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const expand = req.query.expand || 'body.view,version,space';
    const data = await confluenceService.getPage(pageId, expand);
    const response = {
      id: data.id,
      type: data.type,
      title: data.title,
      version: {
        number: data.version.number,
        minorEdit: data.version.minorEdit,
        by: data.version.by.displayName,
        when: data.version.when
      },
      space: {
        id: data.space.id,
        key: data.space.key,
        name: data.space.name
      },
      body: {
        content: data.body.view.value
      }
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
};

exports.getAllPage = async (req, res, next) => {
  try {
    const data = await confluenceService.getAllPage();
 
    res.json(data);
  } catch (error) {
    next(error);
  }
}
exports.createPage = async (req, res, next) => {
  try {
    const { title, content, parentId, spaceKey } = req.body;
    
    if (!title) {
      const error = new Error('Title is required');
      error.status = 400;
      throw error;
    }

    const data = await confluenceService.createPage(title, content, parentId, spaceKey);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.updatePage = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { title, content, version } = req.body;

    if (!title || !content || version === undefined) {
      const error = new Error('Title, content, and version are required');
      error.status = 400;
      throw error;
    }

    const data = await confluenceService.updatePage(pageId, title, content, version);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.deletePage = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const data = await confluenceService.deletePage(pageId);
    res.json({ message: `Page ${pageId} deleted successfully`, ...data });
  } catch (err) {
    next(err);
  }
};

exports.getChildPages = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { limit = 25, start = 0 } = req.query;
    const data = await confluenceService.getChildPages(pageId, limit, start);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getAttachments = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const data = await confluenceService.getAttachments(pageId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getSpacePages = async (req, res, next) => {
  try {
    const { spaceKey } = req.params;
    const { limit = 25, start = 0 } = req.query;
    const data = await confluenceService.getSpacePages(spaceKey, limit, start);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.copyPage = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { newTitle, parentId, spaceKey } = req.body;

    if (!newTitle) {
      const error = new Error('New title is required');
      error.status = 400;
      throw error;
    }

    const data = await confluenceService.copyPage(pageId, newTitle, parentId, spaceKey);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};