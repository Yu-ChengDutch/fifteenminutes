// Generate random sequence between 1 and 9, of in total 100 numbers long

let max = 9;
let min = 1;
let number = 0;

let n = 4;

let correct = 0;
let wrong = 0;
let missed = 0;
let counter = 0; 

let current_number = 0;
let current_trigger = 0
let pressed_button = false;

let random_numbers = [];
let n_backs = new Array(n + 1).fill(0);

document.getElementById("n_intro").innerHTML = `Currently doing: ${n}\-back task`;

for (let i = 0; i < 100; i++) {

    number = Math.floor(Math.random() * (max - min + 1)) + min;
    random_numbers.push(number);

    if (i > n && random_numbers[i-n] == number ) {
        n_backs.push(1)
    } else if (i > n) {
        n_backs.push(0)
    };

};

console.log(n_backs)
console.log(random_numbers)

// Add event listeners

let button = document.getElementById("check_button");

button.addEventListener("click", function() {

    pressed_button = true;
    
    if (current_trigger == 0) {

        console.log("Wrong!");
        wrong += 1;
        document.getElementById("wrong_block").innerHTML = "Wrong: " + wrong.toString();

    } else {

        console.log("correct!");
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
        current_trigger = n_backs[i]
    
        document.getElementById("counter_block").innerHTML = "Counter: " + (i + 1).toString()
    
        console.log(current_number)
        console.log(current_trigger)
    
        document.getElementById(current_number.toString()).style.backgroundColor = "aquamarine";
        await sleep(1500);
        document.getElementById(current_number.toString()).style.backgroundColor = "lightgrey";
        await sleep(500);

        if (pressed_button == false && current_trigger == 1) {

            console.log("Found missing!")
            missed += 1
            document.getElementById("missed_block").innerHTML = "Missed: " + missed.toString();

        };

    };
    
};

iterate()

// Make sure ending is smooth