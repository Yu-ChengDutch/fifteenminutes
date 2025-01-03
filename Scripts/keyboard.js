var notes = {
    "F3": 174.6,
    "F#3": 184.9,
    "G3": 195.9,
    "G#3": 207.6,
    "A3": 220.0,
    "A#3": 233.0,
    "B3": 246.9,
    "C4": 261.6,
    "C#4": 277.2,
    "D4": 293.7,
    "D#4": 311.1,
    "E4": 329.6,
    "F4": 349.2,
    "F#4": 370.0,
    "G4": 392.0,
    "G#4": 415.3,
    "A4": 440.0,
    "A#4": 466.2,
    "B4": 493.9,
    "C5": 523.2,
    "C#5": 554.3,
    "D5": 587.3,
    "D#5": 622.2,
    "E5": 659.2
};

major_scales = {

    "C": ["C4", "D4", "E4", "F4", "G4", "A4", 'B4', "C5"],
    "C#": ["C#4", "D#4", "F4", "F#4", "G#4", "A#4", "C4", "C#4"],
    "D": ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"],
    "D#": ["D#4", "F4", "G4", "G#4", "A#4", "C5", "D5", "D#5"],
    "E": ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"],
    "F": ["F3", 'G3', "A3", "A#3", "C4", "D4", "E4", "F4"],
    "F#": ["F#3", "G#3", "A#3", "B3", "C#4", "D#4", "F4", "F#4"],
    "G": ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", 'G4'],
    "G#": ["G#3", "A#3", "C4", "C#4", "D#4", "F4", "G4", "G#4"],
    "A": ["A3", "B3", "C#4", "D4", "E4", "F#4", "G#4", "A4"],
    "A#": ["A#3", "C4", "D4", "D#4", "F4", "G4", "A4", "A#4"],
    "B": ["B3", "C#4", "D#4", "E4", "F#4", "G#4", "A#4", "B4"],

}

natural_minor_scales = {

    "A": ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
    "A#": ["A#3", "B#3", "C#4", "D#4", "F", "F#4", "G#4", "A#4"],
    "B": ["B3", "C#4", "D4", "E4", "F#4", "G4", "A4", "B4"],
    "C": ["C4", "D4", "D#4", "F#", "G4", "G#4", "A#4", "C5"],
    "C#": ["C#4", "D#4", "E4", "F#4", "G#4", "A4", "B4", "C#5"],
    "D": ["D4", "E4", 'F4', "G4", "A4", "A#4", "C5", "D5"],
    "D#": ["D#4", "F4", "F#4", "G#4", "A#4", "B4", "C#5", "D#5"],
    "E": ["E4", "F#4", "G4", "A4", "B4", 'C4', "D5", "E5"],
    "F": ["F3", "G3", "Ab3", "Bb3", "C4", "C#4", "D#4", "F4"],
    "F#": ["F#3", "G#3", "A3", "B3", "C#4", "D4", "E4", "F#4"],
    "G": ["G3", "A3", "A#3", "C4", "D4", "D#4", "F4", "G4"],
    "G#": ["G#3", "A#3", "B3", "C#4", "D#4", "E4", "F#4", "G#4"]

}

// Initialisation

var context = new AudioContext()
var o = null
var g = null

var y = null

var correct_notes = []
var pass = false
var current_note = ""
var target_note = ""
var target_scale = []
var fail_counter = 0
var scale_name = ""

var message = document.getElementById("message")

// Functions

const keys = document.querySelectorAll('.piano-keys');

for (let i = 0; i < keys.length; i++) {

    keys[i].addEventListener('click', registerButton)

};

function registerButton(event) {

    current_note = event.target.dataset.key
    target_note = target_scale[0]

    console.log(current_note)
    beep(notes[current_note], 'sine')

    if (target_scale.length >= 1) {

        if (current_note == target_note) {

            console.log("Correct!");
            target_scale.shift();
            update_score(current_note);
            fail_counter = 0;
            message.innerHTML = "Yeey!"

            if (target_scale.length == 0) {

                message.innerHTML = "Correctly played " + scale_name + " major"
                next_target_scale();

            }
    
        } else {
    
            console.log("False")
            console.log(target_note)
            
            if (fail_counter > 1) { 

                message.innerHTML = "Oops! The " + scale_name + " major scale is: " + major_scales[scale_name] 
                next_target_scale();
                fail_counter = 0
        
            } else {
                
                fail_counter += 1
                message.innerHTML = "Oops!"
            
            }    
        }

    } 

}

function beep(frequency, type, volume = 0.25, duration = 1) {  
    
    frequency = frequency / 2;

    o = context.createOscillator()
    g = context.createGain()    
    c = context.createDynamicsCompressor();
    o.type = type
    o.connect(g)
    o.frequency.value = frequency
    g.gain.value = volume;

    ramp_down = duration;
    ramp_up = 0.1;

    o.connect(g).connect(c).connect(context.destination)
    
    g.gain.exponentialRampToValueAtTime(
        g.gain.value, context.currentTime + ramp_up
    );

    g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + ramp_down);

    o.start(0)
    o.stop(context.currentTime + ramp_up + ramp_down);
}; 

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array
  }

// Generate 12 major scales at random

let random_scales = shuffle(Object.keys(major_scales));

console.log(random_scales)

// Set instructions and counter 

function next_target_scale() {

    scale_name = random_scales.shift()

    target_scale = major_scales[scale_name];
    console.log(target_scale)

    document.getElementById("instructions").innerHTML = "Please play " + scale_name + " major"
    document.getElementById("results").innerHTML = " - ".repeat(target_scale.length)

}

function update_score(note_name) {

    current_score = document.getElementById("results").innerHTML
    current_score = current_score.replace(" - ", note_name + " | ")

    document.getElementById("results").innerHTML = current_score
    console.log(current_score)

}

next_target_scale();
