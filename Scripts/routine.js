// Establish date prototype
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

// Set necessary variables

let liturgical_season = "";
let d = new Date();

function set_up() {

    // Establish functions
    function getEaster(year) {
        var f = Math.floor,
            // Golden Number - 1
            G = year % 19,
            C = f(year / 100),
            // related to Epact
            H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
            // number of days from 21 March to the Paschal full moon
            I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
            // weekday for the Paschal full moon
            J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
            // number of days from 21 March to the Sunday on or before the Paschal full moon
            L = I - J,
            month = 3 + f((L + 40) / 44),
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
    let advent_date = new Date(new Date(christmas_date.getFullYear(), christmas_date.getMonth(), (christmas_date.getDate() - christmas_date.getDay()) - 21))
    let baptism_lord_date = new Date(d.getFullYear(), 0, 13)
    let septuagesima_date = new Date(easter_date.addDays(-63))
    let ash_wednesday_date = new Date(easter_date.addDays(-46))

    // console.log("Baptism: " + baptism_lord_date);
    // console.log(d)

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
            prayer_div.innerHTML = "In the name of the Father, the Son and the Holy Spirit.<br>Amen<br><br>" + exam_file[current_virtue]["Prayer"] + "<br><br>St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue + " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"

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

                    let current_questions = question_file[current_virtue]
                    let examinations = document.getElementsByClassName("particular-examination")

                    for (let x = 0; x < examinations.length; x++) {

                        let current_examination = examinations[x]

                        if (current_examination.innerHTML == "placeholder") {

                            current_examination.innerHTML = ""

                            for (let i = 0; i < current_questions.length; i++) {

                                let new_block = document.createElement('div');
                                //new_block.setAttribute("class", "block");
                                new_block.innerHTML = current_questions[i] + "<br><br>"
                                current_examination.appendChild(new_block);

                            };

                        }

                    }


                    let post_examination_prayer = document.getElementById("post_prayer_block");
                    let post_examination_prayer_2 = document.getElementById("post_prayer_block_2");
                    post_examination_prayer.innerHTML = "St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue + " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"
                    post_examination_prayer_2.innerHTML = "St. Ignatius of Loyala, pray for us that the good Lord may grant me the virtue of " + current_virtue + " and protect me from the vice of " + exam_file[current_virtue]["Counter"] + "<br>Amen"

                });

        });

    // Set readings

    fetch('../Data/readings.json')
        .then((response) => response.json())
        .then((readings_file) => {

            let source = readings_file[liturgical_season]

            let base = 0;
            let difference = 0;
            let extra_difference = -1;

            if (liturgical_season == "Eastertide") { base = easter_date; }
            else if (liturgical_season == "Ascensiontide") { base = ascension_date; }
            else if (liturgical_season == "Time after Pentecost") { base = pentecost_date; }
            else if (liturgical_season == "Advent") { base = advent_date; }
            else if (liturgical_season == "Christmastide") {

                if (d.getMonth() == 11) { base = christmas_date; }
                else {

                    // Find day in source where name is "Octave day of the Nativity of the Lord"

                    for (let i = 0; i < source.length; i++) {

                        let name = source[i]["Name"];
                        if (name == "Octave day of the Nativity of the Lord") {

                            extra_difference = i;
                            break;
                        }

                    };

                    base = new Date(d.getFullYear(), 0, 1);

                }

            }
            else if (liturgical_season == "Time after Epiphany") { extra_difference = -1; base = baptism_lord_date.addDays(1); }
            else if (liturgical_season == "Septuagesimatide") { extra_difference = -1; base = septuagesima_date; }
            else if (liturgical_season == "Lent") { extra_difference = -1; base = ash_wednesday_date; }
            else if (liturgical_season == "Passiontide") { extra_difference = -1; base = easter_date.addDays(-14); }

            difference = Math.floor((Math.abs(base - d)) / (1000 * 60 * 60 * 24));

            if (extra_difference != -1) { difference = extra_difference + difference; }

            console.log("Today is day " + (difference + 1) + " in " + liturgical_season);

            let day_source = source[difference];

            let name = day_source["Name"];
            let remark = day_source["Remark"];
            let first_reading = day_source["Reading"];
            let gospel_reading = day_source["Gospel"];
            let liturgical_class = day_source["Class"];

            console.log("Name: " + name)
            console.log("Remark: " + remark)

            let feast = null;

            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            // Check if readings are null, in which case set from commons

            if (first_reading == null && gospel_reading == null) {

                if (name.includes("martyr")) {

                    if (name.includes("bishop")) { feast = "Bishop & Martyr" }
                    else if (name.includes("virgin")) { feast = "Virgin & Martyr" }
                    else { feast = "Martyr" }

                }
                else if (name.includes("doctor")) { feast = "Doctor of the Church" }
                else if (name.includes("pope")) { feast = "Pope" }
                else if (name.includes("abbot")) { feast = "Abbot" }
                else if (name.includes("bishop")) { feast = "Bishop" }
                else if (name.includes("confessor")) { feast = "Confessor" }
                else if (name.includes("virgin")) { feast = "Virgin" }
                else if (name.toLowerCase().includes("saturday")) { feast = "BVM" }

                // Set readings for feria to previous Sunday

                else if (name.toLowerCase().includes("feria")) {

                    while (first_reading == null && gospel_reading == null) {

                        difference = difference - 1;
                        new_source = source[difference];

                        if (new_source["Name"].toLowerCase().includes("sunday")) {

                            first_reading = new_source["Reading"];
                            gospel_reading = new_source["Gospel"];

                        };

                    };
                };

            }

            console.log("It is a feast of a: " + feast)

            // Set reading to commons if feast isn't null

            if (feast != null) {

                if (feast != "BVM") {
                    first_reading = readings_file["Common readings"][feast]["Reading"];
                    gospel_reading = readings_file["Common readings"][feast]["Gospel"];

                    if (feast == "Martyr" || feast == "Bishop & Martyr") {

                        if (liturgical_season == "Eastertide") {

                            first_reading = readings_file["Common readings"][feast]["Eastertide"]["Reading"];
                            gospel_reading = readings_file["Common readings"][feast]["Eastertide"]["Gospel"];

                        } else {

                            first_reading = readings_file["Common readings"][feast]["Not Eastertide"]["Reading"];
                            gospel_reading = readings_file["Common readings"][feast]["Not Eastertide"]["Gospel"];
                        }

                    };

                } else {

                    first_reading = readings_file["Common readings"]["BVM"][liturgical_season]["Reading"];
                    gospel_reading = readings_file["Common readings"]["BVM"][liturgical_season]["Gospel"];

                    // console.log("Set BVM reading for " + liturgical_season);
                    // console.log(first_reading);
                    // console.log(gospel_reading);

                };
            };


            let text_date = "";

            if (remark == null || remark == "") {
                text_date = "It is " + weekday[d.getDay()] + " " + d.toLocaleDateString() + "<br><br>It is the " + (difference + 1) + "th day in " + liturgical_season + ": <br>" + name;
            } else {
                text_date = "It is " + weekday[d.getDay()] + " " + d.toLocaleDateString() + "<br><br>It is the " + (difference + 1) + "th day in " + liturgical_season + ": <br>" + name + "<br><br>Also: " + remark;
            }

            // Set first reading

            if (first_reading == null) { document.getElementById("first_reading").innerHTML = "No reading" }
            else {

                if (!Array.isArray(first_reading[0])) {

                    document.getElementById("reading_title").innerHTML = first_reading[0]
                    document.getElementById("first_reading").innerHTML = first_reading[1]

                } else {

                    document.getElementById("reading_title").innerHTML = first_reading[0][0]
                    document.getElementById("first_reading").innerHTML = first_reading[0][1]

                    let gospel = document.getElementById("gospel");

                    let reading_length = first_reading.length;

                    for (let i = 1; i < reading_length; i++) {

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

                document.getElementById("hagio_title").innerHTML = hagio_reading[0];
                document.getElementById("hagio_reading").innerHTML = hagio_reading[1];

                if (Array.isArray(hagio_reading[0])) {

                    let reading_length = hagio_reading.length;

                    document.getElementById("hagio_title").innerHTML = hagio_reading[0][0];
                    document.getElementById("hagio_reading").innerHTML = hagio_reading[0][1];

                    let routine_at_six = document.getElementById("six_oclock_routine");

                    for (let i = 1; i < reading_length; i++) {

                        let hagio_title = document.createElement("h4");
                        let hagio_reading_card = document.createElement("div");


                        // Set classes and ids
                        hagio_title.id = "hagio_title_" + i;
                        hagio_reading_card.id = "hagio_card_" + i;
                        hagio_reading_card.className = "text_card";

                        // Set content
                        hagio_title.innerHTML = hagio_reading[i][0];
                        hagio_reading_card.innerHTML = hagio_reading[i][1];

                        // console.log(routine_at_six.childNodes);
                        // console.log(hagio_title);

                        if (document.getElementById(hagio_title.id) != null) { console.log("Caught it!") }
                        else {

                            // Set in page
                            routine_at_six.insertBefore(hagio_reading_card, document.getElementById("hagio_title"));
                            routine_at_six.insertBefore(hagio_title, hagio_reading_card);

                            // console.log(i);

                        };

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

                        let all_divs = imitatio_christi.getElementsByTagName("div");

                        // Get random
                        const myArray = new Uint8Array(10);
                        let random_val = crypto.getRandomValues(myArray)[0] / 256;
                        let random_index = Math.floor(all_divs.length * random_val);

                        let page = all_divs[random_index]

                        document.getElementById("hagio_announcement").innerHTML = "Step 6: Imitatio Christi"
                        document.getElementById("hagio_reading").innerHTML = page.innerHTML;

                    });
            };

            // Set gospel reading

            if (gospel_reading == null) { document.getElementById("gospel_reading").innerHTML = "No reading" }
            else {

                document.getElementById("gospel_title").innerHTML = gospel_reading[0]
                document.getElementById("gospel_reading").innerHTML = gospel_reading[1]

            };

            // console.log(text_date);
            document.getElementById("date").innerHTML = text_date;

            // Set prayers

            if (liturgical_class <= 2 || liturgical_season == "Lent" || liturgical_season == "Passiontide" || liturgical_season == "Advent") {

                document.getElementById("morning-prayer").innerHTML = '<a href="https://www.tiltenberg.org/getijdengebed/">Pray matins</a>';
                document.getElementById("morning-prayer").className = "make-button";
                document.getElementById("morning-prayer").classList.add("introduction");

                document.getElementById("angelus_block_2").innerHTML = '<a href="https://www.tiltenberg.org/getijdengebed/">Pray sext</a>';
                document.getElementById("angelus_block_2").className = "make-button";
                document.getElementById("angelus_block_2").classList.add("introduction");

                document.getElementById("angelus_block").innerHTML = '<a href="https://www.tiltenberg.org/getijdengebed/">Pray vespers</a>';
                document.getElementById("angelus_block").className = "make-button";
                document.getElementById("angelus_block").classList.add("introduction");

                document.getElementById("evening-prayer").innerHTML = '<a href="https://www.tiltenberg.org/getijdengebed/" >Pray completes</a>';
                document.getElementById("evening-prayer").className = "make-button";
                document.getElementById("evening-prayer").classList.add("introduction");

            }

            // Set additional devotionals (during Lent & Passiontide, daily rosary yu-chengdutch.github.io/Rosarium, additional readings)
            if (liturgical_season == "Lent" || liturgical_season == "Passiontide") {

                console.log("Check")

                // id = additional_devotionals is a UL, so add LI for each additional devotional

                let additional_devotionals = document.getElementById("additional_devotionals");

                additional_devotionals.innerHTML = "";

                let rosary = document.createElement("li");
                rosary.innerHTML = '<a href="https://yu-chengdutch.github.io/Rosarium/">Pray the rosary</a>';
                additional_devotionals.appendChild(rosary);

                let additional_readings = document.createElement("li");
                additional_readings.innerHTML = 'Additional readings (Acts & Apocalypse)';
                additional_devotionals.appendChild(additional_readings);

                let shower = document.getElementById("shower");
                shower.innerHTML = "COLD shower"

                // Set list of rules
                let rules_list = document.getElementById("rules-list");

                let rules_list_HTML = `

                    <li>Don't sleep in</li>
                    <li>Don't do anything that isn't planned</li>
                    <li>Don't skip anything that is planned</li>
                    <li>Don't forget morning and evening exercises</li>
                    <li>Don't receive the Eucharist unworthily</li>
                    <li>Don't drink alcohol alone nor order-in</li>
                    <br>
                    <li>LENT: GET UP IN 5 MINUTES</li>
                    <li>LENT: DAILY COLD SHOWER</li>
                    <li>LENT: GO OUTSIDE FOR 30 MINUTES</li>
                    <li>LENT: NO MEAT, ALCOHOL, SNACKS</li>
                
                `

                rules_list.innerHTML = rules_list_HTML;

                let lunch = document.getElementById("lunch");
                let dinner = document.getElementById("dinner");
                let dinner_list = document.getElementById("dinner-list");

                dinner_list.innerHTML = "";

                if (d.getDay() == 3 || d.getDay() == 5) {

                    let new_rule6 = document.createElement("li");
                    new_rule6.innerHTML = "LENT: NO COLLATIONS";
                    rules_list.appendChild(new_rule6);

                    lunch.innerHTML = "Step 8: NO LUNCH";
                    dinner.innerHTML = "Step 9: NO DINNER";

                } else {

                    lunch.innerHTML = "Step 8: Collation (protein shake w/o creatine)";
                    dinner.innerHTML = "Step 9: Collation (protein shake with creatine)";

                };

            };

        });

    // Handles setting the Angelus

    // Fill in the hymns / Angelus

    let angelus_text = ""

    if (d >= easter_date && d <= (pentecost_date.addDays(8))) {

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

        if (d >= ascension_date && d < pentecost_date) {

            liturgical_season = "Ascensiontide"

        } else if (d >= pentecost_date) {

            liturgical_season = "Time after Pentecost"

        }

    } else {

        // angelus_text = "<img src='../Images/IMAGE_Angelus_1.png'>"

        angelus_text = `

            <div class="introduction"> 
            
            Angelus Domini nuntiavit Mariae, et concepit de Spiritu Sancto.<br><br>

            R. Ave Maria, ... <br><br>
            
            Ecce ancilla Domini, fiat mihi secundum verbum tuum.<br><br>

            R. Ave Maria, ... <br><br>

            Et Verbum caro factum est, et habitavit in nobis.<br><br>

            R. Ave Maria, ... <br><br>

            Ora pro nobis, sancta Dei Genitrix.<br>
            Ut digni efficiamur promissionibus Christi. <br><br>

            Oremus.<br>
            Gratiam tuam, quaesumus, Domine, mentibus nostris infunde; ut qui, Angelo nuntiante, Christi Filii tui incarnationem cognovimus, per passionem eius et crucem ad resurrectionis gloriam perducamur. Per eundem Christum Dominum nostrum. Amen<br><br>

            Gloria Patri et Filio et Spiritui Sancto, sicut erat in principo et nunc et semper, et in saecula
            saeculorum. Amen. <br><br>

            In nomine Patris, et Filii, et Spiritus Sancti. Amen. 
            </div
            `

        liturgical_season = "Time after Pentecost"

        if (d < christmas_date && d >= advent_date) {
            liturgical_season = "Advent"
            //document.getElementById("marian-hymn").innerHTML = "<img src='../Images/IMAGE_Alma_Redemptoris.png'>"
        } else if (d >= christmas_date || d < baptism_lord_date.addDays(1)) {
            console.log("Christmastide")
            liturgical_season = "Christmastide"
            //document.getElementById("marian-hymn").innerHTML = "<img src='../Images/IMAGE_Ave_Regina.jpeg'>"
        } else if (d > baptism_lord_date && d < septuagesima_date) {
            console.log("Time after Epiphany")
            liturgical_season = "Time after Epiphany"
            //document.getElementById("marian-hymn").innerHTML = "<img src='../Images/IMAGE_Salve_Regina.png'>"
        } else if (d >= septuagesima_date && d < ash_wednesday_date) {
            liturgical_season = "Septuagesimatide"
        } else if (d >= ash_wednesday_date && d < easter_date.addDays(-14)) {
            liturgical_season = "Lent"
        } else if (d >= easter_date.addDays(-14) && d < easter_date) {
            liturgical_season = "Passiontide"
        }

        console.log("Easter Date:" + easter_date)

    }


    document.getElementById("angelus_block").innerHTML = angelus_text
    document.getElementById("angelus_block_2").innerHTML = angelus_text

    if (d.getDay() == 6 || d.getDay() == 1 || d.getDay() == 3) {

        document.getElementById("cleanse_block").innerHTML = "Cleanse face (Bettoli, V., 2020)"
        document.getElementById("cut_block").innerHTML = "Cut facial hair"

        if (d.getDay() == 6) {

            document.getElementById("cut_block").innerHTML = "Cut facial hair<br>Trim haircut<br>Trim finger nails";
            document.getElementById("diary_block_week1").innerHTML = "Analyse monthly goals"
            document.getElementById("diary_block_week2").innerHTML = "Analyse week"



        } else {

            document.getElementById("diary_block_week1").innerHTML = "";
            document.getElementById("diary_block_week2").innerHTML = "";
        }

    } else {

        document.getElementById("cleanse_block").innerHTML = "";
        document.getElementById("cut_block").innerHTML = "";
        document.getElementById("cut_block").innerHTML = "";
        document.getElementById("diary_block_week1").innerHTML = "";
        document.getElementById("diary_block_week2").innerHTML = "";

    }

    // Tester
    // d = d.addDays(8);

    if (d.getDay() == 6 || d.getDay() == 0) {

        document.getElementById("pre-gym-clothes").innerHTML = "Undress & log myself"

    }
}

set_up();

function nextDate() {

    d = d.addDays(1);
    set_up();

}

function pastDate() {

    d = d.addDays(-1);
    set_up();

}