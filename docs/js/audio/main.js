window.onload = () => {
    let SOUND_URL = 'test3.mp3';


    let SupportedAudioContext;
    try {
        SupportedAudioContext = window.AudioContext || window.webkitAudioContext;
    } catch(e) {
        throw new Error('Web Audio API is not supported.');
    }
    let context = new SupportedAudioContext();
    let buffer;

    {
        let request = new XMLHttpRequest();
        request.open('GET', SOUND_URL, true);
        request.responseType = 'arraybuffer'; 
        request.send();
        request.onload = () => {
            context.decodeAudioData(request.response, (buf) => {
                buffer = buf;
            });
        };
    }

    const createCanvas = () => {
        let canvas = document.getElementById('canvas'),
          ctx = canvas.getContext('2d')
        return ctx;
    }
    const changeVolume = (e) => {

    }
    const createVolume = () => {
        let body = document.querySelector('body');
        let volume = document.createElement("input");
        body.appendChild(volume);
        volume.id = "volumebar";
        volume.type = "range";
        return volume;
    }

    // click時に再生
    $('#button').on('click', (e) => {
        e.preventDefault();

        let source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);

        volume = createVolume();

        WIDTH = 800;
        HEIGHT = 300;
        analyser = context.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 128;

        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        canvasCtx = createCanvas();
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        let draw = () =>{
            drawVisual = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            let barWidth = (WIDTH / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i]/2;

                canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
                canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);

                x += barWidth + 1;
            }
        }
        draw();

    });
};