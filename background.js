chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});


chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (tab.url.includes('linkedin.com/in') && changeInfo.status == 'complete') {
    chrome.scripting.insertCSS(
      {
        target: { tabId: tab.id },
        files: ["style.css"]
      },
      () => { console.log('CSS Injected') });
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['scripts/stack-script.js']
      },
      () => { console.log("Executed Script") });
  }
});


chrome.runtime.onMessage.addListener((request, sender) => {
  console.log(request);
  chrome.tabs.query({ currentWindow: true }, function(tabs) { 
    const activeTab = tabs.find(tab => tab.active);
    const nonActiveTab = tabs.find(tab => !tab.active);

    chrome.tabs.update(nonActiveTab.id, {selected: true})
  } );

})

