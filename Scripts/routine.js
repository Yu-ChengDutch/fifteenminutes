// Handles setting the prayers

fetch('../Data/virtues-and-vices.json')
    .then((response) => response.json())
    .then((exam_file) => { 

    // For each virtue, add title plus all questions

    var virtues = Object.keys(exam_file);

    // Get month, and the associated virtue

    const d = new Date();
    let month = d.getMonth();

    let current_virtue = virtues[month % 7];

    // Set morning prayer to the correct one

    let prayer_div = document.getElementById("prayer_block");
    prayer_div.innerHTML = "In the name of the Father, the Son and the Holy Spirit.<br>Amen<br><br>" + exam_file[current_virtue]["Prayer"] + "<br><br>St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue +  " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"

    // Set examination correct

    fetch('../Data/examination-of-conscience.json')
        .then((response) => response.json())
        .then((question_file) => {

            let title_block = document.getElementById("title_block");
            title_block.innerHTML = current_virtue + " / " + exam_file[current_virtue]["Counter"]

            let current_questions = question_file[current_virtue]
            let first_question_block = document.getElementById("examination_block")
            first_question_block.innerHTML = current_questions[0]

            for (let i = 1; i < current_questions.length; i++) {

                let new_block = document.createElement('div');
                new_block.setAttribute("class", "block");
                new_block.innerHTML = current_questions[i]
                first_question_block.parentNode.insertBefore(new_block, first_question_block.nextSibling);

            };

            let post_examination_prayer = document.getElementById("post_prayer_block");
            post_examination_prayer.innerHTML = "St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue +  " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"

        });

    });

// Handles setting the Angelus

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

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

const d = new Date();
let year = d.getFullYear();
let easter_date = getEaster(year)
let pentecost_date = easter_date.addDays(49)

if (d >= easter_date && d <= pentecost_date){

    console.log("Eastertide")
    document.getElementById("angelus_block").innerHTML = "<img src='../Images/IMAGE_Regina_coeli.png'>"
    
} else {

    console.log("Not eastertide")
    document.getElementById("angelus_block").innerHTML = "<img src='../Images/IMAGE_Angelus_1.png'>"

}

if (d.getDay() == 0 || d.getDay() == 3 || d.getDay() == 5) {

    document.getElementById("cleanse_block").innerHTML = "Step 3: Cleanse face (Bettoli, V., 2020)"

}

if (d.getMonth() >= 3 && d.getMonth() <= 8) {

    document.getElementById("spirulina_block").innerHTML = "6pcs Spirulina"
}