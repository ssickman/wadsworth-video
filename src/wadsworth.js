//http://gdata.youtube.com/feeds/api/videos?q=&v=2&fields=entry%28id,title,media:group%28yt:duration,yt:videoid,yt:uploaded%29,yt:statistics%29&alt=json


MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    //console.log('mutation');
	chrome.runtime.sendMessage({method: "getLocalStorage", key: "skipPercentage"}, function(response) {
		l = new LinkAppender();
		l.skipPercentage = response.data;
		l.getLinks().getYtIds().getYtData(l.ytIds);
	 	//console.log(l.skipPercentage);
	});
	   
   
   
});

observer.observe(document, {
  subtree: true,
  attributes: true
  //...
});

function LinkAppender() 
{
	//console.log('starting link appender');
	var self = this;
	
	//console.log(chrome.extension.getBackgroundPage().localStorage['skipPercentage']);
	
	
	if (!self.skipPercentage) {
		self.skipPercentage = 33;
	}
	
	//console.log(self.skipPercentage);

	self.ytLinks     = {};
	self.ytDurations = {};
	self.ytIds       = [];
	
	self.getYoutubeIDRegex = /\/?[\&|\?]?v\/?=?([\w\-]{11})&?/i;
	self.getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;
	self.shortened = /youtu\.be/i;
	
	self.appendedClass  = 'wv-time-appended';
	self.processedClass = 'wv-processed';
	
	self.getLinks = function()
	{
		self.aTags = $(self.getASelector());
		
		return this;
	}
	
	self.getASelector = function()
	{
		return 'a:not(.' + self.appendedClass + ' .' + self.processedClass + ')';
	}
		
	self.isYoutubeLink = function(link, debug)
	{  		
		if (debug) {
			console.log(link);
			console.log(typeof(link) == 'string' && link.indexOf('t=') == -1 && link.indexOf('youtube.com/watch') > -1);
		}
		
		//return typeof(link) == 'string' && link.indexOf('t=') == -1 && link.indexOf('youtube.com/watch') > -1 ;
		
		if(
			typeof(link) == 'string' && 
			link.indexOf('t=') == -1 &&
			(
				link.indexOf('youtube.com/watch') > -1 ||
				(
					window.location.hostname.indexOf('youtube.com') > -1 &&
					link.indexOf('/watch') > -1 
				)
			)
		) {
			return true;
		} else {
			return false;		
		}

	}
	
	self.getYtIds = function()
	{
		for (i = 0; i < self.aTags.length; i++) {
			var a = $(self.aTags[i]);
			
			if (self.isYoutubeLink(a.attr('href'))) {
				
				match = self.getYoutubeIDRegex.exec(a.attr('href'));
				isShortened = self.shortened.exec(a.attr('href'));
				ytId = null;
				
				if (isShortened) {
					smatch = self.getShortenedYoutubeIDRegex.exec(a.attr('href'));
					if (smatch) {
						ytId = smatch[1];
					}
				} else if (match) {
					ytId = match[1];
				}
			
				if (typeof(ytId) != 'undefined') {			
					self.ytLinks[a.attr('href')] = ytId;
					self.ytIds.push(encodeURIComponent('"' + ytId + '"'));
				}
				
			}
		}
		
		self.ytIds = $.unique(self.ytIds);
		
		return this;
	}
	
	self.parseAjax = function(data)
	{
		if (
			typeof(data.feed.entry) != 'undefined' &&
			data.feed.entry['length'] > 0
		) {
			
			for (i in data.feed.entry) {
	
				entry = data.feed.entry[i];
	
				if (typeof(entry) == 'object') {
					self.ytDurations[entry.id['$t'].replace("tag:youtube.com,2008:video:", '')] = entry['media$group']['yt$duration'].seconds;
				}
			}
		}
		
		for (i = 0; i < self.aTags.length; i++) {
			var a = $(self.aTags[i]);
			
			if (
				self.isYoutubeLink(a.attr('href')) &&
				typeof(self.ytDurations[self.ytLinks[a.attr('href')]]) != 'undefined'
			) {
				a.attr('href', a.attr('href') + '&t=' + ( parseInt(self.ytDurations[self.ytLinks[a.attr('href')]] * (self.skipPercentage / 100 ) ) ) );
				a.addClass(self.appendedClass);
			} 
			
			a.addClass(self.processedClass);
		}
	
	}
	
	self.getYtData = function(ytIds)
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




