//http://gdata.youtube.com/feeds/api/videos?q=&v=2&fields=entry%28id,title,media:group%28yt:duration,yt:videoid,yt:uploaded%29,yt:statistics%29&alt=json

$(document).ready(function(){
	$(window).bind('hashchange', function() {
	// 	console.log('new res page load');
	});

});

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    console.log('mutation');
    // ...
});

observer.observe(document, {
  subtree: true,
  attributes: true
  //...
});

function isYoutubeLink(link)
{  
	//console.log(link); console.log(link.indexOf('t=') == -1 && link.indexOf('youtube.com/watch') > -1);
	return 
		link.indexOf('t=') == -1 &&
		link.indexOf('youtube.com/watch') > -1
	;
}



var aTags = document.getElementsByTagName('a');

var ytLinks     = {};
var ytDurations = {};
var ytIds       = [];

var getYoutubeIDRegex = /\/?[\&|\?]?v\/?=?([\w\-]{11})&?/i;
var getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;

var shortened = /youtu\.be/i;
				

for (i = 0; i < aTags.length; i++) {
	var a = aTags[i];
	//a.innerHTML += '...blahh';
	//console.log(a.href);
	
	if (
		a.href.indexOf('t=') == -1 &&
		a.href.indexOf('youtube.com/watch') > -1
	) {
		
		var match = getYoutubeIDRegex.exec(a.href);
		var isShortened = shortened.exec(a.href);
		var id = null;
		
		if (isShortened) {
			var smatch = getShortenedYoutubeIDRegex.exec(a.href);
			if (smatch) {
				id = smatch[1];
			}
		} else if (match) {
			id = match[1];
		} else {
			//console.log(a.href);
		}
	
		if (typeof(id) != 'undefined') {

			//console.log(a.href + ' ' + id);
			
			ytLinks[a.href] = id;
			ytIds.push(encodeURIComponent('"' + id + '"'));
		}
		
	}
	
}

ytIds = $.unique(ytIds);
ytIds.slice(0,8);

ytIdsString = ytIds.join('%7C');
ytFeedLink  = 'http://gdata.youtube.com/feeds/api/videos?q=' + ytIdsString + '&v=2&fields=entry%28id,title,media:group%28yt:duration,yt:videoid,yt:uploaded%29,yt:statistics%29&alt=json&prettyprint=true';


$.getJSON(ytFeedLink,
    function(data){
		if (data.feed.entry['length'] > 0) {
			
			for (i in data.feed.entry) {

				entry = data.feed.entry[i];

				if (typeof(entry) == 'object') {
					ytDurations[entry.id['$t'].replace("tag:youtube.com,2008:video:", '')] = entry['media$group']['yt$duration'].seconds;
				}
			}
		}
		
		for (i = 0; i < aTags.length; i++) {
			var a = aTags[i];
			
			if (
				a.href.indexOf('t=') == -1 &&
				a.href.indexOf('youtube.com/watch') > -1
			) {
			
				//console.log(ytLinks[a.href]);
				
				a.href += '&t=' + (parseInt(ytDurations[ytLinks[a.href]] * .25))
			}
		}

});





