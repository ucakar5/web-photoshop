function channelChange(data, channel, value) {
    for (let i = channel; i < data.length; i += 4) {
        data[i] = Math.floor(data[i] * value);
        if (data[i] > 255) data[i] = 255;
    }
}

function removeChannel(channel = 0) {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = channelChange(imageData.data, channel, 0);
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function channelLighting(channel = "Red") {
    let val = document.getElementById("slider" + channel).value;
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    channelChange(imageData.data, channel, val)
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function threshold() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let thresh = document.getElementById("sliderThreshold").value;
	let d;
    for (let i = 0; i < imageData.data.length; i++) {
		if (imageData.data[i] > thresh) d = 255;
		else d = 0;
		imageData.data[i] = d;
        if (i % 4 == 2)
            i++;
    }
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function lighting() {
    let val = document.getElementById("sliderLighting").value;
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = Math.floor(Math.pow(imageData.data[i], val));
        if (imageData.data[i] > 255) imageData.data[i] = 255;
        if (i % 4 == 2) i++;
    }
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function grayscale() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 0.299 * imageData.data[i] + 0.587 * imageData.data[i] + 0.114 * imageData.data[i];
        imageData.data[i + 1] = imageData.data[i];
        imageData.data[i + 2] = imageData.data[i];
    }
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function box(radius = 1) {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    boxFilter(imageData.data, imageData.width, imageData.height, radius);
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function gaussian() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixelMatrix(imageData.data, imageData.width, imageData.height, [[0.0947416, 0.118318, 0.0947416], [0.118318, 0.147761, 0.118318], [0.0947416, 0.118318, 0.0947416]]);
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function median() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    medianFilter(imageData.data, imageData.width, imageData.height);
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function sobel() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	pixelMatrix(imageData.data, imageData.width, imageData.height, [[1, 0, -1], [2, 0, -2], [1, 0, -1]]);
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function laplace() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixelMatrix(imageData.data, imageData.width, imageData.height, [[1, 1, 1], [1, -8, 1], [1, 1, 1]]);
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function sharpening() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let copy = [...imageData.data];
    pixelMatrix(copy, imageData.width, imageData.height, [[1, 1, 1], [1, -8, 1], [1, 1, 1]]);
    for (i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] -= copy[i];
        imageData.data[i + 1] -= copy[i + 1];
        imageData.data[i + 2] -= copy[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function unsharpening() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let copy = [...imageData.data];
    pixelMatrix(copy, imageData.width, imageData.height, [[0.0947416, 0.118318, 0.0947416], [0.118318, 0.147761, 0.118318], [0.0947416, 0.118318, 0.0947416]]);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] += imageData.data[i] - copy[i];
        imageData.data[i + 1] += imageData.data[i + 1] - copy[i + 1];
        imageData.data[i + 2] += imageData.data[i + 2] - copy[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

function pixelMatrix(data, width, height, matrix, alpha = false) {
    let radius = (matrix.length - 1) / 2;
    let dataCopy = [...data];
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixel = [0, 0, 0, 0];
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    let weight = matrix[dy + radius][dx + radius];
                    let currentPixel = getPixel(dataCopy, width, x + dx, y + dy);
                    if (currentPixel) {
                        pixel[0] += currentPixel[0] * weight;
                        pixel[1] += currentPixel[1] * weight;
                        pixel[2] += currentPixel[2] * weight;
                        if (alpha) pixel[3] += currentPixel[3] * weight;
                    }
                }
            }
            for (let i = 0; i < 4; i++) {
                if (pixel[i] < 0) pixel[i] = 0;
                else if (pixel[i] > 255) pixel[i] = 255;
            }
            let pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = Math.round(pixel[0]);
            data[pixelIndex + 1] = Math.round(pixel[1]);
            data[pixelIndex + 2] = Math.round(pixel[2]);
            if (alpha) data[pixelIndex + 3] = Math.round(pixel[3]);
        }
    }
}


function getPixel(data, width, x, y) {
    let pixelIndex = (y * width + x) * 4;
    let pixel = [
        data[pixelIndex],
        data[pixelIndex + 1],
        data[pixelIndex + 2],
        data[pixelIndex + 3]
    ];
    if (pixel[0] === undefined) return null;
    else return pixel;
}

function boxFilter(data, width, height, radius) {
    let copy = [...data];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let totalR = 0, totalG = 0, totalB = 0, count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    let pixel = getPixel(copy, width, x + dx, y + dy);
                    if (pixel) {
                        totalR += pixel[0];
                        totalG += pixel[1];
                        totalB += pixel[2];
                        count++;
                    }
                }
            }
            let pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = Math.round(totalR / count);
            data[pixelIndex + 1] = Math.round(totalG / count);
            data[pixelIndex + 2] = Math.round(totalB / count);
            data[pixelIndex + 3] = 255;
        }
    }
}

function medianFilter(data, width, height) {
    let copy = [...data];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let tempArray = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    let pixel = getPixel(copy, width, x + dx, y + dy);
                    if (pixel) tempArray.push(pixel);
                }
            }
            let offset = (y * width + x) * 4;
            for (let channel = 0; channel < 4; channel++) {
                let channelValues = tempArray.map(pixel => pixel[channel]);
                data[offset + channel] = calculateMedian(channelValues);
            }
        }
    }
}

function calculateMedian(arr) {
	let sorted = arr.slice().sort((a, b) => a - b);
	let mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 !== 0) return sorted[mid];
	else return (sorted[mid - 1] + sorted[mid]) / 2;
}

