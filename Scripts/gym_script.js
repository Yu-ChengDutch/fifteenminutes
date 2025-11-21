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
    const j = Math.floor(Math.random() * (i + 1));
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

      let training_exercises = training.slice(0, 3);
      let transport_exercises = transport[0];
      let walls_exercises = walls.slice(0, 1);
      let combat_exercises = combat.slice(0, 1);
      let recovery_exercises = recovery.slice(0, 2);

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

