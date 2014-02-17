//http://gdata.youtube.com/feeds/api/videos/4TSJhIZmL0A?v=2&alt=jsonc&callback=youtubeFeedCallback&prettyprint=true


aTags = document.getElementsByTagName('a');

for (i = 0; i < aTags.length; i++) {
	var a = aTags[i];
	//a.innerHTML += '...blahh';
	console.log(a.href);
	
	if (
		a.href.indexOf('http://www.youtube.com/watch') == 0  ||
		a.href.indexOf('https://www.youtube.com/watch') == 0 ||
		a.href.indexOf('http://youtube.com/watch') == 0  ||
		a.href.indexOf('https://youtube.com/watch') == 0
	) {
		a.href += '&t=30s';
	}
}