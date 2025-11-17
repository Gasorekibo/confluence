async function handleResponse(response) {
  const text = await response.text();
  let json;
  
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    json = { rawBody: text };
  }

  if (!response.ok) {
    const error = new Error('API request failed');
    error.status = response.status;
    error.statusText = response.statusText;
    error.details = json;
    throw error;
  }
  
  return json;
}

module.exports = { handleResponse };