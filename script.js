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
    
    const existingScore = document.getElementById('score-display');
    if (existingScore) {
        existingScore.remove();
    }
    document.body.appendChild(scoreElement);
}

function initializeApp() {
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
    let remainingFlashcards = [];
    let remainingMCQuestions = [];

    // Initialize question pools
    function resetQuestionPools() {
        remainingFlashcards = [...flashcards];
        remainingMCQuestions = [...multipleChoiceQuestions];
        shuffleArray(remainingMCQuestions);
        currentFlashcardIndex = 0;
    }

    // Modified to handle navigation
    function getNextFlashcard() {
        currentFlashcardIndex = (currentFlashcardIndex + 1) % remainingFlashcards.length;
        return remainingFlashcards[currentFlashcardIndex];
    }

    // Add previous flashcard function
    function getPrevFlashcard() {
        currentFlashcardIndex = (currentFlashcardIndex - 1 + remainingFlashcards.length) % remainingFlashcards.length;
        return remainingFlashcards[currentFlashcardIndex];
    }

    // Modified to work with current index
    function showFlashcardContent(showAnswer = false) {
        const currentCard = remainingFlashcards[currentFlashcardIndex];
        if (showAnswer) {
            flashcardAnswer.textContent = currentCard.answer;
            flashcardQuestion.textContent = "";
            flashcardElement.classList.add("flipped");
        } else {
            flashcardQuestion.textContent = currentCard.question;
            flashcardAnswer.textContent = "";
            flashcardElement.classList.remove("flipped");
        }
    }

    // Create navigation buttons
    const navContainer = document.createElement('div');
    navContainer.className = 'flashcard-nav';
    
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&lt;';
    prevBtn.className = 'nav-btn prev-btn';
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&gt;';
    nextBtn.className = 'nav-btn next-btn';
    
    // Replace the next card button with navigation buttons
    nextCardBtn.parentNode.replaceChild(navContainer, nextCardBtn);
    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);

    // Event Listeners
    flashcardElement.addEventListener("click", () => {
        flashcardElement.classList.toggle("flipped");
        showFlashcardContent(flashcardElement.classList.contains("flipped"));
    });

    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        getPrevFlashcard();
        showFlashcardContent(false);
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        getNextFlashcard();
        showFlashcardContent(false);
    });

    startTestBtn.addEventListener("click", () => {
        document.getElementById("flashcard-section").style.display = "none";
        document.getElementById("multiple-choice-section").style.display = "block";
        resetQuestionPools();
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
            const currentQuestion = getNextMCQuestion();
            if (!currentQuestion) {
                console.error('No question available');
                return;
            }

            // Store the current question in a data attribute as JSON
            mcOptions.dataset.currentQuestion = JSON.stringify(currentQuestion);
            
            mcQuestion.textContent = currentQuestion.question;
            mcOptions.innerHTML = "";
            
            // Create a new array of options with their original indices
            const optionsWithIndices = currentQuestion.options.map((option, index) => ({
                text: option,
                originalIndex: index
            }));
            
            // Shuffle the options while keeping track of their original indices
            shuffleArray(optionsWithIndices);
            
            // Create the radio buttons and store the shuffled order
            optionsWithIndices.forEach((option, index) => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.margin = '10px 0';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'mc-option';
                input.value = option.originalIndex; // Store the original index as the value
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(' ' + option.text));
                mcOptions.appendChild(label);
            });
            
            submitMCBtn.disabled = false;
        }, 1000);
    }

    submitMCBtn.addEventListener("click", () => {
        if (submitMCBtn.disabled) return;
        submitMCBtn.disabled = true;
    
        const selectedOption = document.querySelector('input[name="mc-option"]:checked');
        if (selectedOption) {
            const userAnswer = parseInt(selectedOption.value);
            
            // Retrieve the current question from the data attribute
            const currentQuestion = JSON.parse(mcOptions.dataset.currentQuestion);
            
            if (!currentQuestion) {
                console.error('Question not found');
                return;
            }
    
            const correctAnswer = currentQuestion.answer;
            
            // Always show feedback and correct answer
            if (userAnswer === correctAnswer) {
                mcFeedback.textContent = "Correct!";
                mcFeedback.className = "feedback correct";
                score.multipleChoice++;
            } else {
                // Ensure the correct answer is always shown
                const correctAnswerText = currentQuestion.options[correctAnswer];
                mcFeedback.textContent = `Incorrect. The correct answer is: ${correctAnswerText}`;
                mcFeedback.className = "feedback incorrect";
            }
            
            totalQuestionsAnswered++;
            updateScoreDisplay();
            
            // Add a delay before moving to next question to ensure feedback is visible
            setTimeout(() => {
                if (totalQuestionsAnswered < multipleChoiceQuestions.length) {
                    mcFeedback.className = "feedback";
                    mcFeedback.textContent = "";
                    showMultipleChoiceQuestion();
                } else {
                    showFinalResults();
                }
            }, 2000); // Increased delay to 2 seconds to ensure feedback is visible
        } else {
            mcFeedback.textContent = "Please select an option.";
            mcFeedback.className = "feedback";
            submitMCBtn.disabled = false;
        }
    });

    function showFinalResults() {
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
        document.querySelector('#multiple-choice-section h2').style.display = 'none';
    }

    // Initialize first flashcard
    resetQuestionPools();
    showFlashcardContent();
}

// Function to handle errors
function handleError(error, type) {
    console.error(`Error loading ${type}:`, error);
    document.body.innerHTML += `<div style="color: red; padding: 20px;">Error loading ${type}: ${error.message}</div>`;
}

// Fetch both JSON files
Promise.all([
    fetch('flashcards.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        }),
    fetch('questions.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
])
.then(([loadedFlashcards, loadedQuestions]) => {
    console.log('Loaded flashcards:', loadedFlashcards);
    console.log('Loaded questions:', loadedQuestions);
    
    flashcards = loadedFlashcards || [];
    multipleChoiceQuestions = loadedQuestions || [];
    
    if (flashcards.length === 0) {
        throw new Error('No flashcards loaded');
    }
    if (multipleChoiceQuestions.length === 0) {
        throw new Error('No questions loaded');
    }
    
    initializeApp();
    updateScoreDisplay();
})
.catch(error => {
    handleError(error, 'quiz data');
});
