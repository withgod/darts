
var video = document.querySelector("#video_player");
var video_player_box = document.querySelector("#video_player_box");


var btn_mute = document.getElementById("btn_mute"),
    btn_play = document.getElementById("btn_play"),
    btn_back = document.getElementById("btn_back"),
    btn_loop = document.getElementById('btn_loop'),
    btn_copy = document.getElementById('btn_copy'),
    btn_paste = document.getElementById('btn_paste'),
    btn_undo = document.getElementById('btn_undo'),
    btn_redo = document.getElementById('btn_redo'),
    btn_download = document.getElementById('btn_download');

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
    // console.log('add vline');
    const videoHeight = video.clientHeight, videoWidth = video.clientWidth;
    const vlineLength = parseInt(videoHeight * 0.85, 10);
    const vlinex = parseInt(videoWidth * 0.1, 10), vliney = parseInt(videoHeight * 0.1, 10);
    // console.dir([videoHeight, videoWidth, vlineLength, vlinex, vliney]);

    canvas.add(new fabric.Line(
        [vlinex, vliney, vlinex, vliney + vlineLength], {
        fill: drawingColorEl.value,
        stroke: drawingColorEl.value,
        strokeWidth: parseInt(drawingLineWidthEl.value, 10),
        angle: 0
    }));

}
addHLine.onclick = function () {
    // console.log('add hline');
    const videoHeight = video.clientHeight, videoWidth = video.clientWidth;
    const vlineLength = parseInt(videoWidth * 0.85, 10);
    const vlinex = parseInt(videoWidth * 0.1, 10), vliney = parseInt(videoHeight * 0.1, 10);
    // console.dir([videoHeight, videoWidth, vlineLength, vlinex, vliney]);

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

// http://fabricjs.com/copypaste

//console.dir(btn_copy);
var _clipboard;
function fn_draw_copy() {
    canvas.getActiveObject().clone(function (cloned) {
        _clipboard = cloned;
    });
}
function fn_draw_paste() {
    // clone again, so you can do multiple copies.
    _clipboard.clone(function (clonedObj) {
        canvas.discardActiveObject();
        clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
        });
        if (clonedObj.type === 'activeSelection') {
            // active selection needs a reference to the canvas.
            clonedObj.canvas = canvas;
            clonedObj.forEachObject(function (obj) {
                canvas.add(obj);
            });
            // this should solve the unselectability
            clonedObj.setCoords();
        } else {
            canvas.add(clonedObj);
        }
        _clipboard.top += 10;
        _clipboard.left += 10;
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
    });
}

btn_copy.addEventListener(`click`, fn_draw_copy);
btn_paste.addEventListener(`click`, fn_draw_paste);

// https://codepen.io/Jadev/pen/mLNzmB
var isRedoing = false;
var _history = [];

canvas.on('object:added', function () {
    if (!isRedoing) {
        _history = [];
    }
    isRedoing = false;
});

function fn_draw_undo() {
    if (canvas._objects.length > 0) {
        _history.push(canvas._objects.pop());
        canvas.renderAll();
    }
}
function fn_draw_redo() {
    if (_history.length > 0) {
        isRedoing = true;
        canvas.add(_history.pop());
    }
}
btn_undo.addEventListener(`click`, fn_draw_undo);
btn_redo.addEventListener(`click`, fn_draw_redo);

// https://jsfiddle.net/tg_alfa/1nyuzkhy/
function onKeyDownHandler(event) {
    //event.preventDefault();
    var key;
    if (window.event) {
        key = window.event.keyCode;
    }
    else {
        key = event.keyCode;
    }

    switch (key) {
        // Shortcuts
        case 67: // Ctrl+C
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                fn_draw_copy();
            }
            break;
        // Paste (Ctrl+V)
        case 86: // Ctrl+V
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                fn_draw_paste();
            }
            break;
        case 90: // Ctrl+Z
            if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
                event.preventDefault();
                fn_draw_redo();
            } else if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                fn_draw_undo();
            }
            break;
        // case 32: // Space 何故かDL始まる…
        //     btn_play.click();
        //     break;

        default:
            // TODO
            break;
    }
}

document.onkeydown = onKeyDownHandler;

btn_loop.addEventListener(`click`, function () {
    if (!video.loop) {
        video.loop = true;
        btn_loop.classList.remove('btn-outline-primary');
        btn_loop.classList.add('btn-primary');
    } else {
        video.loop = false;
        btn_loop.classList.remove('btn-primary');
        btn_loop.classList.add('btn-outline-primary');
    }
});
btn_mute.addEventListener(`click`, function () {
    if (!video.muted) {
        video.muted = true;
        btn_mute.classList.remove('btn-outline-primary');
        btn_mute.classList.add('btn-primary');
    } else {
        video.muted = false;
        btn_mute.classList.remove('btn-primary');
        btn_mute.classList.add('btn-outline-primary');
    }
});

// btn_download.addEventListener(`click`, function () {
//     fn_btn_download();
// });

let playrateRadios = document.querySelectorAll(`input[type='radio'][name='btnPlayRate']`);
for (let target of playrateRadios) {
    target.addEventListener(`change`, function () {
        let rate = target.value / 10;
        video.playbackRate = rate;
    });
}

video.addEventListener("ended", (event) => {
    btn_play.classList.remove('btn-outline-primary');
    btn_play.classList.add('btn-primary');
});

btn_play.addEventListener(`click`, function () {
    if (video.paused) {
        video.play();
        btn_play.classList.remove('btn-outline-primary');
        btn_play.classList.add('btn-primary');

    } else {
        video.pause();
        btn_play.classList.remove('btn-primary');
        btn_play.classList.add('btn-outline-primary');
    }
});
btn_back.addEventListener(`click`, function () {
    video.currentTime = 0;
});

// resize handling
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

// https://qiita.com/jerrywdlee/items/60934ca7b89cfe7baf13
// https://www.crunchtimer.jp/blog/18169
// 未実装 video+canvs 録画出来るかも謎
/*
function fn_btn_download() {
    video.currentTime = 0;
    video.loop = false;
    const recordedBlobs = [];
    stream = document.querySelector('canvas').captureStream();
    const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") ? "video/webm; codecs=vp9" : "video/webm";
    const options = { mimeType: mime };
    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    };
    mediaRecorder.start();
    mediaRecorder.onstop = () => {
        //video.srcObject.getTracks().forEach(track => track.stop());
        //const blob = new Blob(recordedBlobs, { type: recordedBlobs[0].type });
    };
    video.play();
    function move_end_fn(event) {
        video.removeEventListener("ended", move_end_fn);
        mediaRecorder.stop();
        const blob = new Blob(recordedBlobs, { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = '録画ファイル.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        console.log(
            "1）動画が終了した、または 2）それ以上データがない" +
            "ため、動画が停止しました。",
        );

    }
    video.addEventListener("ended", move_end_fn);

} */
