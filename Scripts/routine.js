// Establish date prototype
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

// Set necessary variables

let liturgical_season = "";
let d = new Date();

// Establish functions
function getEaster(year) {
	var f = Math.floor,
		// Golden Number - 1
		G = year % 19,
		C = f(year / 100),
		// related to Epact
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		// number of days from 21 March to the Paschal full moon
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		// weekday for the Paschal full moon
		J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
		// number of days from 21 March to the Sunday on or before the Paschal full moon
		L = I - J,
		month = 3 + f((L + 40)/44),
		day = L + 28 - 31 * f(month / 4);

	return new Date(year, month - 1, day);
}

function fetch_imitatio() {

    fetch('../Data/imitation_of_christ.html')
    .then(response => {

    let all_divs = document.getElementsByTagName("div");

    // Get random
    const myArray = new Uint8Array(10);
    let random_val = crypto.getRandomValues(myArray)[0] / 256;
    let random_index = Math.floor(all_divs.length * random_val);

    return all_divs[random_index]

    });


}

// Set all dates
let year = d.getFullYear();
let easter_date = getEaster(year)
let ascension_date = new Date(easter_date.addDays(39));
let pentecost_date = new Date(easter_date.addDays(49));
let christmas_date = new Date(d.getFullYear(), 11, 25)
let advent_date = new Date(new Date(christmas_date.getFullYear(), christmas_date.getMonth(), (christmas_date.getDate() - christmas_date.getDay())- 28))
let candlemass_date = (new Date(d.getFullYear() - 1, 11, 25)).addDays(39)
let holy_saturday_date = new Date(d.getFullYear(), easter_date.getMonth(), easter_date.getDate() - 1)

// Tester
d = d.addDays(0);

// Handles setting the prayers

fetch('../Data/virtues-and-vices.json')
    .then((response) => response.json())
    .then((exam_file) => { 

    // For each virtue, add title plus all questions

    var virtues = Object.keys(exam_file);

    // Get month, and the associated virtue

    const extra_day = new Date();
    let month = extra_day.getMonth();

    let current_virtue = virtues[month % 7];

    // Set morning prayer to the correct one

    let prayer_div = document.getElementById("prayer_block");
    prayer_div.innerHTML = "In the name of the Father, the Son and the Holy Spirit.<br>Amen<br><br>" + exam_file[current_virtue]["Prayer"] + "<br><br>St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue +  " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"

    // Set examination correct

    fetch('../Data/examination-of-conscience.json')
        .then((response) => response.json())
        .then((question_file) => {

            let title_block = document.getElementById("title_block");
            let title_block_2 = document.getElementById("title_block_2");
            let virtue_block = document.getElementById("virtue-question");

            let current_vice = exam_file[current_virtue]["Counter"];

            title_block.innerHTML = current_virtue + " / " + current_vice
            title_block_2.innerHTML = current_virtue + " / " + current_vice
            virtue_block.innerHTML = "How did I work on " + current_virtue + " and avoid " + current_vice + " today?"

            console.log(current_virtue);

            let current_questions = question_file[current_virtue]
            let first_question_block = document.getElementById("examination_block")
            let first_question_block_2 = document.getElementById("examination_block_2")

            for (let i = 1; i < current_questions.length; i++) {

                let new_block = document.createElement('div');
                new_block.setAttribute("class", "block");
                new_block.innerHTML = current_questions[i]
                first_question_block.appendChild(new_block);

            };

            let post_examination_prayer = document.getElementById("post_prayer_block");
            let post_examination_prayer_2 = document.getElementById("post_prayer_block_2");
            post_examination_prayer.innerHTML = "St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue +  " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"
            post_examination_prayer_2.innerHTML = "St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue +  " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"

            first_question_block_2.innerHTML = first_question_block.innerHTML;

        });

    });

// Set readings

fetch('../Data/readings.json')
    .then((response) => response.json())
    .then((readings_file) => {

        console.log("Check")

        console.log(liturgical_season);

        let source = readings_file[liturgical_season]

        let base = 0;

        if (liturgical_season == "Eastertide") { base = easter_date;} 
        else if (liturgical_season == "Ascensiontide") { base = ascension_date;} 
        else if (liturgical_season == "Time after Pentecost") { base = pentecost_date;}

        let difference = Math.floor((Math.abs(base - d)) / (1000 * 60 * 60 * 24));

        console.log(liturgical_season);
        let day_source = source[difference];

        console.log(difference);

        let name = day_source["Name"];
        let remark = day_source["Remark"];
        let first_reading = day_source["Reading"];
        let gospel_reading = day_source["Gospel"];

        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

        let text_date = "";

        if (remark == null) {
            text_date = "It is " + weekday[d.getDay()] + " " + d.toLocaleDateString() + "<br><br>It is the " + (difference + 1) + "th day in " + liturgical_season + ": <br>" + name;
        } else {
            text_date = "It is " + weekday[d.getDay()] + " " + d.toLocaleDateString() + "<br><br>It is the " + (difference + 1) + "th day in " + liturgical_season + ": <br>" + name + "<br><br>Also: " + remark;
        }
        console.log(text_date);

        // Set first reading

        if (first_reading == null) {document.getElementById("first_reading").innerHTML = "No reading"}
        else {
            
            if(!Array.isArray(first_reading[0])) {

                document.getElementById("reading_title").innerHTML = first_reading[0]
                document.getElementById("first_reading").innerHTML = first_reading[1]

            } else {

                document.getElementById("reading_title").innerHTML = first_reading[0][0]
                document.getElementById("first_reading").innerHTML = first_reading[0][1]

                let gospel = document.getElementById("gospel");

                let reading_length = first_reading.length;

                for (let i=1;i < reading_length;i++) {

                    let reading_title = document.createElement("h4");
                    let first_reading_card = document.createElement("div");

                    // Set classes and ids
                    reading_title.id = "reading_title";
                    first_reading_card.id = "first_reading";
                    first_reading_card.className = "text_card";

                    // Set content
                    reading_title.innerHTML = first_reading[i][0];
                    first_reading_card.innerHTML = first_reading[i][1];

                    // Set in page
                    gospel.parentNode.insertBefore(reading_title, gospel);
                    gospel.parentNode.insertBefore(first_reading_card, gospel);

                }

            }

            
        
        };

        // Set hagiography

        if (Object.keys(day_source).includes("Hagiography")) {

            let hagio_reading = day_source["Hagiography"];

            if (!Array.isArray(hagio_reading[0])) {

                document.getElementById("hagio_title").innerHTML = hagio_reading[0];
                document.getElementById("hagio_reading").innerHTML = hagio_reading[1];

            } else {

                console.log("More than one, namely: " + hagio_reading.length);
                let reading_length = hagio_reading.length;

                document.getElementById("hagio_title").innerHTML = hagio_reading[0][0];
                document.getElementById("hagio_reading").innerHTML = hagio_reading[0][1];

                let at_one = document.getElementById("at_one");

                for (let i=1;i < reading_length;i++) {

                    let hagio_title = document.createElement("h4");
                    let hagio_reading_card = document.createElement("div");

                    // Set classes and ids
                    hagio_title.id = "hagio_title";
                    hagio_reading_card.id = "hagio_reading";
                    hagio_reading_card.className = "text_card";

                    // Set content
                    hagio_title.innerHTML = hagio_reading[i][0];
                    hagio_reading_card.innerHTML = hagio_reading[i][1];

                    // Set in page
                    at_one.parentNode.insertBefore(hagio_title, at_one);
                    at_one.parentNode.insertBefore(hagio_reading_card, at_one);

                }

            };

        } else {

            fetch('../Data/imitation_of_christ.html')
            .then(response => {
                return response.text()
            })
            .then(html => {
                // Initialize the DOM parser
                const parser = new DOMParser()

                // Parse the text
                const imitatio_christi = parser.parseFromString(html, "text/html")

                console.log(imitatio_christi)

                let all_divs = imitatio_christi.getElementsByTagName("div");

                // Get random
                const myArray = new Uint8Array(10);
                let random_val = crypto.getRandomValues(myArray)[0] / 256;
                let random_index = Math.floor(all_divs.length * random_val);

                let page =  all_divs[random_index]

                console.log(page.innerHTML)
                document.getElementById("hagio_announcement").innerHTML = "Step 6: Imitatio Christi"
                document.getElementById("hagio_reading").innerHTML = page.innerHTML;

            });        
        };

        // Set gospel reading

        if (gospel_reading == null) {document.getElementById("gospel_reading").innerHTML = "No reading"}
        else {
            
            document.getElementById("gospel_title").innerHTML = gospel_reading[0]
            document.getElementById("gospel_reading").innerHTML = gospel_reading[1]
        
        };

        document.getElementById("date").innerHTML = text_date;

    });

// Handles setting the Angelus

// Fill in the hymns / Angelus

let angelus_text = ""

if (d >= easter_date && d <= (pentecost_date.addDays(8))){

    liturgical_season = "Eastertide"
    angelus_text = `
    <img src='../Images/IMAGE_Regina_coeli.png'>

    <div class="introduction"> 
    
    V. Gaude et laetare, Virgo Maria, alleluia!<br>
    R. Quia surrexit Dominus vere, alleluia!<br><br>

    Oremus.<br>
    Deus, qui per resurrectionem Filii tui, Domini nostri Iesu Christi, mundum laetificare dignatus es:
    praesta, quaesumus, ut per eius Genetricem Virginem Mariam, perpetuae capiamus gaudia vitae. <br>
    Per eundem Christum Dominum nostrum.<br><br>

    Gloria Patri et Filio et Spiritui Sancto, sicut erat in principo et nunc et semper, et in saecula
    saeculorum. Amen. <br><br>

    In nomine Patris, et Filii, et Spiritus Sancti. Amen. 
    
    </div
    `
    console.log("It is indeed easter. Ascension is on: " + ascension_date + ". It is now: " + d);

    if (d >= ascension_date && d < pentecost_date) {

        console.log("It is Ascensiontide")
        liturgical_season = "Ascensiontide"

    } else if (d >= pentecost_date) {

        console.log("It is Octave of Pentecost")
        liturgical_season = "Time after Pentecost"

    }

} else {

    console.log("Not eastertide")
    angelus_text = "<img src='../Images/IMAGE_Angelus_1.png'>"
    liturgical_season = "Time after Pentecost"

    // Marian hymns

    if (d <= candlemass_date || d >= advent_date) {
        liturgical_season = "Advent"
        //document.getElementById("marian-hymn").innerHTML = "<img src='../Images/IMAGE_Alma_Redemptoris.png'>"
    } else if (d > candlemass_date && d <= holy_saturday_date) {
        liturgical_season = "Christmastide"
        //document.getElementById("marian-hymn").innerHTML = "<img src='../Images/IMAGE_Ave_Regina.jpeg'>"
    } else {
        liturgical_season = "Time after Pentecost"
        //document.getElementById("marian-hymn").innerHTML = "<img src='../Images/IMAGE_Salve_Regina.png'>"
    }

}

document.getElementById("angelus_block_2").innerHTML = angelus_text
document.getElementById("angelus_block").innerHTML = angelus_text

if (d.getDay() == 6 || d.getDay() == 1 || d.getDay() == 3) {

    document.getElementById("cleanse_block").innerHTML = "Cleanse face (Bettoli, V., 2020)"
    document.getElementById("cut_block").innerHTML = "Cut facial hair"

    if (d.getDay() == 6) {

        document.getElementById("cut_block").innerHTML = "Cut facial hair<br>Trim haircut<br>Trim finger nails";
        document.getElementById("diary_block_week1").innerHTML = "Analyse monthly goals"
        document.getElementById("diary_block_week2").innerHTML = "Analyse week"

        

    }

} else if (d.getDay() == 0) {

    document.getElementById("med_intro").outerHTML = ""
    document.getElementById("med_card").outerHTML = ""

}

if (d.getMonth() >= 3 && d.getMonth() <= 8) {

    document.getElementById("spirulina_block").innerHTML = "6pcs Spirulina"
}