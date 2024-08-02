let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let original = null;
let fileName = "";

document.getElementById("uploadImage").addEventListener("change", uploadFile);
function uploadFile(e) {
    e.preventDefault();
    let file = new FileReader();
    file.onload = (event) => {
        let img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.width = "";
            ctx.drawImage(img, 0, 0);
			let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            original = [...imageData.data];
            updateHistogram();
        }
        img.src = event.target.result;
    }
    if (e.type == "change") fileData = e.target.files[0];
    else fileData = e.dataTransfer.files[0];
    try {
        file.readAsDataURL(fileData);
        fileName = fileData.name;
        deleteHistory();
    } catch (e) {
        console.log(e);
    }
}

let history = [];
let undoHistory = [];
function saveHistory() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(imageData.data);
    undoHistory = [];
}
document.getElementById("undo").addEventListener("click", () => {
    if (history.length != 0) {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoHistory.push(history.pop());
        imageData.data.set(history.length == 0 ? original : history[history.length - 1]);
        ctx.putImageData(imageData, 0, 0);
    }
});
document.getElementById("redo").addEventListener("click", () => {
    if (undoHistory.length != 0) {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData.data.set(undoHistory[undoHistory.length - 1]);
        history.push(undoHistory.pop());
        ctx.putImageData(imageData, 0, 0);
    }
});
function deleteHistory() {
    history = [];
    undoHistory = [];
}

document.getElementById("buttonThreshold").addEventListener("click", threshold);
document.getElementById("buttonLighting").addEventListener("click", lighting);

document.getElementById("removeRed").addEventListener("click", removeChannel.bind(null, 0));
document.getElementById("removeGreen").addEventListener("click", removeChannel.bind(null, 1));
document.getElementById("removeBlue").addEventListener("click", removeChannel.bind(null, 2));

document.getElementById("buttonRed").addEventListener("click", channelLighting.bind(null, 0));
document.getElementById("buttonGreen").addEventListener("click", channelLighting.bind(null, 1));
document.getElementById("buttonBlue").addEventListener("click", channelLighting.bind(null, 2));

