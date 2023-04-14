function main() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendToNotion") {
      fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
          Authorization: `Bearer ${request.api_key}`,
        },
        body: JSON.stringify(request.payload),
      })
        .then((response) => response.json())
        .then((json_response) => sendResponse({ success: true, json_response }))
        .catch((error) => sendResponse({ success: false, error }));
      // `sendResponse`を非同期で使用するため、return `true`が必要
      return true;
    }
  });
}

main();
