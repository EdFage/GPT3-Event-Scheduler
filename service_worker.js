chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "create-gcal-url",
        title: "Create Google Calendar event",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == "create-gcal-url") {
        chrome.storage.sync.get(["apiKey"], function(result) {
            chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                css: 'body { cursor: wait; }'
            });
            if (result.apiKey === undefined) {
                alert("API key is not set. Please set it in the extension options.");
                chrome.runtime.openOptionsPage();
            } else {
                const apiKey = result.apiKey;
                const endpoint = "https://api.openai.com/v1/chat/completions";

                const model = "gpt-3.5-turbo";
                const prompt = `${info.selectionText}`
                const max_tokens = 256;
                const messages = [
                    {
                      role: "system",
                      content: "You create google calendar URLs from text. In all your responses, return only the google calendar url."
                    },
                    {
                      role: "user",
                      content: prompt
                    }
                  ];
                  
                  fetch(endpoint, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                      model: model,
                      messages: messages, // corrected line
                      max_tokens: max_tokens
                    })
                  })
                  .then(response => response.json())
                  .then(data => {
                    console.log(data);
                  });
                    
            }
        });
    }
});