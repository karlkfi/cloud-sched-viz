// AppList data array for filling in info box
var appListData = []

// background execution agent while test is running
var testInterval = null
// period between table updates while test is running (in milliseconds)
var testIntervalPeriod = 1000
// name of test application
var testAppName = 'nginx'
// number of test application instance (default)
var testAppInstances = 10
// start time of test
var testStartTime = null

// DOM Ready =============================================================
$(document).ready(function() {

	// Start Test button click
	$('#btnStartTest').on('click', startTest)

	// Stop Test button click
	$('#btnStopTest').on('click', stopTest)

})

// Functions =============================================================

// create new app
// returns a promise
function createApp(appName, instances) {
	return Promise.resolve($.ajax('/apps/' + appName, {
		method: 'PUT',
		contentType: 'application/json',
		data: JSON.stringify({ instances: instances })
	}))
}

// delete new app
// returns a promise
function deleteApp(appName) {
	return Promise.resolve($.ajax('/apps/' + appName, {
		method: 'DELETE'
	}))
}

// get existing app data
// returns a promise
function getAppData(appName) {
	return Promise.resolve($.ajax('/apps/' + appName))
}

// prepend a row to the app table
function addTableRow(appData) {
	// store app in memory
	appListData.push(appData)

	var rowContent = ''

	rowContent += '<tr>'
	rowContent += '<td>' + appData.name + '</td>'
	rowContent += '<td>' + appData.instances.requested + '</td>'
	rowContent += '<td>' + appData.instances.running + '</td>'
	rowContent += '<td>' + appData.instances.healthy + '</td>'
	rowContent += '</tr>'

	// update table
	$(rowContent).prependTo('#appList table tbody')
}

function getInstances() {
	var instances = $('#test input[name="instances"]').val()
	return instances.length > 0 ? parseInt(instances, 10) : testAppInstances
}

function startTest() {
	stopTest()
	$('#test h3').text('Status: Creating')
	testStartTime = new Date().getTime()
	var appName = testAppName
	createApp(appName, getInstances()).then(function(appData) {
		console.log('app created (' + appName + ')')
		$('#test h3').text('Status: Deploying')
	}, function(err) {
		console.error('app create failed (' + appName + '): ' + JSON.stringify(err))
		clearInterval(testInterval)
		testStartTime = null
		$('#test h3').text('Status: Failed')
	})

	testInterval = setInterval(function() {
		var appName = testAppName
		getAppData(appName).then(function(appData) {
			if (appData.instances.requested == appData.instances.running &&
				appData.instances.requested == appData.instances.healthy) {
				stopTest()
			}
			addTableRow(appData)
		}, function(err) {
			console.error('app get failed (' + appName + '): ' + JSON.stringify(err))
		})
	}, testIntervalPeriod)
}

function stopTest() {
	clearInterval(testInterval)
	if (testStartTime) {
		var testStopTime = new Date().getTime()
		var testElapsedTime = testStopTime - testStartTime
		var testElapsedSeconds = Math.round(testElapsedTime / 1000)
		$('#test h3').text('Status: Complete (' + testElapsedSeconds + 's)')
		testStartTime = null
		var appName = testAppName
		deleteApp(appName).then(function(appData) {
			console.log('app deleted (' + appName + ')')
		}, function(err) {
			console.error('app delete failed (' + appName + '): ' + JSON.stringify(err))
		})
	} else {
		$('#test h3').text('Status: Not Running')
	}
}
