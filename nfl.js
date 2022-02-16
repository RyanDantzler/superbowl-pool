var weekGameStats,
	stats,
	superBowl,
	quarterStats,
	openCount = 0;

$(document).ready(function() {
	function getData() {
		$.ajax({
			url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				console.log(data);
				stats = data;
				updateView();

				// get new data every 15 seconds
				setTimeout(getData, 15000);
			},
			error: function (res) {
				console.log(res.status);
			}
		});
	};

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

	var updateView = function() {
		superBowl = stats.events[0].competitions[0];

		var timeRemaning = superBowl.status.displayClock == undefined ? "0:00" : superBowl.status.displayClock,
			homeTeam = superBowl.competitors[0],
			awayTeam = superBowl.competitors[1],
			lastNumHome = parseInt(homeTeam.score % 10),
			lastNumAway = parseInt(awayTeam.score % 10),
			quarter = superBowl.status.period > 4 || superBowl.status.type.state == "post" ? superBowl.status.type.description.toUpperCase() : "Q" + superBowl.status.period;

			$('.play_nums div:not(.col_0)').each(function() {
				if (!isNaN($(this).text())) {
					$(this).css({'color':'green', 'font-weight':'bold', 'background':'lightgreen'});
					openCount++;
				}
			});

		$('#home-score').text(homeTeam.score);
		$('#away-score').text(awayTeam.score);

		if (openCount > 0)
			$('#info').text(openCount + " SQUARES LEFT").css('color', 'green');
		else
			$('#info').text("#SHOWMETHEMONEY").css({'color':'', 'font-style':'italic'});

		if (quarter.indexOf("P") > -1)
			$('#game-clock').text("Q1 15:00");
		else {

			if (quarter[0] == "F")
				$('#game-clock').text("FINAL");
			else if (quarter[0] == "H")
				$('#game-clock').text("HALFTIME");
			else
				$('#game-clock').text(quarter + " " + timeRemaning);

			switch (quarter) {
				case "Q2":
					getWinners(parseInt(homeTeam.linescores[0].value), parseInt(awayTeam.linescores[0].value));
					break;
				case "H":
				case "HALFTIME":
				case "Q3":
					getWinners(parseInt(homeTeam.linescores[0].value), parseInt(awayTeam.linescores[0].value));
					getWinners(parseInt(homeTeam.linescores[0].value) + parseInt(homeTeam.linescores[1].value), parseInt(awayTeam.linescores[0].value) + parseInt(awayTeam.linescores[1].value));
					break;
				case "Q4":
				case "OT":
					getWinners(parseInt(homeTeam.linescores[0].value), parseInt(awayTeam.linescores[0].value));
					getWinners(parseInt(homeTeam.linescores[0].value) + parseInt(homeTeam.linescores[1].value), parseInt(awayTeam.linescores[0].value) + parseInt(awayTeam.linescores[1].value));
					getWinners(parseInt(homeTeam.linescores[0].value) + parseInt(homeTeam.linescores[1].value) + parseInt(homeTeam.linescores[2].value), parseInt(awayTeam.linescores[0].value) + parseInt(awayTeam.linescores[1].value) + parseInt(awayTeam.linescores[2].value));
					break;
				case "F":
				case "FINAL":
				case "FINAL/OT":
				case "FO":
					getWinners(parseInt(homeTeam.linescores[0].value), parseInt(awayTeam.linescores[0].value));
					getWinners(parseInt(homeTeam.linescores[0].value) + parseInt(homeTeam.linescores[1].value), parseInt(awayTeam.linescores[0].value) + parseInt(awayTeam.linescores[1].value));
					getWinners(parseInt(homeTeam.linescores[0].value) + parseInt(homeTeam.linescores[1].value) + parseInt(homeTeam.linescores[2].value), parseInt(awayTeam.linescores[0].value) + parseInt(awayTeam.linescores[1].value) + parseInt(awayTeam.linescores[2].value));
					getWinners(parseInt(homeTeam.score), parseInt(awayTeam.score));
					break;
				default:
					break;
			}

			$('.active-row').removeClass('active-row');

			$('.play_nums .col_0').each(function() {
				if (parseInt($(this).text()) == lastNumAway)
					$(this).parent().addClass('active-row');
			});

			$('.active-col').removeClass('active-col');

			$('#row_0 div').each(function() {
				var winningCol;

				if (parseInt($(this).text()) == lastNumHome) {
					winningCol = $(this).attr('class');
					$('.' + winningCol).addClass('active-col');
				}
			});
		}
	};

	getData();
});