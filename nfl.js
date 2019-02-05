var weekGameStats,
	stats,
	superBowl,
	quarterStats,
	openCount = 0;

$(document).ready(function() {

// Changes XML to JSON
function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};


	$.ajax({
		url: 'http://www.nfl.com/liveupdate/scorestrip/postseason/ss.xml',
		method: 'GET',
		dataType: 'xml',
		success: function(data) {
			console.log(data);
			stats = xmlToJson(data);
			//weekGameStats = WeekGameStats(data);//getWeekGameStats(data);
			updateData();
		},
		error: function(res) {
			console.log(res.status);
		}
	});

	var getWinners = function(home, away) {
		var col;

		home = home.toString();
		away = away.toString();

		$('#row_0 div').each(function() {
			if (parseInt($(this).text()) == home[home.length - 1])
				col = $(this).attr('class');
		});

		$('.play_nums .col_0').each(function() {
			if (parseInt($(this).text()) == away[away.length - 1])
				$(this).parent().find('.' + col).addClass('winner');
		});
	};

	var updateData = function() {
		superBowl = stats.ss.gms.g[11]["@attributes"];
		if (stats.ss.gds.gd.length > 11)
			quarterStats = stats.ss.gds.gd[11]["@attributes"];
		var timeRemaning = superBowl.k == undefined ? "0:00" : superBowl.k,
			homeScore = superBowl.hs,
			visitingScore = superBowl.vs,
			lastNumHome = parseInt(homeScore[homeScore.length - 1]),
			lastNumVisiting = parseInt(visitingScore[visitingScore.length - 1]),
			quarter = isNaN(superBowl.q) ? superBowl.q : "Q" + superBowl.q;

			$('.play_nums div:not(.col_0)').each(function() {
				if (!isNaN($(this).text())) {
					$(this).css({'color':'green', 'font-weight':'bold', 'background':'lightgreen'});
					openCount++;
				}
			});

		// $('.visiting-team').text(superBowl.vtn);
		// $('.home-team').text(superBowl.htn);
		// $('#game-score').text(superBowl.vs + '-' + superBowl.hs);
		$('#home-score').text(superBowl.hs);
		$('#away-score').text(superBowl.vs);

		if (openCount > 0)
			$('#info').text(openCount + " SQUARES LEFT").css('color', 'green');
		else
			$('#info').text("#SHOWMETHEMONEY").css({'color':'', 'font-style':'italic'});

		if (quarter.indexOf("P") > -1)
			$('#game-clock').text("Q1 15:00");
		else {

			if (quarter.indexOf("F") > -1)
				$('#game-clock').text("FINAL");
			else if (quarter.indexOf("H") > -1)
				$('#game-clock').text("HALFTIME");
			else
				$('#game-clock').text(quarter + " " + timeRemaning);

			switch (quarter) {
				case "Q2":
					getWinners(parseInt(quarterStats.h1q), parseInt(quarterStats.v1q));
					break;
				case "H":
				case "Q3":
					getWinners(parseInt(quarterStats.h1q), parseInt(quarterStats.v1q));
					getWinners(parseInt(quarterStats.h1q) + parseInt(quarterStats.h2q), parseInt(quarterStats.v1q) + parseInt(quarterStats.v2q));
					break;
				case "Q4":
				case "OT":
					getWinners(parseInt(quarterStats.h1q), parseInt(quarterStats.v1q));
					getWinners(parseInt(quarterStats.h1q) + parseInt(quarterStats.h2q), parseInt(quarterStats.v1q) + parseInt(quarterStats.v2q));
					getWinners(parseInt(quarterStats.h1q) + parseInt(quarterStats.h2q) + parseInt(quarterStats.h3q), parseInt(quarterStats.v1q) + parseInt(quarterStats.v2q) + parseInt(quarterStats.v3q));
					break;
				case "F":
				case "FO":
					getWinners(parseInt(quarterStats.h1q), parseInt(quarterStats.v1q));
					getWinners(parseInt(quarterStats.h1q) + parseInt(quarterStats.h2q), parseInt(quarterStats.v1q) + parseInt(quarterStats.v2q));
					getWinners(parseInt(quarterStats.h1q) + parseInt(quarterStats.h2q) + parseInt(quarterStats.h3q), parseInt(quarterStats.v1q) + parseInt(quarterStats.v2q) + parseInt(quarterStats.v3q));
					getWinners(parseInt(quarterStats.h1q) + parseInt(quarterStats.h2q) + parseInt(quarterStats.h3q) + parseInt(quarterStats.h4q), parseInt(quarterStats.v1q) + parseInt(quarterStats.v2q) + parseInt(quarterStats.v3q) + parseInt(quarterStats.v4q));
					break;
				default:
					break;
			}

			$('.active-row').removeClass('active-row');

			$('.play_nums .col_0').each(function() {
				var winningNumVisitor;

				if (parseInt($(this).text()) == lastNumVisiting)
					$(this).parent().addClass('active-row');
			});


			$('.active-col').removeClass('active-col');

			$('#row_0 div').each(function() {
				var winningNumHome,
					winningCol;

				if (parseInt($(this).text()) == lastNumHome) {
					winningCol = $(this).attr('class');
					$('.' + winningCol).addClass('active-col');
				}
			});
		}
	};
    //console.log(stats);
});