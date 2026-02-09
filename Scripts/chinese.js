// // SET LEARNING PLAN\

ALL_WORDS = [];
NAME = "";

// Set start and end dates

const periods = {
    "HSK 1": [new Date("2026-02-08"), new Date("2026-05-16")],
    "HSK 2": [new Date("2026-05-17"), new Date("2026-11-16")],
    "HSK 3": [new Date("2026-11-17"), new Date("2027-05-16")],
    "HSK 4": [new Date("2027-05-17"), new Date("2027-11-16")],
    "HSK 5": [new Date("2027-11-17"), new Date("2028-05-16")],
    "HSK 6": [new Date("2028-05-17"), new Date("2028-11-16")]
};

let todaysWords = [];
let wordsToRepeat = [];     // words failed yesterday / earlier today
let currentIndex = 0;       // position in todaysWords + repeats
let todaysTargetCount = 0;

// 1. Determine current period
function getCurrentPeriod(today = new Date()) {
    today.setHours(0, 0, 0, 0); // normalize to day start

    for (const [name, [start, end]] of Object.entries(periods)) {
        if (today >= start && today <= end) {
            return { name, start, end };
        }
    }
    return null; // before HSK1 or after HSK6
}

// 2. Calculate total days in period (inclusive)
function daysInPeriod(start, end) {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((end - start) / msPerDay) + 1;
}

// 3. Load & chunk vocab
async function loadAndPrepareVocab() {
    const period = getCurrentPeriod();

    if (!period) {
        document.getElementById("chinese_intro").textContent = "No active HSK period today";
        return;
    }

    const { name, start, end } = period;
    const totalDays = daysInPeriod(start, end);

    NAME = name; // for display and distractor generation

    // Fetch your real JSON – adjust filename/path
    const response = await fetch(`../Data/HSK_vocabulary.json`);
    const original_JSON = await response.json(); // expect array of {char, pinyin, eng}

    allWords = original_JSON["Vocabulary"].filter(w => w.Level === period.name)[0]["Words"];

    console.log(allWords);

    const wordsPerDay = Math.ceil(allWords.length / totalDays);

    console.log(`Plan → ${wordsPerDay} new words/day for ${name} (${allWords.length} total / ${totalDays} days)`);

    // Calculate how many days have passed since start (0 = first day)
    const daysSinceStart = Math.floor((new Date() - start) / (24 * 60 * 60 * 1000));
    const startIdx = daysSinceStart * wordsPerDay;
    let endIdx = startIdx + wordsPerDay;

    // Last period may have fewer words
    if (endIdx > allWords.length) endIdx = allWords.length;

    todaysWords = allWords.slice(startIdx, endIdx);

    // For very first day → no yesterday
    yesterdayWords = daysSinceStart > 0
        ? allWords.slice((daysSinceStart - 1) * wordsPerDay, startIdx)
        : [];

    console.log("Yesterday's words:", yesterdayWords);
    console.log("Today's new words:", todaysWords);

    // Combine: repeat yesterday → then learn new
    sessionWords = [...yesterdayWords, ...todaysWords, ...todaysWords];
    todaysTargetCount = sessionWords.length; 

    // Shuffle new words? (optional – many prefer fixed order for spaced repetition)
    // todaysWords.sort(() => Math.random() - 0.5);

    // Working list for today (we'll add failed words to the end)
    wordsToRepeat = [];
    currentIndex = 0;

    updateCounter();

    ALL_WORDS = allWords; // for distractor generation

    showNextWord();
}

// Update x/y counter
function updateCounter() {
    const done = currentIndex;
    const total = todaysTargetCount + wordsToRepeat.length;
    document.getElementById("counter_block").textContent =
        `Counter: ${done}/${total}`;
}

function showNextWord() {

    const wordList = [...sessionWords, ...wordsToRepeat];

    console.log(wordList);

    if (currentIndex >= wordList.length) {
        finishSession();
        return;
    }

    const word = wordList[currentIndex];

    let question, correctAnswer, distractors;

    console.log(wordList)

    // Random if yesterdays words, Character -> Pinyin for first pass for today's words, then Character -> English for second pass

    if (currentIndex < yesterdayWords.length) {

        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - Old`;

        mode = Math.random() < 0.5 ? "Character" : "English";

        if (mode === "Character") {
            question = "Chinese: " + word.Character;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Translation";
            correctAnswer = word[answer_mode];
            distractors = getDistractors(word, answer_mode);
        } else {
            question = "English: " + word.Translation;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Character";
            correctAnswer = word[answer_mode];
            distractors = getDistractors(word, answer_mode);
        }

    } else if (currentIndex < yesterdayWords.length + todaysWords.length) {

        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - New`;

        question = "Chinese: " + word.Character;
        answer_mode = "Pinyin";
        correctAnswer = word[answer_mode];
        distractors = getDistractors(word, answer_mode);

    } else if (currentIndex < yesterdayWords.length + todaysWords.length + todaysWords.length) {

        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - New`;

        question = "Chinese: " + word.Character;
        answer_mode = "Translation";
        correctAnswer = word[answer_mode];
        distractors = getDistractors(word, answer_mode);

    } else {

        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - Repeat`;

        if (mode === "Character") {
            question = "Chinese: " + word.Character;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Translation";
            correctAnswer = word[answer_mode];
            distractors = getDistractors(word, answer_mode);
        } else {
            question = "English: " + word.Translation;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Character";
            correctAnswer = word[answer_mode];
            distractors = getDistractors(word, answer_mode);
        }

    };

    console.log("Question:", question, "Correct:", correctAnswer, "Distractors:", distractors);

    document.getElementById("current_word").textContent = question;

    // Set MC options (2×2 = 4 options)
    const options = [correctAnswer, ...distractors.slice(0, 3)];
    options.sort(() => Math.random() - 0.5); // shuffle

    const allAnswers = document.querySelectorAll(".MC_answer");
    allAnswers.forEach((el, i) => {
        el.textContent = options[i] || "";
        el.onclick = () => handleAnswer(el.textContent, correctAnswer, word);
        el.style.background = ""; // reset color
        el.style.pointerEvents = "auto";
    });
}

function getDistractors(correct_word, answer_mode) {
    
    // Get 4 random words from the wordlist
    const shuffled = [...ALL_WORDS].sort(() => Math.random() - 0.5);
    
    // Return the first 3 that aren't the correct answer
    const distractors = [];

    correct = correct_word[answer_mode];

    console.log(correct_word);

    for (const w of shuffled) {
        if (w[answer_mode] !== correct && !distractors.includes(w[answer_mode]) && w["Character"].length == correct_word["Character"].length) {
            distractors.push(w[answer_mode]);
        }

        if (distractors.length >= 3) break;
    }

    return distractors;
}

function handleAnswer(selected, correct, word) {
    const allAnswers = document.querySelectorAll(".MC_answer");

    if (selected === correct) {
        // success
        allAnswers.forEach(el => {
            el.style.background = el.textContent === correct ? "#8f8" : "";
        });
        setTimeout(() => {
            currentIndex++;
            updateCounter();
            showNextWord();
        }, 800);
    } else {
        // wrong → block this option + add to repeat queue
        allAnswers.forEach(el => {
            if (el.textContent === selected) {
                el.style.background = "#f88";
                el.style.pointerEvents = "none";
            }
        });
        wordsToRepeat.push(word); // repeat at end
        updateCounter();
    }
}

function finishSession() {
    document.getElementById("current_word").textContent = "Well done! Session complete 🎉";
    document.querySelectorAll(".MC").forEach(el => el.style.display = "none");
    // You could also save progress to localStorage here
}

// Start everything
window.addEventListener("load", () => {
    loadAndPrepareVocab().catch(err => {
        console.error(err);
        document.getElementById("chinese_intro").textContent = "Error loading vocab";
    });
});