			


const buttonStart = document.getElementById("start-button");

function startTone() {
    buttonStart.disabled = "true";
	Tone.start().then(() => { 
        console.log("audio is ready"); 
        buttonStart.style.display = "none";
    }).catch((error) => { 
        console.log("audio not ready"); 
        buttonStart.disabled = "false"; 
    });
}



// MIC //
// PLAYER //
let player, mic, recorder;
let initialized = false;
const buttonRecord = document.getElementById("record-button");
const buttonPlay = document.getElementById("play-button");
// Disable the rec button if UserMedia is not supported
buttonRecord.disabled = !Tone.UserMedia.supported;

// Rec / Stop
buttonRecord.addEventListener("click", async () => {
  Tone.context.resume(); // Why? Because.. https://github.com/Tonejs/Tone.js/issues/341

  //  Initialization
  if (!initialized) {
    mic = new Tone.UserMedia();
    recorder = new Tone.Recorder();
    mic.connect(recorder);
    mic.open();
    initialized = true;
  }

  if (buttonRecord.innerHTML == "Stop") {
    var data = await recorder.stop();
    var blobUrl = URL.createObjectURL(data);
    console.log(blobUrl);
    player = new Tone.Player(blobUrl, () => {
      buttonPlay.disabled = false;
    }).toDestination();
    player.loop = true;
    buttonRecord.innerHTML = "Record";
  } else {
    recorder.start();
    buttonRecord.innerHTML = "Stop";
  }
});

// Play / Stop
buttonPlay.addEventListener("click", () => {
  if (buttonPlay.innerHTML == "Stop") {
    player.stop();
    buttonPlay.innerHTML = "Play";
  } else {
    player.start();
    buttonPlay.innerHTML = "Stop";
    let div = document.getElementById("clip-duration");
    div.innerHTML = "Recorded " + player.buffer.duration + "s Loop";
    loopEndControl.value = player.buffer.duration; // update UI so loopend shows the total time
  }
});


// Volume Control
const volumeControl = document.getElementById("volume");
volumeControl.addEventListener("input", () => {
    player.volume.value = parseFloat(volumeControl.value); // Volume in dB
});

// Loop Start Control
const loopStartControl = document.getElementById("loopStart");
loopStartControl.addEventListener("input", () => {
    if (loopStartControl.value > 0)
        player.loopStart = parseFloat(loopStartControl.value); // Loop start in seconds
});

// Loop End Control
const loopEndControl = document.getElementById("loopEnd");
loopEndControl.addEventListener("input", () => {
    if (loopEndControl.value < player.buffer.duration)
        player.loopEnd = parseFloat(loopEndControl.value); // Loop end in seconds
});

// Reverse Playback
const reverseControl = document.getElementById("reverse");
reverseControl.addEventListener("change", () => {
    player.reverse = reverseControl.checked;
});

// Playback Rate Control
const playbackRateControl = document.getElementById("playbackRate");
playbackRateControl.addEventListener("input", () => {
    player.playbackRate = parseFloat(playbackRateControl.value); // Playback rate multiplier
});