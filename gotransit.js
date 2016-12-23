/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("gotransit", {

	// Default module config.
	defaults: {
		transitTable: null,
		line: null, 
	},

	createTableCell: function (content) {
		var td = document.createElement('td');
		var txtNode = document.createTextNode(content);
		td.appendChild(txtNode);
		return td;
	},

	// Override dom generator.
	getDom: function () {
		let wrapper = document.createElement("div");
		let table = document.createElement("table");
		table.className = "small test";
		let tableData = this.config.transitTable;
		if (Array.isArray(tableData)) {
			for (var i = 0; i < tableData.length; i++) {
				var data = tableData[i];
				if(this.config.line != null && this.config.line.toUpperCase() === data.key)
				{
					break;
				}
				var tr = document.createElement('tr');
				var cell = this.createTableCell(data.transitLine);
				tr.appendChild(cell);
				cell = this.createTableCell(data.status);
				if (data.status === "Delayed") {
					cell.className = "delay";
				}
				else {
					cell.className = "ontime";
				}
				tr.appendChild(cell);
				table.appendChild(tr);
			}
			wrapper.appendChild(table);
		}
		else {
			wrapper.innerHTML = "No array found";
		}
		return wrapper;
	},

	// Define required scripts.
	getStyles: function() { return ["gotransit.css"]; },

	// Define start sequence.
	start: function () {
		Log.info(this.name + ' start!');
		this.scheduleUpdate(5000);
		console.log(this.name + ' send notification');
	},
	// on module load
	// start: function () {
	// 	this.mySpecialProperty = "So much wow!";
	// 	Log.log(this.name + ' is started!');
	// }
	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		Log.log(this.name + ' schedule update!');
		var self = this;
		setInterval(function () {
			self.updateTransitTimes();
		}, 4000);
	},

	updateTransitTimes: function () {
		Log.log(this.name + ' update transition times!');
		this.sendSocketNotification("REQUEST_TRANSIT_DATA", {
			line: this.config.line,
		});
	},
	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		console.log("gotransit.js " + "notification: " + notification + " payload: " + payload);
		if (notification === "PARSED_TABLE") {
			this.config.transitTable = payload;
			this.updateDom();
		}
		else if(notification === "ERROR_REACHING_SITE")	{

		}
	},
});
