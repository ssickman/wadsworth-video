//http://gdata.youtube.com/feeds/api/videos?q=&v=2&fields=entry%28id,title,media:group%28yt:duration,yt:videoid,yt:uploaded%29,yt:statistics%29&alt=json

$(document).ready(function(){
	$(window).bind('hashchange', function() {
	// 	console.log('new res page load');
	});

});

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    //console.log('mutation');
    l = new LinkAppender();
	l.getLinks().getYtIds().getYtData(l.ytIds);
});

observer.observe(document, {
  subtree: true,
  attributes: true
  //...
});

function LinkAppender() 
{
	console.log('starting link appender');

	this.ytLinks     = {};
	this.ytDurations = {};
	this.ytIds       = [];
	
	this.getYoutubeIDRegex = /\/?[\&|\?]?v\/?=?([\w\-]{11})&?/i;
	this.getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;
	this.shortened = /youtu\.be/i;
	
	this.appendedClass  = 'wv-time-appended';
	this.processedClass = 'wv-processed';
	
	this.getLinks = function()
	{
		this.aTags = $(this.getASelector());
		
		return this;
	}
	
	this.getASelector = function()
	{
		return 'a:not(.' + this.appendedClass + ' .' + this.processedClass + ')';
	}
		
	this.isYoutubeLink = function(link, debug)
	{  		
		if (debug) {
			console.log(link);
			console.log(typeof(link) == 'string' && link.indexOf('t=') == -1 && link.indexOf('youtube.com/watch') > -1);
		}
		
		return typeof(link) == 'string' && link.indexOf('t=') == -1 && link.indexOf('youtube.com/watch') > -1 ;
		
		if(
			typeof(link) == 'string' && 
			link.indexOf('t=') == -1 &&
			link.indexOf('youtube.com/watch') > -1 
		) {
			return true;
		} else {
			return false;		
		}

	}
	
	this.getYtIds = function()
	{
		for (i = 0; i < this.aTags.length; i++) {
			var a = $(this.aTags[i]);
			
			if (this.isYoutubeLink(a.attr('href'))) {
				
				match = this.getYoutubeIDRegex.exec(a.attr('href'));
				isShortened = this.shortened.exec(a.attr('href'));
				ytId = null;
				
				if (isShortened) {
					smatch = this.getShortenedYoutubeIDRegex.exec(a.attr('href'));
					if (smatch) {
						ytId = smatch[1];
					}
				} else if (match) {
					ytId = match[1];
				}
			
				if (typeof(ytId) != 'undefined') {			
					this.ytLinks[a.attr('href')] = ytId;
					this.ytIds.push(encodeURIComponent('"' + ytId + '"'));
				}
				
			}
		}
		
		this.ytIds = $.unique(this.ytIds);
		
		return this;
	}
	
	this.parseAjax = function(data)
	{
		if (
			typeof(data.feed.entry) != 'undefined' &&
			data.feed.entry['length'] > 0
		) {
			
			for (i in data.feed.entry) {
	
				entry = data.feed.entry[i];
	
				if (typeof(entry) == 'object') {
					this.ytDurations[entry.id['$t'].replace("tag:youtube.com,2008:video:", '')] = entry['media$group']['yt$duration'].seconds;
				}
			}
		}
		
		for (i = 0; i < this.aTags.length; i++) {
			var a = $(this.aTags[i]);
			
			if (
				this.isYoutubeLink(a.attr('href')) &&
				typeof(this.ytDurations[this.ytLinks[a.attr('href')]]) != 'undefined'
			) {
				a.attr('href', a.attr('href') + '&t=' + (parseInt(this.ytDurations[this.ytLinks[a.attr('href')]] * .25)));
				a.addClass(this.processedClass);
			} 
		}
	
	}
	
	this.getYtData = function(ytIds)
	{
		ytIdsString = ytIds.join('%7C');
		ytFeedLink  = 'http://gdata.youtube.com/feeds/api/videos?q=' + ytIdsString + '&v=2&fields=entry%28id,title,media:group%28yt:duration,yt:videoid,yt:uploaded%29,yt:statistics%29&alt=json&prettyprint=true';
		
		var self = this;
		
		$.getJSON(
			ytFeedLink,
		    function(data) {  self.parseAjax(data); }
		);
		
	}
	
	return this;
}

l = new LinkAppender();
l.getLinks().getYtIds().getYtData(l.ytIds);









