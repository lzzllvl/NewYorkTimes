
/**
  * A lot of this supposes a compliant user.
  */

var authKey = "b9f91d369ff59547cd47b931d8cbc56b:0:74623931";
var queryURLBase = "https://api.nytimes.com/svc/search/v2/articlesearch.json?";

var formatDate = (date) => {
  //split the date into days and time of day, only care about days
  var day = date.split("T")[0].split("-");
  //array destructuring (shout out Orlando for putting me on to this with his bubble sort)
  [day[0], day[1], day[2]] = [day[1], day[2], day[0]];
  //americanizing this euro date
  return day.join("/");
}


//reset the page values and remove articles.
var reset = (event) => {
  event.preventDefault();
  $("#articles").empty();
  $("#records").val("");
  $("#searchTerm").val("");
  $("#startYear").val("");
  $("#endYear").val("");
}



//this function takes the JSON data and makes divs accordingly
var placeArticles = (response) => {
  // ========= articleDiv
  //response.response is pretty annoying, so Im going to save it in a variable
  var res = response.response;

  // we are getting the value of num records here because the API doesn't have
  //a limit parameter, it takes 10 every time. Hacky Solution but meh.
  var numRecords = $("#records").val() || 10;
  // we need to loop through the responses so
  for(var i = 0; i < numRecords; i++){
    var articleDiv = $("<div>").addClass("newarticles");
    // =========headline
    var headline = res.docs[i].headline.main;
    $("<h1>").text(headline)
      .addClass("newH1")
      .appendTo(articleDiv);
    // =========author
    var author = res.docs[i].byline ?  res.docs[i].byline.original : "Unknown Original Author";
    $("<p>").text(author)
      .appendTo(articleDiv);
    // ==========section
    var section = res.docs[i].source || "Unknown Source";
    $("<p>").text("Section: " +section)
      .appendTo(articleDiv);
    // ==========date
    var date = res.docs[i].pub_date;
    $("<p>").text(formatDate(date))
      .appendTo(articleDiv);
    // ===========url
    var url = res.docs[i].web_url;
    $('<a>').text(url)
      .attr('href', url)
      .appendTo(articleDiv);
    // =========over all attachment to HTML
    $('#articles').append(articleDiv);
  }
}


var readyFunc = () => {
  $("#clearBtn").click(reset);
  $("#searchBtn").click(()=>{
    // event.preventDefault();

    // this is the only one we must explicitly set before ajax call,
    //otherwise api will response with an error
    var searchTerm = $("#searchTerm").val().trim().toLowerCase() || "march madness";

    //these are set in the object if they exist
    var startYear = $("#startYear").val().trim();
    var endYear = $("#endYear").val().trim();
    //creating a query object that will accept values based on fields
    let queryObj = {"api-key":authKey, q: searchTerm};


    //this is a check for if the fields have values
    //these ifs will also break the query if they send in a fake year, letters or one
    //outside of the nyt api range.  Ajax call will return an error response.
    if(startYear){
      queryObj.begin_date = startYear + "0101";// date needs to be in format YYYYMMDD
    }
    if(endYear){
      queryObj.end_date = endYear+ "0101";
    }
    queryURLBase += $.param(queryObj);
    $.ajax({url: queryURLBase, method:"GET"})
    .done((response) => {
      //remove old results and add the new ones
      $("#articles").empty();
      placeArticles(response);
    });
  })
}
