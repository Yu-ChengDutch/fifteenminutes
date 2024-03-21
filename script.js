var running = false;

var notes = {
    "C": 261.6,
    "C#": 277.2,
    "D": 293.7,
    "Eb": 311.1,
    "E": 329.6,
    "F": 349.2,
    "F#": 370.0,
    "G": 392.0,
    "G#": 415.3,
    "A": 440.0,
    "Bb": 466.2,
    "B": 493.9
};

var solfege_keys = ["C", "D", "E", "F", "G", "A", "B", "Bb"]
var solfege_names = ["do", "re", "mi", "fa", "sol", "la", "ti", "teu"]

var first_solfege = null;
var second_solfege = null;

var difficulty = null;

var rhythms = {
    "English Waltz": [85, 3],
    "Tango": [120, 4],
    "Viennese Waltz": [174, 3],
    "Foxtrot": [112, 4],
    "Quickstep": [200, 4],
    "Chacha": [120, 4],
    "Samba": [96, 2],
    "Rhumba": [100, 4],
    "Paso Doble": [120, 2],
    "Jive": [168,4]
}

var next_note = true;

var context = new AudioContext()
var o = null
var g = null

var y = null

function start_timer(category = null, on_duration = null, off_duration = null, nr_blocks = null, on_sound=null, off_sound=null) {

    var target = 900;
    var now = 0;

    if (running === false) {

        var x = setInterval(function() {

            running = true;

            now = now + 1;
            
            // Find the distance between now and the count down date
            var distance = target - now;
                
            // Time calculations for days, hours, minutes and seconds
            var minutes = Math.floor(distance / 60);
            var seconds = Math.floor(distance % 60);
                
            // Output the result in an element with id="demo"
            document.getElementById("clock-carrier").innerHTML = minutes + "m " + seconds + "s ";
                
            if (category == "Music" && next_note) {

                next_note = false;
                start_music();
        
            }

            // If the count down is over, write some text 
            if (distance < 0) {

                beep(notes["A"], 'sine'); 
                setTimeout(function() {beep(notes["C"], 'sine')}, 500); 
                setTimeout(function() {beep(notes["E"], 'sine')}, 1000);  

                clearInterval(x);
                document.getElementById("clock-carrier").innerHTML = "DONE! Click to stop";
                y = setInterval(function() {
                    
                    beep(notes["A"], 'sine'); 
                    setTimeout(function() {beep(notes["C"], 'sine')}, 500); 
                    setTimeout(function() {beep(notes["E"], 'sine')}, 1000);                      
            
            }, 1500)    
            };

        }, 1000);

    } else if (running === true) {

        clearInterval(y);
        window.location.href = '../../index.html';

    };

    if (category == "Flexibility" || category == "Meditation" || category == "Dance") {

        for (i = 1; i <= nr_blocks; i++) {

            box_breathing = [['C', 'C', 'E', 'G', 'B', 'B', 'B', 'B', 'G', 'E', 'C', 'C'], 'C#']
            belly_breathing = [['C', 'C', 'E', 'G', 'G', 'F', 'E', 'D'], 'C#']

            if (category === "Flexibility" || (category === "Meditation" && i === 2)) {

                set_timeouts(i, on_duration, off_duration, belly_breathing[0], belly_breathing[1]);

            } else if (category === "Meditation" && i === 1) {

                set_timeouts(i, on_duration, off_duration, box_breathing[0], box_breathing[1]);

            } else if (category === "Dance") {

                current_dance = document.getElementById("text-" + String(i)).innerText;

                current_bpm = rhythms[current_dance][0];
                current_rhythm = rhythms[current_dance][1];

                set_timeouts(i, on_duration, off_duration, box_breathing[0], box_breathing[1], current_bpm, current_rhythm, current_dance);

            } else {

                set_timeouts(i, on_duration, off_duration, "A", "B");

            };
            

        };

        setTimeout(function() {document.getElementById("block-" + String(nr_blocks)).classList.remove('active-block');}, (nr_blocks * on_duration_ms + nr_blocks * off_duration_ms))

    };

};

function set_timeouts(i, on_duration, off_duration, on_sound, off_sound, bpm=60, rhythm = 1, dance = null) {

    on_duration_ms = on_duration * 1000
    off_duration_ms = off_duration * 1000

    setTimeout(function() {               
    
        if (bpm === 60 && rhythm === 1 ) {

            console.log("Setting timer");
            set_timer("on-" + String(i), on_duration, on_sound, 0.5);

        } else {

            console.log("Setting rhythm");
            set_rhythm("on-" + String(i), on_duration, 0.5, (bpm * 0.8), rhythm, dance)
        }
        
        document.getElementById("block-" + String(i-1)).classList.remove('active-block');
        document.getElementById("block-" + String(i)).classList.add('active-block');        
    
    }, ((i - 1) * on_duration_ms + (i - 1) * off_duration_ms));

    setTimeout(function() {set_timer("off-" + String(i), off_duration, off_sound, 0.1)}, (i * on_duration_ms + (i-1) * off_duration_ms));

};

function set_timer(element, duration, sound, volume = 0.75) {

    var target = duration;
    var now = 0;

    var z = setInterval(function() {

        running = true;

        now = now + 1;
        
        // Find the distance between now and the count down date
        var distance = target - now;
            
        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor(distance / 60);
        var seconds = Math.floor(distance % 60);
            
        // Output the result in an element with id="demo"
        document.getElementById(element).innerHTML = "0" + minutes + ":" + seconds;

        if (!Array.isArray(sound)) {
            beep(notes[sound], 'sine', volume);
        } else {
            console.log(sound[now % sound.length])
            beep(notes[sound[now % sound.length]], 'sine', volume);
        }
                
            
        // If the count down is over, write some text 
        if (distance <= 0) {
            
            clearInterval(z);         

        };

    }, 1000);

};

function set_rhythm(element, duration, volume = 0.75, bpm, rhythm, dance) {

    var target = duration;
    var now = 0;
    var rhythm_counter = 0;
    var distance = 5;

    console.log(bpm)
    console.log(60 / (bpm / 1000))

    var z = setInterval(function() {

        running = true;

        now = now + 1;
        
        // Find the distance between now and the count down date
        distance = target - now;
            
        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor(distance / 60);
        var seconds = Math.floor(distance % 60);
            
        // Output the result in an element with id="demo"
        document.getElementById(element).innerHTML = "0" + minutes + ":" + seconds;                
            
        // If the count down is over, write some text 
        if (distance <= 0) {
            
            clearInterval(z);         

        };

    }, 1000);

    var r = setInterval(function() {

        rhythm_counter = rhythm_counter + 1

        console.log(rhythm_counter % rhythm);

        duration = ((60 / (bpm / 1000)) / 1000);

        if (rhythm_counter % rhythm === 1) {
            
            if (dance === "Jive" || dance === "Waltz"){
                beep(notes["G"], 'sine', volume * 2, duration);
            } else {
                beep(notes["A"], 'sine', volume * 2, duration);
            }
            

        } else if (dance == "Rhumba" && rhythm_counter % rhythm === 0) {

            beep(notes["A"], 'sine', volume * 1, duration * 2);

        } else if (dance == "Chacha" && rhythm_counter % rhythm === 0) {

            beep(notes["A"], 'sine', volume * 1, duration / 2);
            setTimeout(function() {beep(notes["A"], 'sine', volume * 1, duration / 2)}, (60 / (bpm / 1000)) / 2)

        } else {

            beep(notes["A"], 'sine', volume * 1, duration);

        }     

        if (distance <= 0) {
            
            clearInterval(r);         

        };

    }, 60 / (bpm / 1000));

}

function beep(frequency, type, volume = 0.25, duration = 0.3) {  
    
    frequency = frequency / 2;

    o = context.createOscillator()
    g = context.createGain()    
    c = context.createDynamicsCompressor();
    o.type = type
    o.connect(g)
    o.frequency.value = frequency
    g.gain.value = volume;

    ramp_down = duration;
    ramp_up = 0.03;

    o.connect(g).connect(c).connect(context.destination)
    
    g.gain.exponentialRampToValueAtTime(
        g.gain.value, context.currentTime + ramp_up
    );

    g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + ramp_down);

    o.start(0)
    o.stop(context.currentTime + ramp_up + ramp_down);
}; 

function start_music() {

    if (difficulty === 'easy') {

        first_note = 'C'
        first_solfege = 'do'

    } else {

        first_key = Math.floor(Math.random() * solfege_keys.length)
        first_note = solfege_keys[first_key]
        first_solfege = solfege_names[first_key]
        
    }    

    beep(notes[first_note], "sine", 0.75, 1.5);    
    document.getElementById(first_solfege).classList.add('active-button');

    second_key = Math.floor(Math.random() * solfege_keys.length);
    second_note = solfege_keys[second_key];
    second_solfege = solfege_names[second_key]

    setTimeout(function() { beep(notes[second_note], "sine", 0.75, 1.5) }, 2000);

    
    

};

function check_music(note) {

    if (note === second_solfege) {

        document.getElementById(first_solfege).classList.remove('active-button');
        document.getElementById(first_solfege).classList.add('right-button');
        document.getElementById(second_solfege).classList.add('right-button');

        console.log("Right!")

        setTimeout(function() {

            document.getElementById(first_solfege).classList.remove('right-button');
            document.getElementById(second_solfege).classList.remove('right-button');

        }, 1000)

        setTimeout(function() { next_note = true }, 1500);
    };

}

function activate_level(level, antagonist) {

    document.getElementById(level).classList.add("active-button");
    document.getElementById(antagonist).classList.remove("active-button");

    difficulty = level;

}