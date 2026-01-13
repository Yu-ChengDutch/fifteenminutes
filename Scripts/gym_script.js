// Constants
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor((rand_array[i] / 255) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

function select_exercises(exercise_list, number) {

  // Avoid selecting more than one exercise where the final word overlaps

  let selected_exercises = [exercise_list[0]];

  for (let i = 1; selected_exercises.length < number; i++) {

    let candidate = exercise_list[i];
    let overlap = false;

    for (let j = 0; j < selected_exercises.length; j++) {

      let selected_words = selected_exercises[j].split(":")[0].split(" ");
      let candidate_words = candidate.split(":")[0].split(" ");

      if (selected_words[selected_words.length - 1] === candidate_words[candidate_words.length - 1]) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      selected_exercises.push(candidate);
    }

  }

  return selected_exercises;

};

// Set up the random exercises  

fetch('../Data/exercises.json')
  .then((response) => response.json())
  .then(data => {

      // Parse the JSON and randomise

      let training = shuffleArray(data.training.exercises);
      let transport = shuffleArray(data.transport.exercises);
      let walls = shuffleArray(data.walls.exercises);
      let combat = shuffleArray(data.combat.exercises);
      let recovery = shuffleArray(data.recovery.exercises);

      // Parse music

      let training_music = data.training.music;
      let walls_music = data.walls.music; 
      let combat_music = data.combat.music;
      let recovery_music = data.recovery.music;

      // Select exercises

      let training_exercises = select_exercises(training, 3);
      let transport_exercises = transport[0];
      let walls_exercises = walls.slice(0, 1);
      let combat_exercises = combat.slice(0,1); 
      let recovery_exercises = select_exercises(recovery, 2);

      // Set title

      document.getElementById("main_title").innerHTML = transport_exercises[1][0];
      document.getElementById("transport_title").innerHTML = transport_exercises[1][1];

      // Set exercises

      for (x of training_exercises) {add_exercise(x, training_music, "training");};
      add_exercise(transport_exercises[0], transport_exercises[2], "transport");
      for (x of walls_exercises) {add_exercise(x, walls_music, "walls");}
      for (x of combat_exercises) {add_exercise(x, combat_music, "combat");};
      for (x of recovery_exercises) {add_exercise(x, recovery_music, "recovery");};
    
  });

// Chart setup

fetch('../Data/history.json')
  .then((response) => response.json())
  .then(data => {

    const labels = Object.keys(data);
    const weightData = labels.map(date => data[date].weight);
    const circumferenceData = labels.map(date => data[date].circumference);
    const benchPressData = labels.map(date => data[date].bench_press);
    const deadliftData = labels.map(date => data[date].deadlift);
    const squatData = labels.map(date => data[date].squat);
    const ctx = document.getElementById("myChart").getContext("2d");

    const myChart = new Chart(ctx, {
      type: 'line',
      data: { 
        labels: labels,
        datasets: [
          {
            label: 'Waist circ. (cm)',
            data: circumferenceData, 
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            yAxisID: 'y',
          },
          {
            label: 'Bodyweight (kg)',
            data: weightData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'y1',
          },
          {
            label: 'Bench press (kg)',
            data: benchPressData,
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            yAxisID: 'y1',
          },
          {
            label: 'Deadlift (kg)',
            data: deadliftData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            yAxisID: 'y1',
          },
          {
            label: 'Squat (kg)',
            data: squatData,  
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            yAxisID: 'y1',
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
            suggestedMin: 50,
            suggestedMax: 100,
            title: {
              display: true,
              text: 'Waist circumference (cm)'
            }
          },  
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            suggestedMin: 50,
            suggestedMax: 200,
            title: {
              display: true,
              text: 'Lifting weights and bodyweight (kg)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        }
      }
    });
  });
  

