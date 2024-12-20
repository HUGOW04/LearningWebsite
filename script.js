let flashcards, multipleChoiceQuestions;
let score = {
    multipleChoice: 0
};
let totalQuestionsAnswered = 0;

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Calculate percentage score
function calculateScore() {
    const totalQuestions = multipleChoiceQuestions.length;
    const totalCorrect = score.multipleChoice;
    return ((totalCorrect / totalQuestions) * 100).toFixed(1);
}

// Calculate Security+ equivalent score
function calculateSecurityPlusScore() {
    const percentageScore = parseFloat(calculateScore());
    return Math.round((percentageScore / 100) * 900);
}

// Update score display
function updateScoreDisplay() {
    const totalQuestions = multipleChoiceQuestions.length;
    const secPlusScore = calculateSecurityPlusScore();
    const isPassing = secPlusScore >= 750;
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score-display';
    
    scoreElement.innerHTML = `
        Score: ${calculateScore()}% (${totalQuestionsAnswered}/${totalQuestions} questions)<br>
        Security+ Score: ${secPlusScore}/900 ${isPassing ? '✓' : '×'}
    `;
    
    // Remove existing score display if it exists
    const existingScore = document.getElementById('score-display');
    if (existingScore) {
        existingScore.remove();
    }
    document.body.appendChild(scoreElement);
}

function initializeApp() {
    // Get DOM elements
    const flashcardElement = document.getElementById("flashcard");
    const flashcardQuestion = document.getElementById("question");
    const flashcardAnswer = document.getElementById("answer");
    const nextCardBtn = document.getElementById("next-card");
    const startTestBtn = document.getElementById("start-test");
    const mcQuestion = document.getElementById("mc-question");
    const mcOptions = document.getElementById("mc-options");
    const submitMCBtn = document.getElementById("submit-mc");
    const mcFeedback = document.getElementById("mc-feedback");

    let currentFlashcardIndex = 0;
    let currentMCIndex = 0;

    // Flashcard functionality
    function showFlashcardContent(showAnswer = false) {
        if (showAnswer) {
            flashcardAnswer.textContent = flashcards[currentFlashcardIndex].answer;
            flashcardQuestion.textContent = "";
            flashcardElement.classList.add("flipped");
        } else {
            flashcardQuestion.textContent = flashcards[currentFlashcardIndex].question;
            flashcardAnswer.textContent = "";
            flashcardElement.classList.remove("flipped");
        }
    }

    flashcardElement.addEventListener("click", () => {
        flashcardElement.classList.toggle("flipped");
        showFlashcardContent(flashcardElement.classList.contains("flipped"));
    });

    nextCardBtn.addEventListener("click", () => {
        currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcards.length;
        showFlashcardContent(false);
    });

    startTestBtn.addEventListener("click", () => {
        document.getElementById("flashcard-section").style.display = "none";
        document.getElementById("multiple-choice-section").style.display = "block";
        showMultipleChoiceQuestion();
    });

    // Multiple choice functionality
    function showMultipleChoiceQuestion() {
        submitMCBtn.disabled = true;
        mcQuestion.textContent = "Loading...";
        mcOptions.innerHTML = "";
        mcFeedback.textContent = "";
        mcFeedback.className = "feedback";
        
        setTimeout(() => {
            const currentQuestion = multipleChoiceQuestions[currentMCIndex];
            mcQuestion.textContent = currentQuestion.question;
            mcOptions.innerHTML = "";
            
            const shuffledOptions = [...currentQuestion.options];
            shuffleArray(shuffledOptions);
            
            const newCorrectIndex = shuffledOptions.indexOf(currentQuestion.options[currentQuestion.answer]);
            
            shuffledOptions.forEach((option, index) => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.margin = '10px 0';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'mc-option';
                input.value = index;
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(' ' + option));
                mcOptions.appendChild(label);
            });
            
            mcOptions.dataset.correctAnswer = newCorrectIndex;
            submitMCBtn.disabled = false;
        }, 1000);
    }

    submitMCBtn.addEventListener("click", () => {
        if (submitMCBtn.disabled) return;
        submitMCBtn.disabled = true;

        const selectedOption = document.querySelector('input[name="mc-option"]:checked');
        if (selectedOption) {
            const userAnswer = parseInt(selectedOption.value);
            const correctAnswer = parseInt(mcOptions.dataset.correctAnswer);
            
            if (userAnswer === correctAnswer) {
                mcFeedback.textContent = "Correct!";
                mcFeedback.className = "feedback correct";
                score.multipleChoice++;
            } else {
                mcFeedback.textContent = `Incorrect. The correct answer is: ${multipleChoiceQuestions[currentMCIndex].options[multipleChoiceQuestions[currentMCIndex].answer]}`;
                mcFeedback.className = "feedback incorrect";
            }
            
            totalQuestionsAnswered++;
            updateScoreDisplay();
            
            currentMCIndex++;
            if (currentMCIndex < multipleChoiceQuestions.length) {
                setTimeout(() => {
                    mcFeedback.className = "feedback";
                    mcFeedback.textContent = "";
                    showMultipleChoiceQuestion();
                }, 2000);
            } else {
                setTimeout(() => {
                    // Clear all previous content first
                    mcQuestion.textContent = "";
                    mcOptions.innerHTML = "";
                    
                    const secPlusScore = calculateSecurityPlusScore();
                    const isPassing = secPlusScore >= 750;
                    mcFeedback.className = `feedback ${isPassing ? 'correct' : 'incorrect'}`;
                    mcFeedback.innerHTML = `
                        <h3>Practice Test Complete!</h3>
                        
                        <p>Your Results:</p>
                        <ul style="list-style: none; padding: 0;">
                            <li>Score: ${calculateScore()}%</li>
                            <li>Security+ Score: ${secPlusScore}/900</li>
                            <li>Total Correct: ${score.multipleChoice} out of ${multipleChoiceQuestions.length}</li>
                        </ul>
                        
                        <h4>Real Exam Requirements:</h4>
                        <ul style="list-style: none; padding: 0;">
                            <li>90 minute time limit</li>
                            <li>Up to 90 total questions</li>
                            <li>Includes PBQs and simulations</li>
                            <li>Need 750/900 (83.33%) to pass</li>
                        </ul>
            
                        <h4>Status: ${isPassing ? 
                            '<span style="color: #4ecca3">✓ PASSING</span>' : 
                            '<span style="color: #e94560">× NOT YET PASSING</span>'}</h4>
                        
                        <p style="margin-top: 15px">${isPassing ? 
                            'Great work! You\'re meeting the passing requirement.' : 
                            'Keep practicing! You need 83.33% to pass the real exam.'}</p>
                    `;
                    submitMCBtn.style.display = "none";
                    
                    // Optional: Hide the section header too
                    document.querySelector('#multiple-choice-section h2').style.display = 'none';
                }, 2000);
            }
        } else {
            mcFeedback.textContent = "Please select an option.";
            mcFeedback.className = "feedback";
            submitMCBtn.disabled = false;
        }
    });

    // Initialize first flashcard
    showFlashcardContent();
}

// Fetch questions from JSON file
fetch('questions.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Loaded data:', data); // Debug log
        flashcards = shuffleArray(data.flashcards || []);
        multipleChoiceQuestions = shuffleArray(data.multipleChoiceQuestions || []);
        console.log('Processed questions:', { flashcards, multipleChoiceQuestions }); // Debug log
        initializeApp();
        updateScoreDisplay();
    })
    .catch(error => {
        console.error('Error loading questions:', error);
        document.body.innerHTML += `<div style="color: red; padding: 20px;">Error loading questions: ${error.message}</div>`;
    });