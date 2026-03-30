// Constants

TOTAL_TARGETS = []
EXCLUSIONS = []

const rand_array = new Uint8Array(50);
self.crypto.getRandomValues(rand_array);

// Function library

function toggle_song(section) {

  const spotifyURI = "spotify:playlist:" + section; // replace with your track URI
  const webURL = "https://open.spotify.com/playlist/" + section; // replace with your track URL

  // Clear any existing iframes
  const existingIframes = document.querySelectorAll("iframe");
  existingIframes.forEach(iframe => iframe.remove());

  // Try opening in Spotify app
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = spotifyURI;
  document.body.appendChild(iframe);

};

function up_counter(el) {

  // First, trigger the timer
  run_timer(el);

  // 1. Find parent element
  const parent = el.parentElement;
  if (!parent) return;

  // 2. Find .exercise-counter within parent
  const counterDiv = parent.querySelector(".exercise-counter");
  if (!counterDiv) return;

  // 3. Parse text, increment, set back
  let count = parseInt(counterDiv.textContent, 10);
  if (isNaN(count)) count = 0;
  counterDiv.textContent = count + 1;
};

function weightedShuffleArray(array) {

  // First weight

  array_length = array.length;
  duplicate = array.slice();

  for (let i = 0; i < array_length; i++) {


    if (!TOTAL_TARGETS.includes(array[i][1])) { duplicate.push(array[i]) };

    if (array[i].length == 3) {

      for (let j = 0; j < array[i][2]; j++) {

        console.log(array[i][2])
        duplicate.push(array[i])

      };

    };

  };

  // Then shuffle

  for (let i = duplicate.length - 1; i > 0; i--) {
    const j = Math.floor((rand_array[i] / 255) * (i + 1));
    [duplicate[i], duplicate[j]] = [duplicate[j], duplicate[i]];
  }

  console.log(duplicate);

  return duplicate;
};

function add_exercise(exercise_var, song_var, container_id) {

  let new_block = document.createElement("div");
  new_block.className = "exercise-block";
  new_block.innerHTML = `<div class="exercise-proper" onclick="toggle_song('${song_var}')">${exercise_var}</div>
                         <div class="exercise-rest" onclick="up_counter(this);">Rest: 2m00s</div>
                         <div class="exercise-counter">0</div>`;

  document.getElementById(container_id).appendChild(new_block);
};

function run_timer(element) {

  // Ask for permission
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Start 2-minute timer
  let timeLeft = 120; // seconds (2 minutes)

  const interval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    element.innerHTML = `Rest: ${minutes}m${seconds.toString().padStart(2, '0')}s`;

    // Do something every second here
    // e.g., update DOM, play a tick sound, etc.

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval); // stop the interval

      // Or show notification
      if (Notification.permission === "granted") {
        new Notification("Timer Finished", {
          body: "2 minutes have passed!",
        });
      } else {
        // Show alert
        alert("Time's up!");
      }
    }
  }, 1000);

};

function moveToLast(arr, item) {
  arr.push(arr.splice(arr.indexOf(item), 1)[0]);
  return arr;
};

function select_exercises(exercise_list, number) {

  // Avoid selecting more than one exercise where the final word overlaps

  let selected_exercises = [exercise_list[0][0]];
  let selected_targets = [exercise_list[0][1]];

  TOTAL_TARGETS.push(exercise_list[0][1])

  for (let i = 1; selected_exercises.length < number + 1; i++) {

    let candidate = exercise_list[i][0];
    let candidate_target = exercise_list[i][1];
    let overlap = false;

    for (let j = 0; j < selected_exercises.length; j++) {

      if (selected_targets.includes(candidate_target)) {
        overlap = true;
        break;
      }
    }

    if (!overlap && !EXCLUSIONS.includes(candidate_target)) {
      selected_exercises.push(candidate);
      selected_targets.push(candidate_target);
    }

  }

  selected_targets.shift();
  selected_exercises.shift();

  for (x of selected_targets) { TOTAL_TARGETS.push(x) };

  return selected_exercises;

};


function generate_exercises() {

  // Get exclusions

  if (document.getElementById("chest").checked) { EXCLUSIONS.push("mid_chest", "upper_chest", "lower_chest") };
  if (document.getElementById("back").checked) { EXCLUSIONS.push("mid_back", "lower_back", "upper_back") };
  if (document.getElementById("biceps").checked) { EXCLUSIONS.push("biceps") };
  if (document.getElementById("triceps").checked) { EXCLUSIONS.push("triceps") }

  // Clear previous exercises

  const containers = ["training", "transport", "walls", "combat", "recovery"];
  for (x of containers) { document.getElementById(x).innerHTML = ""; }

  // Set up the random exercises  

  fetch('../Data/exercises.json')
    .then((response) => response.json())
    .then(data => {

      // Parse the JSON and randomise

      let training = weightedShuffleArray(data.training.exercises);
      let transport = weightedShuffleArray(data.transport.exercises);
      let walls = weightedShuffleArray(data.walls.exercises);
      let combat = weightedShuffleArray(data.combat.exercises);
      let recovery = weightedShuffleArray(data.recovery.exercises);

      // Parse music

      let training_music = data.training.music;
      let walls_music = data.walls.music;
      let combat_music = data.combat.music;
      let recovery_music = data.recovery.music;

      // Select exercises

      let training_exercises = select_exercises(training, 3);
      let transport_exercises = transport[0];
      let walls_exercises = select_exercises(walls, 1);
      let combat_exercises = select_exercises(combat, 1);
      let recovery_exercises = select_exercises(recovery, 3);

      // Order them sensibly

      for (let i = 0; i < training_exercises.length; i++) {

        if (training_exercises[i].includes("DB")) { moveToLast(training_exercises, training_exercises[i]) }
        if (!recovery_exercises[i].includes("DB")) { moveToLast(recovery_exercises, recovery_exercises[i]) }

      };

      // Set title

      document.getElementById("main_title").innerHTML = transport_exercises[1][0];
      document.getElementById("transport_title").innerHTML = transport_exercises[1][1];

      // Set exercises

      for (x of training_exercises) { add_exercise(x, training_music, "training"); };
      add_exercise(transport_exercises[0], transport_exercises[2], "transport");
      for (x of walls_exercises) { add_exercise(x, walls_music, "walls"); }
      for (x of combat_exercises) { add_exercise(x, combat_music, "combat"); };
      for (x of recovery_exercises) { add_exercise(x, recovery_music, "recovery"); };

    });

};

// set up listener for button with id generate

document.getElementById("generate").addEventListener("click", generate_exercises);

// Chart setup

fetch('../Data/history.json')
  .then((response) => response.json())
  .then(data => {

    const labels = Object.keys(data);
    const body_compositionData = labels.map(date => ((((100 - data[date].circumference) / 29) + (55 / (100 - data[date].arm_circ))) / 2) * 100);
    const benchPressData = labels.map(date => (data[date].bench_press / (1.75 * data[date].weight)) * 100);
    const deadliftData = labels.map(date => (data[date].deadlift / (2.5 * data[date].weight)) * 100);
    const ctx = document.getElementById("myChart").getContext("2d");

    console.log(benchPressData);

    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Body composition (waist and arm circumference)',
            data: body_compositionData,
            borderColor: 'rgb(114, 46, 250)',
            backgroundColor: 'rgba(115, 45, 255, 0.2)',
            yAxisID: 'y',
          },
          {
            label: 'Bench press (% of goal)',
            data: benchPressData,
            borderColor: 'rgb(255, 196, 137)',
            backgroundColor: 'rgba(250, 197, 144, 0.2)',
            yAxisID: 'y',
          },
          {
            label: 'Deadlift (% of goal)',
            data: deadliftData,
            borderColor: 'rgb(133, 192, 231)',
            backgroundColor: 'rgba(144, 198, 235, 0.2)',
            yAxisID: 'y',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        stacked: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            suggestedMin: 0,
            suggestedMax: 100,
            title: {
              display: true,
              text: '% of goal'
            }
          },
        }
      }
    });
  });
