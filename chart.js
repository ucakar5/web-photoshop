let xValues = [];
let yValues = [[], [], []];
let config;
let chart = null;


function reloadChart() {
    xValues = [];
    yValues = [[], [], []];
	xValues = ["0-50", "51-100", "101-150", "151-200", "201-255"];
	yValues = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
	config = {
		type: "bar",
		data: {
			labels: xValues,
			datasets: [{
				label: 'Red',
				data: yValues[0],
				backgroundColor: '#f00',
			}, {
				label: 'Green',
				data: yValues[1],
				backgroundColor: '#0f0'
			}, {
				label: 'Blue',
				data: yValues[0],
				backgroundColor: '#00f'
			}]
		},
		options: {
			title: { display: false },
		}
	}
    if (chart !== null) chart.destroy();
    chart = new Chart("myChart", config);
}

function updateHistogram() {
	chart.data.datasets[0].data = yValues[0];
	chart.data.datasets[1].data = yValues[1];
	chart.data.datasets[2].data = yValues[2];
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < imageData.data.length; i += 4) {
		for (let j = 0; j < 3; j++)
			countColor(j, imageData.data[i + j]);
	}
    chart.update();
}

function countColor(col, val) {
	let n;
	if (val >= 0 && val <= 50) n = 0;
	else if (val >= 51 && val <= 100) n = 1;
	else if (val >= 101 && val <= 150) n = 2;
	else if (val >= 151 && val <= 200) n = 3;
	else n = 4;
	chart.data.datasets[col].data[n] += 1;
}

reloadChart();

let buttons = document.querySelectorAll("button");
buttons.forEach(function(button) {
	button.addEventListener("click", updateGraph);
});
  
function updateGraph(){
	reloadChart();
	updateHistogram();
}
