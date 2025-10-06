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

