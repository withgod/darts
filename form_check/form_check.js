
var video = document.querySelector("#video_player");
var video_player_box = document.querySelector("#video_player_box");


var btn_mute = document.getElementById("btn_mute"),
    btn_play = document.getElementById("btn_play");

// http://fabricjs.com/freedrawing
var canvas = new fabric.Canvas('canvas_player', { isDrawingMode: true }),
    drawingModeEl = document.getElementById('drawing-mode'),
    clearEl = document.getElementById('clear-canvas'),
    drawingColorEl = document.getElementById('drawing-color'),
    drawingLineWidthEl = document.getElementById('drawing-line-width'),
    drawingOptionsEl = document.getElementById('drawing-mode-options'),
    addHLine = document.getElementById('add-hline'),
    addVLine = document.getElementById('add-vline');


clearEl.onclick = function () { canvas.clear() };


addVLine.onclick = function () {
    console.log('add vline');
    const videoHeight = video.clientHeight, videoWidth = video.clientWidth;
    const vlineLength = parseInt(videoHeight * 0.85, 10);
    const vlinex = parseInt(videoWidth * 0.1, 10), vliney = parseInt(videoHeight * 0.1, 10);
    console.dir([videoHeight, videoWidth, vlineLength, vlinex, vliney]);

    canvas.add(new fabric.Line(
        [vlinex, vliney, vlinex, vliney + vlineLength], {
        fill: drawingColorEl.value,
        stroke: drawingColorEl.value,
        strokeWidth: parseInt(drawingLineWidthEl.value, 10),
        angle: 0
    }));

}
addHLine.onclick = function () {
    console.log('add hline');
    const videoHeight = video.clientHeight, videoWidth = video.clientWidth;
    const vlineLength = parseInt(videoWidth * 0.85, 10);
    const vlinex = parseInt(videoWidth * 0.1, 10), vliney = parseInt(videoHeight * 0.1, 10);
    console.dir([videoHeight, videoWidth, vlineLength, vlinex, vliney]);

    let hline = new fabric.Line(
        [vlinex, vliney, vlinex, vliney + vlineLength], {
        fill: drawingColorEl.value,
        stroke: drawingColorEl.value,
        strokeWidth: parseInt(drawingLineWidthEl.value, 10),
        angle: 0
    })
    canvas.add(hline);
    hline.rotate(90);
    hline.set({
        left: vliney + vlineLength,
        top: vlinex,
    }).setCoords();
    canvas.renderAll();
}

drawingModeEl.onclick = function () {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    if (canvas.isDrawingMode) {
        drawingModeEl.innerHTML = 'Cancel drawing mode';
        drawingModeEl.classList.remove('btn-info');
        drawingModeEl.classList.add('btn-danger');
        // drawingOptionsEl.style.display = '';
    }
    else {
        drawingModeEl.innerHTML = 'Enter drawing mode';
        drawingModeEl.classList.remove('btn-danger');
        drawingModeEl.classList.add('btn-info');
        // drawingOptionsEl.style.display = 'none';
    }
};
drawingColorEl.onchange = function () {
    var brush = canvas.freeDrawingBrush;
    brush.color = this.value;
    if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
    }
    canvas.freeDrawingBrush = brush;
};
drawingLineWidthEl.onchange = function () {
    canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
    this.previousSibling.innerHTML = this.value;
};

var brush = canvas.freeDrawingBrush;
brush.color = drawingColorEl.value;
if (brush.getPatternSrc) {
    brush.source = brush.getPatternSrc.call(brush);
}
brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;

window.addEventListener('load', () => {
    const f = document.getElementById('file1');
    f.addEventListener('change', evt => {
        let input = evt.target;
        if (input.files.length == 0) {
            return;
        }
        const file = input.files[0];
        if (!file.type.match('video.*')) {
            alert("動画ファイルを選択してください。");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            video.pause();
            video.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
});

function btn_loop() {
    var btn_loop = document.querySelector('#loop_check');
    // console.dir([btn_loop, btn_loop.checked]);
    if (btn_loop.checked) {
        video.loop = true;
    } else {
        video.loop = false;
    }
}

function fn_btn_mute() {
    if (video.muted) {
        video.muted = false;
        btn_mute.innerHTML = '<i class="bi bi-volume-up"></i>'
    } else {
        video.muted = true;
        btn_mute.innerHTML = '<i class="bi bi-volume-mute"></i>'
    }
}

let playrateRadios = document.querySelectorAll(`input[type='radio'][name='btnPlayRate']`);
for (let target of playrateRadios) {
	target.addEventListener(`change`, function () {
        let rate = target.value / 10;
        video.playbackRate = rate;
	});
}

video.addEventListener("ended", (event) => {
    btn_play.innerHTML = '<i class="bi bi-play"></i>'
});

var play_state = 0;
function fn_btn_play() {
    // console.log("btn.play");
    if (play_state == 0) {
        play_state = 1;
        video.play();
        btn_play.innerHTML = '<i class="bi bi-stop"></i>'
    } else {
        play_state = 0;
        video.pause();
        btn_play.innerHTML = '<i class="bi bi-play"></i>'
    }
}

function fn_btn_speed(speed) {
    video.playbackRate = speed;
}

document.addEventListener('DOMContentLoaded', function () {
    //console.dir([video.clientHeight, video.clientWidth]);
    canvas.setHeight(video.clientHeight);
    canvas.setWidth(video.clientWidth);
    canvas.renderAll();
    canvas.isDrawingMode = false;
});

video.addEventListener(
    "resize",
    (ev) => {
        canvas.setHeight(video.clientHeight);
        canvas.setWidth(video.clientWidth);
        canvas.renderAll();
    },
    false,
);

const observer = new ResizeObserver((entries) => {
    // entries.forEach((el) => {
    // });
    canvas.setHeight(video.clientHeight);
    canvas.setWidth(video.clientWidth);
    canvas.renderAll();
});
