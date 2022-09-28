(async () => {
    console.log("Liking Posts!");

    let likeInterval;

    const terminateTimeout = setTimeout(() => {
        clearInterval(likeInterval);
        window.close();
    }, 5000)

    likeInterval = setInterval(() => {
        const post =  document.querySelector('[type="thumbs-up-outline"]');
        if (post) {
            clearTimeout(terminateTimeout);
            clearInterval(likeInterval);
            post.click();
            setTimeout(() => {
                window.close();
            }, 2000)
        }
    }, 1000);

})();