function startTone() {
	Tone.start().then(() => { 
        PlayRiff();
    });
}

const player = new Tone.Player({
    url: "RomeroShort.mp3",
    loop: true,
    loopStart: 0,
    loopEnd: 5,
}).toDestination();

function PlayRiff() {
    // monophonic
    const synthBass = new Tone.Synth().toDestination();
    // sample accurate time
    const loopA = new Tone.Loop((time) => {
	    synthBass.triggerAttackRelease("C2", "8n", time);
    }, "4n").start(0);

    Tone.getTransport().start();
}

// Play/Pause Button
const playButton = document.getElementById("playButton");
playButton.addEventListener("click", () => {
    if (player.state === "started") {
        player.stop();
        playButton.textContent = "Play";
    } else {
        player.start();
        playButton.textContent = "Pause";
    }
});