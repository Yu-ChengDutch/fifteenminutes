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
}

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

        document.getElementById("clock-carrier").innerHTML = "Click to start!";
        clearInterval(y);
    };

    if (category == "Flexibility" || category == "Meditation") {

        for (i = 1; i <= nr_blocks; i++) {

            box_breathing = [['C', 'C', 'E', 'G', 'B', 'B', 'B', 'B', 'G', 'E', 'C', 'C'], 'C#']
            belly_breathing = [['C', 'C', 'E', 'G', 'G', 'F', 'E', 'D'], 'C#']

            if (category == "Flexibility" || (category == "Meditation" && i == 2)) {

                set_timeouts(i, on_duration, off_duration, belly_breathing[0], belly_breathing[1]);

            } else if (category == "Meditation" && i == 1) {

                set_timeouts(i, on_duration, off_duration, box_breathing[0], box_breathing[1]);

            } else {

                set_timeouts(i, on_duration, off_duration, "A", "B");

            };
            

        };

        setTimeout(function() {document.getElementById("block-" + String(nr_blocks)).classList.remove('active-block');}, (nr_blocks * on_duration_ms + nr_blocks * off_duration_ms))

    };

};

function set_timeouts(i, on_duration, off_duration, on_sound, off_sound) {

    on_duration_ms = on_duration * 1000
    off_duration_ms = off_duration * 1000

    setTimeout(function() {               
    
        set_timer("on-" + String(i), on_duration, on_sound, 0.1);
        document.getElementById("block-" + String(i-1)).classList.remove('active-block');
        document.getElementById("block-" + String(i)).classList.add('active-block');        
    
    }, ((i - 1) * on_duration_ms + (i - 1) * off_duration_ms));

    setTimeout(function() {set_timer("off-" + String(i), off_duration, off_sound, 0.01)}, (i * on_duration_ms + (i-1) * off_duration_ms));

};

function set_timer(element, duration, sound, volume = 0.1) {

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

function beep(frequency, type, volume = 0.1) {  
    
    frequency = frequency / 2;

    o = context.createOscillator()
    g = context.createGain()    
    c = context.createDynamicsCompressor();
    o.type = type
    o.connect(g)
    o.frequency.value = frequency
    g.gain.value = volume;

    ramp_down = 0.97;
    ramp_up = 0.03;

    o.connect(g).connect(c).connect(context.destination)
    
    g.gain.exponentialRampToValueAtTime(
        g.gain.value, context.currentTime + ramp_up
    );

    g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + ramp_down);

    o.start(0)
    o.stop(context.currentTime + ramp_up + ramp_down);
}; 