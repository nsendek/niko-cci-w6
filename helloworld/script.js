function startTone() {
	Tone.start().then(() => { 
        PlayRiff();
    });
}

function PlayRiff() {
    // monophonic
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();

    // exact time of press
    synth.triggerAttackRelease("C4", "8n", now);
    synth.triggerAttackRelease("E4", "8n", now + 0.5);
    synth.triggerAttackRelease("G4", "8n", now + 1);

    // monophonic
    const synthBass = new Tone.Synth().toDestination();
    // sample accurate time
    const loopA = new Tone.Loop((time) => {
	    synthBass.triggerAttackRelease("C2", "8n", time);
    }, "4n").start(0);

    Tone.getTransport().start();
}