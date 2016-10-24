window.onload = () => {
    var SOUND_URL = 'test3.mp3';

    // Web Audio APIが使えるか確認しつつ、contextをつくる
    var SupportedAudioContext;
    try {
        SupportedAudioContext = window.AudioContext || window.webkitAudioContext;
    } catch(e) {
        throw new Error('Web Audio API is not supported.');
    }
    var context = new SupportedAudioContext();
    



    // 音声ファイルのロード
    var buffer;
    (function  () {
        var request = new XMLHttpRequest();
        request.open('GET', SOUND_URL, true);
        request.responseType = 'arraybuffer'; // ArrayBufferとしてロード
        request.send();
        request.onload = function () {
            // contextにArrayBufferを渡し、decodeさせる
            context.decodeAudioData(request.response, function (buf) {
                buffer = buf;
            });
        };
    })();

    const createCanvas = () => {
        var canvas = document.getElementById('canvas'),
          ctx = canvas.getContext('2d')
        return ctx;
    }

    // click時に再生
    $('#button').on('click', function (e) {
        e.preventDefault();

        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);

        WIDTH = 800;
        HEIGHT = 300;
        analyser = context.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 128;

        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        canvasCtx = createCanvas();
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        


        let draw = () =>{
            drawVisual = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            var barWidth = (WIDTH / bufferLength) * 2.5;
            var barHeight;
            var x = 0;

            for(var i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i]/2;

                canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
                canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);

                x += barWidth + 1;
            }
        }
        draw();


    });
};