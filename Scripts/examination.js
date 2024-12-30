fetch('../Data/examination-of-conscience.json')
    .then((response) => response.json())
    .then((exam_file) => { 
    
    // Get page

    var current_page = document.getElementById("exam_body")

    // For each virtue, add title plus all questions

    var virtues = Object.keys(exam_file);

    for (let i = 0; i < virtues.length; i++){ 

        var new_virtue = document.createElement("h1");
        new_virtue.innerHTML = virtues[i];
        
        current_page.appendChild(new_virtue);

        var questions = exam_file[virtues[i]];

        for (let j = 0; j < questions.length; j++) {

            var new_question = document.createElement("div");
            new_question.setAttribute("class", "block");
            new_question.innerHTML = questions[j];
            
            current_page.appendChild(new_question);

        }

    }

    });