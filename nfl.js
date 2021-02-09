var weekGameStats,
	stats,
	superBowl,
	quarterStats,
	openCount = 0;

$(document).ready(function() {
	$.ajax({
		url: 'http://static.nfl.com/liveupdate/scores/scores.json',
		method: 'GET',
		dataType: 'json',
		success: function(data) {
			stats = data;
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
		superBowl = stats["2021020700"];
		var timeRemaning = superBowl.clock == undefined ? "0:00" : superBowl.clock,
			homeScore = superBowl.home.score['T'],
			visitingScore = superBowl.away.score['T'],
			lastNumHome = parseInt(superBowl.home.score['T'] % 10),
			lastNumVisiting = parseInt(superBowl.away.score['T'] % 10),
			quarter = isNaN(superBowl.qtr) ? superBowl.qtr.toUpperCase() : "Q" + superBowl.qtr;

			$('.play_nums div:not(.col_0)').each(function() {
				if (!isNaN($(this).text())) {
					$(this).css({'color':'green', 'font-weight':'bold', 'background':'lightgreen'});
					openCount++;
				}
			});

		$('#home-score').text(superBowl.home.score['T']);
		$('#away-score').text(superBowl.away.score['T']);

		if (openCount > 0)
			$('#info').text(openCount + " SQUARES LEFT").css('color', 'green');
		else
			$('#info').text("#SHOWMETHEMONEY").css({'color':'', 'font-style':'italic'});

		if (quarter[0] == "P")
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
					getWinners(parseInt(superBowl.home.score['1']), parseInt(superBowl.away.score['1']));
					break;
				case "H":
				case "HALFTIME":
				case "Q3":
					getWinners(parseInt(superBowl.home.score['1']), parseInt(superBowl.away.score['1']));
					getWinners(parseInt(superBowl.home.score['1']) + parseInt(superBowl.home.score['2']), parseInt(superBowl.away.score['1']) + parseInt(superBowl.away.score['2']));
					break;
				case "Q4":
				case "OT":
					getWinners(parseInt(superBowl.home.score['1']), parseInt(superBowl.away.score['1']));
					getWinners(parseInt(superBowl.home.score['1']) + parseInt(superBowl.home.score['2']), parseInt(superBowl.away.score['1']) + parseInt(superBowl.away.score['2']));
					getWinners(parseInt(superBowl.home.score['1']) + parseInt(superBowl.home.score['2']) + parseInt(superBowl.home.score['3']), parseInt(superBowl.away.score['1']) + parseInt(superBowl.away.score['2']) + parseInt(superBowl.away.score['3']));
					break;
				case "F":
				case "FINAL":
				case "FO":
					getWinners(parseInt(superBowl.home.score['1']), parseInt(superBowl.away.score['1']));
					getWinners(parseInt(superBowl.home.score['1']) + parseInt(superBowl.home.score['2']), parseInt(superBowl.away.score['1']) + parseInt(superBowl.away.score['2']));
					getWinners(parseInt(superBowl.home.score['1']) + parseInt(superBowl.home.score['2']) + parseInt(superBowl.home.score['3']), parseInt(superBowl.away.score['1']) + parseInt(superBowl.away.score['2']) + parseInt(superBowl.away.score['3']));
					getWinners(parseInt(superBowl.home.score['T']), parseInt(superBowl.away.score['T']));
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
});