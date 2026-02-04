// Generate random sequence between 1 and 9, of in total 100 numbers long

let max = 9;
let min = 1;
let number = 0;

let n = 1;

let correct = 0;
let wrong = 0;
let missed = 0;
let counter = 0; 

let current_number = 0;

let current_position_trigger = 0
let current_colour_trigger = 0

let pressed_button = false;

let possible_colours = ["Blue", "Red", "Orange", "Green", "Black"]

let random_numbers = [];
let random_colours = [];

let position_n_backs = new Array(n + 1).fill(0);
let colour_n_backs = new Array(n + 1).fill(0);

document.getElementById("n_intro").innerHTML = `Currently doing: ${n}\-back task`;

let info_block = document.getElementById("information");

if (n == 1) {
    info_block.innerHTML = "That means twice the same!";
} else if (n == 2) {
    info_block.innerHTML = "That means that the one block BEFORE the previous one is the same as the CURRENT one!";
} else {
    info_block.innerHTML = `That means that the ${n-1} blocks BEFORE the previous one is the same as the CURRENT one!`;
}

for (let i = 0; i < 100; i++) {

    number = Math.floor(Math.random() * (max - min + 1)) + min;
    colour = possible_colours[Math.floor(Math.random() * 5)]

    random_numbers.push(number);
    random_colours.push(colour)

    if (i > n && random_numbers[i-n] == number ) {
        position_n_backs.push(1)
    } else if (i > n) {
        position_n_backs.push(0)
    };

    if (i > n && random_colours[i-n] == colour ) {
        colour_n_backs.push(1)
    } else if (i > n) {
        colour_n_backs.push(0)
    };



};

console.log(position_n_backs)
console.log(random_numbers)
console.log(random_colours)

// Add event listeners

let position_button = document.getElementById("position_button");
let colour_button = document.getElementById("colour_button");

position_button.addEventListener("click", function() {

    pressed_button = true;
    
    if (current_position_trigger == 0) {

        console.log("Wrong position!");
        wrong += 1;
        document.getElementById("wrong_block").innerHTML = "Wrong: " + wrong.toString();

    } else {

        console.log("Correct position!");
        correct += 1;
        document.getElementById("correct_block").innerHTML = "Correct: " + correct.toString();

    };

 });

colour_button.addEventListener("click", function() {

    pressed_button = true;

    if (current_colour_trigger == 0) {

        console.log("Wrong colour!");
        wrong += 1;
        document.getElementById("wrong_block").innerHTML = "Wrong: " + wrong.toString();

    } else {

        console.log("Correct colour!");
        correct += 1;
        document.getElementById("correct_block").innerHTML = "Correct: " + correct.toString();

    };

});

// Iterate over sequence, colouring tiles

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let tiles = document.getElementsByClassName("tiles")

async function iterate() {

    console.log("Start iteration")

    for (let i = 0; i < 100; i++) {

        current_number = random_numbers[i]
        current_colour = random_colours[i]

        current_position_trigger = position_n_backs[i]
        current_colour_trigger = colour_n_backs[i]
    
        document.getElementById("counter_block").innerHTML = "Counter: " + (i + 1).toString()
    
        console.log(current_number)
        console.log(current_colour)
    
        document.getElementById(current_number.toString()).style.backgroundColor = current_colour;
        await sleep(1500);
        document.getElementById(current_number.toString()).style.backgroundColor = "lightgrey";
        await sleep(500);

        if (pressed_button == false) {

            if (current_position_trigger == 1) {

                console.log("Found missing position!")
                missed += 1
                document.getElementById("missed_block").innerHTML = "Missed: " + missed.toString();

            } else if (current_colour_trigger == 1) {

                console.log("Found missing colour!")
                missed += 1
                document.getElementById("missed_block").innerHTML = "Missed: " + missed.toString();

            };           

        };

        pressed_button = false;

    };
    
};

iterate()

// Make sure ending is smooth