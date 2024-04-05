// Base URL for API requests
const baseUrl = "https://localhost:7036/api/";

// Counter to keep track of the number of questions generated
let questionCounter = 0;

// Function to fetch and display a question
async function getQuestion() {

    // Disable the buttons initially
    const generateQuestionButton = document.getElementById("generate-question");
    generateQuestionButton.disabled = true;
    const finishButton = document.getElementById("finish-button");
    finishButton.disabled = true;

    // Clear previous question and display container
    const questionsContainer = document.getElementById("questionsContainer");
    questionsContainer.innerHTML = '';
    questionsContainer.style.display = "block";

    // Increment question counter
    questionCounter++;

    // Get subject and language from select inputs
    const subject = document.getElementById("subject").value;
    const language = document.getElementById("language").value;

    // Create prompt object
    const prompt = {
        "Subject": subject,
        "Language": language
    };

    // Set URL for API request
    const url = baseUrl + "GPT/GPTChat";

    // Set request parameters
    const params = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
    };

    // Fetch question from API
    const response = await fetch(url, params);
    if (response.ok) {
        let data = await response.json();
        data = JSON.parse(data);

        // Display question text
        const question = document.createElement("div");
        question.textContent = data.question;
        questionsContainer.appendChild(question);

        // Display answer options
        let answersText = " </br> ";
        data.answers.forEach((answer, index) => {
            answersText += `<label><input type="radio" class="form-check-input" name="answer" value="${index}">  ${answer}</label><br>`;
        });
        question.innerHTML += answersText;

        // Add event listeners to radio buttons for answer selection
        const radioButtons = document.querySelectorAll('input[type="radio"][name="answer"]');
        radioButtons.forEach(function (radioButton) {
            radioButton.addEventListener("click", function () {
                const selectedValue = parseInt(radioButton.value);

                // Disable all other radio buttons
                radioButtons.forEach(function (otherButton) {
                    if (otherButton !== radioButton) {
                        otherButton.disabled = true;
                    }
                });

                // Enable the buttons when a radio button is clicked
                generateQuestionButton.disabled = false;
                finishButton.disabled = false;

                // Remove previous feedback
                const previousFeedback = questionsContainer.querySelector(".feedback");
                if (previousFeedback) {
                    previousFeedback.remove();
                }

                // Check if the selected answer is correct and display feedback
                const feedback = document.createElement("div");
                feedback.classList.add("feedback");
                if (selectedValue === data.correct_answer_index) {
                    feedback.innerHTML = "You are correct! <br> The correct answer is: " + data.answers[data.correct_answer_index];
                    feedback.classList.add("correct-answer");
                } else {
                    feedback.innerHTML = "Wrong Answer. <br> The correct answer is: " + data.answers[data.correct_answer_index];
                    feedback.classList.add("wrong-answer");
                }
                questionsContainer.appendChild(feedback);

                nextQuestion(); // Proceed to the next question
            });
        });
        nextQuestion(); // Proceed to the next question after setting up event listeners
    } else {
        console.error('Failed to fetch question:', response.statusText);
    }
}

// Function to handle next question logic
function nextQuestion() {
    const generateQuestion = document.getElementById("generate-question");
    const finishButton = document.getElementById("finish-button");

    if (questionCounter > 0) {
        generateQuestion.textContent = "Next Question"; // Update button text for next question
    }
    if (questionCounter === 5) {
        generateQuestion.style.display = "none"; // Hide the button after 5 questions
        finishButton.style.display = "block"; // Display the finish button

        // Display completion message
        const message = document.createElement("div");
        message.textContent = "Well done, you have finished answering the questions.";
        questionsContainer.appendChild(message);
    }
}

// Function to finish the quiz and redirect to another page
function finishQuiz() {
    window.location.href = "secondpage.html";
}
