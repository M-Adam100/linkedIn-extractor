chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
  chrome.storage.local.set({
    scrape: false
  });
});


chrome.runtime.onMessage.addListener(async (request, sender) => { 
  if (request.message = "LIKE_POSTS") {
    chrome.windows.create(
      {
        url: request.url,
        state: 'minimized'
      },
      ({ tabs: [newTab] }) => {
        setTimeout(() => {
          chrome.scripting.executeScript(
            {
              target: { tabId: newTab.id },
              files: ['scripts/like-posts.js']
            },
            (res) => { console.log(res); console.log("Executed Script") });
        }, 2000);

      });
  }
})


chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  const { scrape } = await chrome.storage.local.get(['scrape']);
  if (tab.url.includes('linkedin.com/in') && !tab.url.includes('/recent-activity/') && changeInfo.status == 'complete' && scrape) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['scripts/linkedin-extractor.js']
      },
      () => { console.log("Executed Script") });
  } else if (
    tab.url.includes('linkedin.com/feed') && changeInfo.status == 'complete'
  ) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['scripts/start.js']
      },
      () => { console.log("Executed Script") });
  }
});


// chrome.runtime.onMessage.addListener((request, sender) => {
//   console.log(request);
//   chrome.tabs.query({ currentWindow: true }, function(tabs) { 
//     const activeTab = tabs.find(tab => tab.active);
//     const nonActiveTab = tabs.find(tab => !tab.active);

//     chrome.tabs.update(nonActiveTab.id, {selected: true})
//   } );

// })

