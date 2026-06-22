// Background script to handle POST requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "postLinks") {
    const { url, payload } = request;
    
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (response.ok) {
          return response.text().then(text => ({
            success: true,
            status: response.status,
            statusText: response.statusText,
            body: text
          }));
        } else {
          return response.text().then(text => ({
            success: false,
            status: response.status,
            statusText: response.statusText,
            body: text
          }));
        }
      })
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    
    // Return true to indicate we'll send response asynchronously
    return true;
  }
});

