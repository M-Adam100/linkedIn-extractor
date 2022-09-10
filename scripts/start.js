(async () => {
  if (window.confirm("Do you want to start capturing LinkedIn Data?")) {
    chrome.storage.local.set({
      scrape: true,
    });

    const API_KEY = 123;
    const getResponse = async () => {
      const res = await fetch(`https://test-api.trado.fi/?apikey=${API_KEY}`, {
        method: "get",
        mode: "cors",
      });

      return res.json();
    };

    const response = await getResponse();
    window.open(response.next_url, "_self");
  }
})();
