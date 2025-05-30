let pc; // RTCPeerConnection
let ms; // MediaStream
let dc; // DataChannel
let act = false;
const btnTalk = document.getElementById('btn-conect');
const boxVoice = document.querySelector(".voicebox")
btnTalk.addEventListener("click",function(){
    if(act == false){
        this.textContent = "End";
        this.classList.remove('green')
        this.classList.add('red')
        act = true;
        boxVoice.classList.remove('scale-out')
        init();
    }else{
        this.textContent="Start";
        this.classList.remove('red')
        this.classList.add('green')
        boxVoice.classList.add("scale-out")
        act=false;
        endConnection();
    }
})


// عناصر الدوائر
const dots = document.querySelectorAll('.dot');

function startAnimation() {
    dots.forEach(dot => dot.style.animationPlayState = 'running');
}
function stopAnimation() {
    dots.forEach(dot => {
        dot.style.animationPlayState = 'paused';
        dot.style.transform = 'translateY(0px)';
    });
}

async function init() {
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    pc = new RTCPeerConnection();

    // الصوت القادم من AI
    audioEl = document.createElement("audio");
    audioEl.autoplay = true;

    pc.ontrack = e => {
        audioEl.srcObject = e.streams[0];
        analyzeRemoteAudio(e.streams[0]);
    };

    // صوت الميكروفون
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    pc.addTrack(localStream.getTracks()[0]);
    analyzeLocalAudio(localStream);

    dc = pc.createDataChannel("oai-events");
    dc.addEventListener("message", (e) => {
        console.log(e);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-mini-realtime-preview";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body:offer.sdp,
        headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp"
        },
    });

    const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);
}

function analyzeRemoteAudio(stream) {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    remoteAnalyser = audioCtx.createAnalyser();
    source.connect(remoteAnalyser);
    remoteAnalyser.fftSize = 256;
    const dataArray = new Uint8Array(remoteAnalyser.frequencyBinCount);

    function check() {
        remoteAnalyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (volume > 30) {
            startAnimation();
        } else {
            stopAnimation();
        }
        requestAnimationFrame(check);
    }

    check();
}

function analyzeLocalAudio(stream) {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    localAnalyser = audioCtx.createAnalyser();
    source.connect(localAnalyser);
    localAnalyser.fftSize = 256;
    const dataArray = new Uint8Array(localAnalyser.frequencyBinCount);

    function check() {
        localAnalyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (volume > 30) {
            // المستخدم يتكلم، أوقف أنيميشن AI
            stopAnimation();
        }
        requestAnimationFrame(check);
    }

    check();
}



function endConnection() {
    if (dc && dc.readyState === "open") {
        dc.close();
        console.log("Data channel closed.");
    }

    // إغلاق تدفق الميكروفون
    if (ms) {
        ms.getTracks().forEach(track => track.stop());
        console.log("Microphone stream stopped.");
    }

    // إغلاق اتصال WebRTC
    if (pc) {
        pc.close();
        console.log("Peer connection closed.");
    }

    // إعادة تعيين القيم
    pc = null;
    ms = null;
    dc = null;
}