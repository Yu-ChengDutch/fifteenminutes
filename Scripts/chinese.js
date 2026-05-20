// // SET LEARNING PLAN\

let ALL_WORDS = [];
let NAME = "";
let REPEAT_WORDS_PER_DAY = 5;
let CURRENT_ANSWERS = {};

let CURRENT_CORRECT_ANSWER = null;

let CURRENT_INDEX = 0;

let WORD_LIST = []; // current list of words being tested (new + repeats)

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
let todaysTargetCount = 0;

// 1. Determine current period
function getCurrentPeriod(today = new Date()) {
    today.setHours(0, 0, 0, 0); // normalize to day start

    for (const [name, [start, end]] of Object.entries(periods)) {
        if (today >= start && today <= end) {
            console.log(`Current period: ${name} (${start.toDateString()} - ${end.toDateString()})`);
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

function shuffle(array) {
    // Create a copy
    const shuffled = [...array];
    
    // Simple deterministic seed (you can change this number)
    let seed = 123456789;  
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Simple pseudo-random using seed
        seed = (seed * 16807) % 2147483647;
        const j = Math.floor((seed / 2147483647) * (i + 1));
        
        // Swap
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
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

    document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - Old`;

    // Fetch your real JSON – adjust filename/path
    const response = await fetch(`../Data/HSK_vocabulary.json`);
    const original_JSON = await response.json(); // expect array of {char, pinyin, eng}

    raw_words = original_JSON["Vocabulary"].filter(w => w.Level === period.name)[0]["Words"];

    ALL_WORDS = shuffle(raw_words);

    const wordsPerDay = Math.ceil(ALL_WORDS.length / totalDays);

    console.log(`Plan → ${wordsPerDay} new words/day for ${name} (${ALL_WORDS.length} total / ${totalDays} days)`);

    // Calculate how many days have passed since start (0 = first day)
    const daysSinceStart = Math.floor((new Date() - start) / (24 * 60 * 60 * 1000));
    const startIdx = daysSinceStart * wordsPerDay;
    let endIdx = startIdx + wordsPerDay;

    // Last period may have fewer words
    if (endIdx > ALL_WORDS.length) endIdx = ALL_WORDS.length;

    todaysWords = ALL_WORDS.slice(startIdx, endIdx);

    // For very first day → no yesterday
    yesterdayWords = daysSinceStart > 0
        ? ALL_WORDS.slice((daysSinceStart - 1) * wordsPerDay, startIdx)
        : [];

    // Random words already learned (for repeat practice) (not for first day)
    randomWords = daysSinceStart > Math.ceil(REPEAT_WORDS_PER_DAY / wordsPerDay)
        ? ALL_WORDS.slice(0, startIdx).sort(() => Math.random() - 0.5).slice(0, REPEAT_WORDS_PER_DAY) // 20 random from previous
        : [];

    console.log("Random words already learned:", randomWords);
    console.log("Yesterday's words:", yesterdayWords);
    console.log("Today's new words:", todaysWords);

    // Combine: repeat yesterday → then learn new
    sessionWords = [...randomWords, ...yesterdayWords, ...todaysWords, ...todaysWords];
    todaysTargetCount = sessionWords.length; 

    // Shuffle new words? (optional – many prefer fixed order for spaced repetition)
    // todaysWords.sort(() => Math.random() - 0.5);

    // Working list for today (we'll add failed words to the end)
    wordsToRepeat = [];

    WORD_LIST = [...sessionWords];

    showNextWord();
    updateCounter();
}

// Update x/y counter
function updateCounter() {
    const done = CURRENT_INDEX;
    const total = WORD_LIST.length;
    document.getElementById("counter_block").textContent =
        `Counter: ${done}/${total}`;
}

function showNextWord() {

    console.log("Show check")

    console.log(WORD_LIST);

    if (CURRENT_INDEX >= WORD_LIST.length) {
        finishSession();
        return;
    }

    const word = WORD_LIST[CURRENT_INDEX];

    let question, correctAnswer, distractors;

    console.log(WORD_LIST)

    // Random if yesterdays words, Character -> Pinyin for first pass for today's words, then Character -> English for second pass

    if (CURRENT_INDEX < (yesterdayWords.length + randomWords.length)) {

        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - Old`;

        mode = Math.random() < 0.5 ? "Character" : "English";

        if (mode === "Character") {
            question = "Chinese: " + word.Character;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Translation";
            correctAnswer = word;
            distractors = getDistractors(word, answer_mode);
        } else {
            question = "English: " + word.Translation;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Character";
            correctAnswer = word;
            distractors = getDistractors(word, answer_mode);
        }

    } else if (CURRENT_INDEX < yesterdayWords.length + randomWords.length + todaysWords.length) {

        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - New`;

        question = "Chinese: " + word.Character;
        answer_mode = "Pinyin";
        correctAnswer = word;
        distractors = getDistractors(word, answer_mode);

    } else if (CURRENT_INDEX < yesterdayWords.length + randomWords.length + todaysWords.length + todaysWords.length) {
        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - New`;

        question = "Chinese: " + word.Character;
        answer_mode = "Translation";
        correctAnswer = word;
        distractors = getDistractors(word, answer_mode);

    } else {

        document.getElementById("chinese_intro").textContent = `Currently doing: ${NAME} - Repeat`;

        if (mode === "Character") {
            question = "Chinese: " + word.Character;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Translation";
            correctAnswer = word;
            distractors = getDistractors(word, answer_mode);
        } else {
            question = "English: " + word.Translation;
            answer_mode = Math.random() < 0.5 ? "Pinyin" : "Character";
            correctAnswer = word;
            distractors = getDistractors(word, answer_mode);
        }

    };

    console.log("Question:", question, "Correct:", correctAnswer, "Distractors:", distractors);

    document.getElementById("current_word").textContent = question;

    // Add listener: if "current word" is clicked, read out loud

    document.getElementById("current_word").onclick = () => {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(`${word.Character} .`);
        utterance.lang = "zh-CN";
        utterance.volume = 1; // 0 to 1
        utterance.rate = 0.8;
        utterance.pitch = 1; // 0 to 2
        window.speechSynthesis.speak(utterance);
    };

    // Set MC options (2×2 = 4 options)
    const options = [correctAnswer, ...distractors.slice(0, 3)];
    options.sort(() => Math.random() - 0.5); // shuffle

    // Clear current_answers

    CURRENT_ANSWERS = {};

    const allAnswers = document.querySelectorAll(".MC_answer");
    allAnswers.forEach((el, i) => {
        el.textContent = options[i][answer_mode] || "";

        CURRENT_ANSWERS[options[i][answer_mode]] = options[i];

        el.onclick = () => handleAnswer(el.textContent, correctAnswer[answer_mode], word);
        el.style.background = ""; // reset color
        el.style.pointerEvents = "auto";
    });

    // Set the correct answer for "I don't know" button

    CURRENT_CORRECT_ANSWER = correctAnswer;

}

function getDistractors(correct_word, answer_mode) {
    
    // Get 4 random words from the WORD_LIST
    const shuffled = [...ALL_WORDS].sort(() => Math.random() - 0.5);
    
    // Return the first 3 that aren't the correct answer
    const distractors = [];

    correct = correct_word[answer_mode];

    console.log(correct_word);

    for (const w of shuffled) {
        if (w[answer_mode] !== correct && !distractors.includes(w[answer_mode]) && w["Character"].length == correct_word["Character"].length) {
            distractors.push(w);
        }

        if (distractors.length >= 3) break;
    }

    return distractors;
}

function handleAnswer(selected, correct, word) {
    const allAnswers = document.querySelectorAll(".MC_answer");

    console.log("Length of ALL_WORDS:", WORD_LIST.length);

    if (selected === correct) {
        // success
        allAnswers.forEach(el => {
            el.style.background = el.textContent === correct ? "#8f8" : "";
        });
        setTimeout(() => {
            CURRENT_INDEX++;
            updateCounter();
            showNextWord();
        }, 800);
    } else {

        console.log("Wrong answer selected:", selected, "Correct was:", correct);

        // wrong → block this option + add to repeat queue
        allAnswers.forEach(el => {
            if (el.textContent === selected) {
                el.style.background = "#f88";
                el.style.pointerEvents = "none";
            }
        });

        WORD_LIST.push(CURRENT_ANSWERS[selected]); // the wrong answer too
        WORD_LIST.push(word); // repeat at end

        updateCounter();

        IDontKnow();
    }

    console.log("Length of ALL_WORDS:", WORD_LIST.length);
}

function finishSession() {
    document.getElementById("current_word").textContent = "Well done! Session complete 🎉";
    document.querySelectorAll(".MC").forEach(el => el.style.display = "none");
    // You could also save progress to localStorage here
}

function IDontKnow() {

    if (CURRENT_CORRECT_ANSWER) {

        // Display correct answer for 3s in id=current_word, while displaying loading bar in button

        const currentWordElement = document.getElementById("current_word");
        currentWordElement.textContent = "";

        currentWordElement.style.height = "9vh";
        currentWordElement.style.transition = "height 0.25s";

        currentWordElement.textContent = `Answer: ${CURRENT_CORRECT_ANSWER.Character} / ${CURRENT_CORRECT_ANSWER.Pinyin} / ${CURRENT_CORRECT_ANSWER.Translation}`;

        const idkButton = document.getElementById("idk_button");
        idkButton.style.background = "#88f";
        idkButton.style.pointerEvents = "none";
        idkButton.style.width = "50%";
        idkButton.style.transition = "width 3s"

        // Add the current word in index + 2 

        WORD_LIST.splice(CURRENT_INDEX + 2, 0, CURRENT_CORRECT_ANSWER);


        updateCounter();

        setTimeout(() => {
            idkButton.style.background = "";
            idkButton.style.pointerEvents = "auto";
            

            idkButton.style.width = "78vw";
            idkButton.style.transition = "width 1s"

            // Reset current word element height

            currentWordElement.textContent = "";
            currentWordElement.style.height = "5vh";
            currentWordElement.style.transition = "height 0.25s";

            showNextWord();

        }, 3000);

        

    } else {
        alert("No current word to show answer for!");
    };

}

// Add listener to "I don't know" button
document.getElementById("idk_button").onclick = () => {
    
    // Retreive the current word being tested and correct answer

    IDontKnow();

};

// Start everything
window.addEventListener("load", () => {
    loadAndPrepareVocab().catch(err => {
        console.error(err);
        document.getElementById("chinese_intro").textContent = "Error loading vocab";
    });
});