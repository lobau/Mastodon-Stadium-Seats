const fetchDataAndDisplay = () => {
  // Clear previous data
  document.getElementById("posts").innerHTML = "";

  // The querykeys array below holds the hashtags you'lll be monitoring. You can have an unlimited number but the more you have the longer the feed will take to generate and it might change too fast.
  // Make sure to put single quotes around any new hashtags you add, and separate them with commas.
  const querykeys = ["mostodon", "lichensubscribe"];
  // The domains array holds the Mastodon instances you'll be monitoring. I find these work well but you can change them if you wish.
  const domains = [
    "mastodon.social",
    "mstdn.social",
    "mastodon.world",
    "techhub.social",
  ];
  const corsProxyUrl = "https://corsproxy.io/?";

  // Create an array to hold all the results
  let allPosts = [];

  // Create a Set to hold hashes of posts to track duplicates
  let seen = new Set();

  // Create an array to hold all the fetch promises
  let fetchPromises = [];

  // Iterate through each domain
  domains.forEach((domain) => {
    querykeys.forEach((querykey) => {
      const url =
        "https://" + domain + "/api/v1/timelines/tag/" + querykey + "?limit=40";

      let fetchPromise = fetch(corsProxyUrl + url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }
          return response.json();
        })
        .then((json) => {
          json.forEach((post) => {
            const hash = post.uri;
            if (!seen.has(hash)) {
              allPosts.push(post);
              seen.add(hash);
            }
          });
        })
        .catch(function () {
          console.log("An error occurred while fetching the data.");
        });

      fetchPromises.push(fetchPromise);
    });
  });

  Promise.all(fetchPromises).then(() => {
    allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    let top15Posts = allPosts.slice(0, 15);

    // Inserting data into HTML
    const postsContainer = document.getElementById("posts");

    // Iterate through the top 15 posts, and append them to the appropriate column
    top15Posts.forEach((post, index) => {
      if (post.media_attachments.length > 0) {
        if (post.media_attachments[0].type == "image") {
          // console.log(post);

          const postImg = post.media_attachments[0];
          const imgUrl = postImg.url;
          const imgAlt = postImg.alt;

          const postDiv = document.createElement("a");
          postDiv.className = "post";
          postDiv.tabIndex = 1;
          // postDiv.id = index;
          // postDiv.href = `#${index}`;
          postDiv.innerHTML = `
                                    <img src='${imgUrl}' alt='${imgAlt}' />
                                    <div class='post-content'>
                                      ${post.content}
                                    </div>
                                `;

          postsContainer.appendChild(postDiv);
        }
      }
    });
  });
};

// Call the function immediately to fetch and display data
fetchDataAndDisplay();

// Schedule the function to run every 90 seconds (expressed in milliseconds.) You can change this if you wish.
setInterval(fetchDataAndDisplay, 90000);
