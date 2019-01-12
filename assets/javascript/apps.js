var config = {
  //Firebase Configuration Information
  apiKey: "AIzaSyD__E2ZYbHa1WJAGNzsV9hxjndLC_uxTdY",
  authDomain: "news-and-views-92a23.firebaseapp.com",
  databaseURL: "https://news-and-views-92a23.firebaseio.com",
  projectId: "news-and-views-92a23",
  storageBucket: "news-and-views-92a23.appspot.com",
  messagingSenderId: "1016964464347"
};
firebase.initializeApp(config);
var database = firebase.database();
/*
 *  Once on load and when any value in the database changes:
 *  1. Create an array of strings containing the last 10 unique queries stored
 *  2. Translate those strings into new button elements displayed to the page in the #buttons Div
 */
database
  .ref("/users")
  .orderByChild("dateAdded")
  .on("value", function(snapshot) {
    var data = []; //array to translate snapshot

    snapshot.forEach(ss => {
      if (!data.includes(ss.val())) {
        data.push(ss.val());
      } //If unique value add to data array
    });

    /*
     *  Creates buttons from array of data
     */
    function buttonCreation() {
      $("#buttons").empty();
      for (i = data.length - 1; i > data.length - 11; i--) {
        if (data[i].length > 0) {
          var searchTermBtn = $("<button>");
          searchTermBtn.addClass("recentSearchButton btn btn-secondary m-2");
          searchTermBtn.attr("value", data[i]);
          searchTermBtn.text(data[i]);
          $("#buttons").append(searchTermBtn);
        }
      }
    }

    buttonCreation();

    $(".recentSearchButton").on("click", function() {
      var recentSearchTerm = $(this).attr("value");
      $("#submitInput").val(recentSearchTerm);
    });
  });
/*
 * Click event listener for submitButton
 * uses submitInput for API calls to construct and display article+video pairs
 */
$("#submitButton").on("click", async function() {
  event.preventDefault();
  $("#contentDiv").empty(); // Remove existing results if there are any
  const submitQuery = encodeURI(
    $("#submitInput")
      .val()
      .trim()
  );
  if (submitQuery.length > 0 && submitQuery.length < 256) {
    searchAPIs(submitQuery);
  } else $("#contentDiv").html("<h1>Search Query must not be empty or longer than 256 letters!");
});
/*
 *  searchAPIs takes a query string and conducts a series of AJAX requests
 */
async function searchAPIs(query) {
  database.ref("/users").push(decodeURI(query));
  const queryURL = `https://newsapi.org/v2/everything?q=${query}&sources=cnn,abc-news&sortBy=popularity&language=en&apiKey=d63c8717380a49a38ca6816cd34124b4`;
  const res = await $.get(queryURL); //Pause execution until result
  if (res.articles.length !== 0) {
    for (let i = 0; i < res.articles.length; i++) {
      const article = res.articles[i]; // Get each article from response object
      requestVideo(article.title) // Each call awaits a result before advancing
        .then(video => {
          appendDiv(article, video); // Displays article+video result in contentDiv
        });
    }
  } else
    $("#contentDiv").html(`<h1>There were no results found for ${query}!</h1>`);
}
/*
 * method breakout to carry article information through AJAX request
 */
async function requestVideo(title) {
  const res = await $.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURI(
      title
    )}&safeSearch=strict&type=video&videoEmbeddable=true&key=AIzaSyDJqoHy0XZeGt8zGImByA59Maqgc7m3LZs`
  );
  return { videoId: res.items[0].id.videoId, title };
}
/*
 * Appends article+video information to the contentDiv
 */
function appendDiv(article, video) {
  //Extract publishing information
  const day = article.publishedAt.substring(8, 10);
  const month = article.publishedAt.substring(5, 7);
  const year = article.publishedAt.substring(0, 4);

  //Construct article+video content for HTML
  $("#contentDiv").append(`
                    <div class='row mb-3'>
                        <div class='col-xl-6 my-2'>
                            <div class="card border aspect-ratio">
                                <h5 class="card-header cardHead">${
                                  article.title
                                }</h5>
                                <div class="card-body pb-0">
                                    <div class="card-text"><p class="cardPad">${
                                      article.description
                                    }</p></div>
                                </div>
                                <div class="card-footer bg-transparent border-top-0 pt-0"><p class="card-text">Published: ${month}-${day}-${year}
                                    <a href="${
                                      article.url
                                    }" class="btn btn-secondary float-right">Source</a></p>
                                </div>
                            </div>
                        </div>
                        <div class='col-xl-6 my-2'>
                            <div class='border aspect-ratio'>
                                <iframe src="https://www.youtube.com/embed/${
                                  video.videoId
                                }/" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                            </div>
                        </div>
                    </div>
                    `);
}
/*
 *  When 'Random' button is clicked, perform a search using a random word from the defined list
 */
$("#randomButton").on("click", function() {
  var notReallyRandomWord = [
    "Caustic",
    "Dominica",
    "Genethlialogy",
    "White House",
    "Disasters",
    "Epic",
    "Football",
    "Children",
    "Mexico",
    "Russia",
    "Florida",
    "Technology",
    "High School",
    "Alligator",
    "Probe",
    "Coffee",
    "Salmonella",
    "Africa",
    "Guatemala",
    "Visible",
    "Hero",
    "Million",
    "Tactic",
    "Dead",
    "Indignation",
    "Hilariously",
    "Korea",
    "Limbo",
    "American",
    "Horror",
    "Clinician",
    "Republican",
    "Flu",
    "Rescue",
    "Google",
    "Queen",
    "Synthetic",
    "Orphanage",
    "Decade",
    "Allegations",
    "NASA",
    "Family",
    "Deploy",
    "Culture",
    "Intervillous",
    "Salacious",
    "Cancer",
    "Scientific",
    "Discovery",
    "Hurricane"
  ];

  var randomWord =
    notReallyRandomWord[Math.floor(Math.random() * notReallyRandomWord.length)];
  searchAPIs(randomWord);
  //Plaes the value of the random work in the search bar for the user to click go
  $("#submitInput").val(randomWord);
});
