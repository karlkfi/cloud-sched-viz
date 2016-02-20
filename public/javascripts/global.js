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

// line chart
var chart;
var chartPrime;

// DOM Ready =============================================================
$(document).ready(function() {

	Chart.defaults.global.animationSteps = 24

	chart = initChart()
	$('#chartLegend').html(chart.generateLegend())

	chartPrime = initChartPrime()
	$('#chartPrimeLegend').html(chartPrime.generateLegend())

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

	var elapsedSeconds = '?'
	if (testStartTime) {
		var now = new Date().getTime()
		var elapsedTime = now - testStartTime
		elapsedSeconds = Math.round(elapsedTime / 1000)
	}

	var rowContent = ''

	rowContent += '<tr>'
	rowContent += '<td>' + appData.name + '</td>'
	rowContent += '<td>' + appData.instances.requested + '</td>'
	rowContent += '<td>' + appData.instances.running + '</td>'
	rowContent += '<td>' + appData.instances.healthy + '</td>'
	rowContent += '<td>' + elapsedSeconds + 's</td>'
	rowContent += '</tr>'

	// update table
	$(rowContent).prependTo('#spreadsheet tbody')

	// chart shows the actual counts
	chart.addData(
		[
			appData.instances.requested,
			appData.instances.running,
			appData.instances.healthy
		],
		elapsedSeconds +  's'
	)

	// chartPrime shows the rate of change

	var prevRunning = 0
	var prevHealthy = 0
	if (appListData.length > 1) {
		var prevAppData = appListData[appListData.length - 2]
		prevRunning = prevAppData.instances.running
		prevHealthy = prevAppData.instances.healthy
	}

	chartPrime.addData(
		[
			appData.instances.running - prevRunning,
			appData.instances.healthy - prevHealthy
		],
		elapsedSeconds +  's'
	)
}

function getInstances() {
	var instances = $('#controls input[name="instances"]').val()
	return instances.length > 0 ? parseInt(instances, 10) : testAppInstances
}

function startTest() {
	stopTest()
	$('#controls h3').text('Status: Creating')
	testStartTime = new Date().getTime()
	var appName = testAppName
	createApp(appName, getInstances()).then(function(appData) {
		console.log('app created (' + appName + ')')
		$('#controls h3').text('Status: Deploying')
	}, function(err) {
		console.error('app create failed (' + appName + '): ' + JSON.stringify(err))
		clearInterval(testInterval)
		testStartTime = null
		$('#controls h3').text('Status: Failed')
	})

	testInterval = setInterval(function() {
		var appName = testAppName
		getAppData(appName).then(function(appData) {
			addTableRow(appData)
			if (appData.instances.requested == appData.instances.running &&
				appData.instances.requested == appData.instances.healthy) {
				stopTest()
			}
		}, function(err) {
			console.error('app get failed (' + appName + '): ' + JSON.stringify(err))
		})
	}, testIntervalPeriod)
}

function stopTest() {
	clearInterval(testInterval)
	if (testStartTime) {
		testStartTime = null
		$('#controls h3').text('Status: Complete')
		var appName = testAppName
		deleteApp(appName).then(function(appData) {
			console.log('app deleted (' + appName + ')')
		}, function(err) {
			console.error('app delete failed (' + appName + '): ' + JSON.stringify(err))
		})
	} else {
		$('#controls h3').text('Status: Not Running')
	}
}

// Charts =============================================================

function initChart() {
	var chartData = {
		labels: ["0s"],
		datasets: [
			{
				label: "Requested",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: [0],
				bezierCurve: false
			},
			{
				label: "Running",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: [0]
			},
			{
				label: "Ready",
				fillColor: "rgba(99,153,180,0.2)",
				strokeColor: "rgba(99,153,180,1)",
				pointColor: "rgba(99,153,180,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(99,153,180,1)",
				data: [0]
			}
		]
	}
	var chartOptions = {
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	}
	var chartCtx = $("#chart").get(0).getContext("2d")
	return new Chart(chartCtx).Line(chartData, chartOptions)
}

function initChartPrime() {
	var chartData = {
		labels: ["0s"],
		datasets: [
			{
				label: "Newly Running",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: [0]
			},
			{
				label: "Newly Ready",
				fillColor: "rgba(99,153,180,0.2)",
				strokeColor: "rgba(99,153,180,1)",
				pointColor: "rgba(99,153,180,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(99,153,180,1)",
				data: [0]
			}
		]
	}
	var chartOptions = {
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	}
	var chartCtx = $("#chart-prime").get(0).getContext("2d")
	return new Chart(chartCtx).Line(chartData, chartOptions)
}
