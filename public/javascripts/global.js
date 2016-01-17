// AppList data array for filling in info box
var appListData = []

// background execution agent while test is running
var testInterval = null
// period between table updates while test is running (in milliseconds)
var testIntervalPeriod = 1000
// name of test application
var testAppName = 'fake-app-1'

// DOM Ready =============================================================
$(document).ready(function() {

	// Populate the app table on initial page load
	// populateTable()

	// Start Test button click
	$('#btnStartTest').on('click', startTest)

	// Stop Test button click
	$('#btnStopTest').on('click', stopTest)

})

// Functions =============================================================

// Fill table with data
function populateTable() {
	$.getJSON( '/apps', function( data ) {
		// store app list in memory
		appListData = data

		var tableContent = ''

		// add a row per app
		$.each(data, function() {
			tableContent += '<tr>'
			tableContent += '<td>' + this.name + '</td>'
			tableContent += '<td>' + this.instances.requested + '</td>'
			tableContent += '<td>' + this.instances.running + '</td>'
			tableContent += '<td>' + this.instances.healthy + '</td>'
			tableContent += '</tr>'
		})

		// update table
		$('#appList table tbody').html(tableContent)
	})
}

// Append a row to the app table
function addTableRow(appName) {
	$.getJSON( '/apps/' + appName, function( data ) {
		// store app in memory
		appListData.push(data)

		var rowContent = ''

		rowContent += '<tr>'
		rowContent += '<td>' + data.name + '</td>'
		rowContent += '<td>' + data.instances.requested + '</td>'
		rowContent += '<td>' + data.instances.running + '</td>'
		rowContent += '<td>' + data.instances.healthy + '</td>'
		rowContent += '</tr>'

		// update table
		$('#appList table tbody:last-child').append(rowContent);
	})
}

function startTest() {
	stopTest()
	testInterval = setInterval(function() {
		addTableRow(testAppName)
	}, testIntervalPeriod)
}

function stopTest() {
	clearInterval(testInterval)
}
