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
                const now = new Date();
                const model = "gpt-3.5-turbo";
                const prompt = `${info.selectionText}`
                const max_tokens = 256;
                const messages = [
                    {
                      role: "system",
                      content: `You are part of a chrome extension that creates google calendar events.  Users select some text on a website and send it to you. You must then create a google calendar event URL based on this text. Return only a google calendar URL and nothing else.le calendar URLs from text. In all your responses, return only the google calendar URL. Note that the current date is ${now}.`
                    },
                    {
                      role: "user",
                      content: prompt
                    }
                  ];
                  console.log(messages);
                  
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
                    const calendarURL = data.choices[0].message.content;
                        chrome.scripting.insertCSS({
                            target: { tabId: tab.id },
                            css: 'body { cursor: default; }'
                        });
                        chrome.tabs.create({
                            url: calendarURL
                        });
                  });
                    
            }
        });
    }
});