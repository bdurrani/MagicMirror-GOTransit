/* Magic Mirror
 * Node Helper: MMM-gotransit
 *
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require("request");
let cheerio = require('cheerio')
// var validUrl = require("valid-url");
// var Fetcher = require("./fetcher.js");

module.exports = NodeHelper.create({
	// Subclass start method.
	start: function () {
		console.log("Starting module: " + this.name);
	},

	// Subclass socketNotificationReceived received.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "REQUEST_TRANSIT_DATA") {
			this.createFetcher(payload);
		}
	},

	processTransitData: function (body) {
		let c$ = cheerio.load(body);
		let table = c$(" #rtab1 table.gridStatusTrain tbody");
		let transitcollection = [];

		table.find('tr').each(function (i, elem) {
			var tds = elem.children,
				transitLine = tds[0].textContent;
			let transitData = {};
			// console.log("data:  " + tds[0].children[0].data);
			// console.log("elem: " + Object.keys(elem));
			// console.log("name: " + Object.keys(elem.attribs));
			// console.log("name: " + elem.attribs['data-symbol']);
			// let linekey = elem.getAttribute('data-symbol');
			let linekey = elem.attribs['data-symbol'];
			transitData.key = linekey;
			transitData.transitLine = tds[0].children[0].data;

			let lineResult = tds[1];
			let containsAtag = [].filter.call(lineResult.children, function (elem, i) {
				// console.log("line: " + transitData.transitLine + " elem tag name: " + elem.tagName);
				let tagname = elem.tagName;
				return tagname != null && tagname.toUpperCase() === 'A';
			});
			if (containsAtag.length == 0) {
				transitData.status = 'On Time';
			} else {
				transitData.status = 'Delayed';
				// this.parseDelay(lineResult, transitData);
			}
			console.log("Key: " + transitData.key + " Line: " + transitData.transitLine + " :: " + transitData.status);
			transitcollection.push(transitData);
		});
		return transitcollection;
	},

	parseDelay: function (element, transitData) {
		transitData.status = "Delayed";
		let details = {};
		var currentSubtitle = "";
		element.find("ul.listTrainD li").each(function (i, listElement) {
			var listTxt = listElement.textContent.trim();
			if (listElement.classList.contains("subtitle")) {
				currentSubtitle = listTxt;
				details[listTxt] = "";
			} else {
				var input = listElement.innerHTML.replace(/<br\s*>/gi, "\n");
				details[currentSubtitle] += input + "\n";
				debugger;
			}
		});
		transitData.details = details;
	},

	/* createFetcher(url, reloadInterval)
	 * Creates a fetcher for a new url if it doesn't exist yet.
	 * Otherwise it reuses the existing one.
	 *
	 * attribute url string - URL of the news feed.
	 * attribute reloadInterval number - Reload interval in milliseconds.
	 */

	createFetcher: function (config) {
		var self = this;
		var url1 = "http://www.gotransit.com/publicroot/en/default.aspx";
		var headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A' };
		// request({ uri: url1, encoding: null, headers: headers }).pipe(iconv.decodeStream(encoding)).pipe(parser);
		request(url1, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// console.log(body); // Show the HTML for the Modulus homepage.
				var res = self.processTransitData(body)
				self.sendSocketNotification("PARSED_TABLE", res);
			}
			else {
				self.sendSocketNotification("ERROR_REACHING_SITE", null);
			}
		});
	},
	/* broadcastFeeds()
	 * Creates an object with all feed items of the different registered feeds, 
	 * and broadcasts these using sendSocketNotification.
	 */
	// broadcastFeeds: function() {
	// 	var feeds = {};
	// 	for (var f in this.fetchers) {
	// 		feeds[f] = this.fetchers[f].items();
	// 	}
	// 	this.sendSocketNotification("NEWS_ITEMS", feeds);
	// }
});
