(async () => {
  if (window.confirm("Do you want to start capturing LinkedIn Data?")) {
    chrome.storage.local.set({
      scrape: true,
    });

    const getAPIKey = setInterval(async () => {
      const API_KEY = document
      .querySelector('a[href*="/in"')
      ?.href.replaceAll("/", "")
      .split(".comin")
      .pop();


      if (API_KEY) {
        clearInterval(getAPIKey);
        chrome.storage.local.set({
          apiKey: API_KEY,
        });
        
        const getResponse = async () => {
          const res = await fetch(`https://test-api.trado.fi/?apikey=${API_KEY}&test_mode=yes`, {
            method: "get",
            mode: "cors",
          });
    
          // Testing with Test URL
          // const res = await fetch(
          //   `https://test-api.trado.fi/?apikey=123&test_mode=yes`,
          //   {
          //     method: "get",
          //     mode: "cors",
          //   }
          // );
    
          return res.json();
        };
    
        const response = await getResponse();    
        chrome.storage.local.set({
          currentResponse: response,
        });
    
        window.open(response.next_url, "_self");
      }
  
    }, 100);

    
  }
})();
