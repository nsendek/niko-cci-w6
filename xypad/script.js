			
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

const synth = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
});

const sequence = new Tone.Sequence((time, note) => {
    synth.triggerAttackRelease(note, "2n", time);
}, ["C4", "E4", "G4", "A4", "G4"], "1n");
sequence.start(0);

const synthBass = new Tone.Synth().toDestination();

const loop = new Tone.Loop((time) => {
    synthBass.triggerAttackRelease("C0", "8n", time);
}, "4n").start(0);


const effect1 = new Tone.Chebyshev(50).toDestination();

// Add a gain node to control volume
const volumeGain = new Tone.Gain(1).toDestination();

// Create an LFO to control the volume
const volumeLFO = new Tone.LFO({
  type: "square",
  frequency: 1, // Slow oscillation
  min: 0,       // Fully silent
  max: 1,       // Full volume
  amplitude: 1, // Full-range modulation
}).start();

// Connect the LFO to the gain's volume
volumeLFO.connect(volumeGain.gain);

// Chain the effects
synth.chain(effect1, volumeGain);
synthBass.chain(volumeGain);

// Map values between a range
function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// HTML elements
const pad = document.getElementById('xy-pad');
const dot = document.getElementById('dot');

// Handle mouse events
pad.addEventListener('mousemove', (e) => {
    const rect = pad.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);

    // Update dot position
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;

    const rX = x - rect.width/2;
    const skewX = map(rX,-1*rect.width/2, rect.width/2, -1, 1);
    const rY = y - rect.height/2;
    const skewY = map(rY,-1*rect.height/2, rect.height/2, -1, 1);
    pad.style.transform = `rotateX(${Math.abs(10*skewY)}deg) rotateY(${10*skewX}deg)`

    const value = map(x, 0, rect.width, 0, 25);
    effect1.order = Math.round(value);

    console.log(effect1.order)

    
    // const vibratoFrequency = map(x, 0, rect.width, 0.1, 8);
    // vibrato.frequency.value = vibratoFrequency;

    // const lfoFrequency = map(y, 0, rect.height, 0.1, 15); // Slow to fast modulation
    // volumeLFO.frequency.value = lfoFrequency;

    // const lfoDepth = map(y, 0, rect.height, 0, 1); // None to full depth
    // volumeLFO.amplitude.value = lfoDepth; // Apply depth directly to amplitude
});

// Play sound on mouse click
pad.addEventListener('mousedown', () => {
    //synth.triggerAttack("C4");
    Tone.getTransport().start(); // restart sequence
    dot.classList.add("active");
});

// Stop sound on mouse release
pad.addEventListener('mouseup', () => {
    //synth.triggerRelease();
    Tone.getTransport().pause(); // end sequence
    dot.classList.remove("active");
});