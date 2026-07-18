// ===== GLOBAL STATE =====
let currentSection = 'dashboard';
let timerInterval = null;
let timeRemaining = 25 * 60;
let isRunning = false;
let isBreak = false;
let sessionsCompleted = 0;
let flashcards = [];
let currentCardIndex = 0;
let calendarEvents = {};
let exams = [];
let studySessions = [];

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    renderCalendar();
    loadFromLocalStorage();
}

// ===== NAVIGATION =====
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section).classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    currentSection = section;
}

// ===== POMODORO TIMER =====
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            completePhase();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function resetTimer() {
    pauseTimer();
    const focusTime = parseInt(document.getElementById('focusTime').value) || 25;
    timeRemaining = focusTime * 60;
    isBreak = false;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update progress ring
    const focusTime = parseInt(document.getElementById('focusTime').value) || 25;
    const breakTime = parseInt(document.getElementById('breakTime').value) || 5;
    const totalTime = isBreak ? breakTime * 60 : focusTime * 60;
    const progress = ((totalTime - timeRemaining) / totalTime) * 565;
    document.querySelector('.progress-ring-circle').style.strokeDashoffset = 565 - progress;
}

function completePhase() {
    pauseTimer();
    
    if (!isBreak) {
        sessionsCompleted++;
        document.getElementById('sessionsCount').textContent = sessionsCompleted;
        
        // Long break after 4 sessions
        if (sessionsCompleted % 4 === 0) {
            const longBreakTime = parseInt(document.getElementById('longBreakTime').value) || 15;
            timeRemaining = longBreakTime * 60;
            showNotification('Great work! Time for a long break 🌟');
        } else {
            const breakTime = parseInt(document.getElementById('breakTime').value) || 5;
            timeRemaining = breakTime * 60;
            showNotification('Focus session complete! Take a break 🎉');
        }
        isBreak = true;
        document.getElementById('timerPhase').textContent = 'Break';
    } else {
        const focusTime = parseInt(document.getElementById('focusTime').value) || 25;
        timeRemaining = focusTime * 60;
        isBreak = false;
        document.getElementById('timerPhase').textContent = 'Focus';
        showNotification('Break over! Ready to focus? 💪');
    }
    
    updateTimerDisplay();
    document.getElementById('startBtn').disabled = false;
}

// ===== FLASHCARDS =====
function addFlashcard() {
    const front = document.getElementById('cardFront').value.trim();
    const back = document.getElementById('cardBack').value.trim();
    const category = document.getElementById('cardCategory').value.trim() || 'General';
    
    if (!front || !back) {
        showNotification('Please fill in both front and back! 📋');
        return;
    }
    
    const card = { front, back, category, id: Date.now() };
    flashcards.push(card);
    
    // Clear inputs
    document.getElementById('cardFront').value = '';
    document.getElementById('cardBack').value = '';
    document.getElementById('cardCategory').value = '';
    
    renderFlashcards();
    saveToLocalStorage();
    showNotification('Card added! 🎴');
}

function renderFlashcards() {
    const stack = document.getElementById('flashcardStack');
    stack.innerHTML = '';
    
    if (flashcards.length === 0) {
        stack.innerHTML = `
            <div class="flashcard" onclick="flipCard(this)">
                <div class="flashcard-inner">
                    <div class="flashcard-front"><p>Click to create your first card!</p></div>
                    <div class="flashcard-back"><p>Study Bloom awaits your knowledge</p></div>
                </div>
            </div>
        `;
        document.getElementById('cardCounter').textContent = '0/0';
        return;
    }
    
    const card = flashcards[currentCardIndex];
    const cardEl = document.createElement('div');
    cardEl.className = 'flashcard';
    cardEl.onclick = () => flipCard(cardEl);
    cardEl.innerHTML = `
        <div class="flashcard-inner">
            <div class="flashcard-front"><p>${card.front}</p></div>
            <div class="flashcard-back"><p>${card.back}</p></div>
        </div>
    `;
    stack.appendChild(cardEl);
    
    document.getElementById('cardCounter').textContent = `${currentCardIndex + 1}/${flashcards.length}`;
    
    // Update decks list
    updateDecksList();
}

function flipCard(element) {
    element.classList.toggle('flipped');
}

function nextCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    renderFlashcards();
}

function previousCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    renderFlashcards();
}

function updateDecksList() {
    const decks = {};
    flashcards.forEach(card => {
        if (!decks[card.category]) decks[card.category] = 0;
        decks[card.category]++;
    });
    
    const decksList = document.getElementById('decksList');
    if (Object.keys(decks).length === 0) {
        decksList.innerHTML = '<p class="empty-state">No decks yet. Create your first card! 🌸</p>';
        return;
    }
    
    decksList.innerHTML = Object.entries(decks).map(([category, count]) => 
        `<div class="deck-item">📚 ${category} <small>(${count} cards)</small></div>`
    ).join('');
}

// ===== AI NOTES MAKER =====
function processNotes() {
    const rawNotes = document.getElementById('rawNotes').value.trim();
    
    if (!rawNotes) {
        showNotification('Please paste some notes first! 📝');
        return;
    }
    
    const summarize = document.getElementById('summarize').checked;
    const highlight = document.getElementById('highlight').checked;
    const createQuestions = document.getElementById('createQuestions').checked;
    
    let output = '<h4>📖 Processed Notes</h4>';
    
    // Simulate AI processing
    if (summarize) {
        const sentences = rawNotes.split('.').filter(s => s.trim());
        const summary = sentences.slice(0, Math.ceil(sentences.length / 3)).join('.');
        output += `<p><strong>Summary:</strong>${summary}...</p>`;
    }
    
    if (highlight) {
        const words = rawNotes.split(' ');
        const important = words.filter((w, i) => i % 5 === 0).slice(0, 10).join(', ');
        output += `<p><strong>Key Terms:</strong> ${important}...</p>`;
    }
    
    if (createQuestions) {
        output += `<p><strong>Practice Questions:</strong></p>
                   <p>1. What are the main points discussed?</p>
                   <p>2. How do these concepts relate to previous topics?</p>
                   <p>3. What examples were provided?</p>`;
    }
    
    document.getElementById('notesOutput').innerHTML = output;
    document.getElementById('downloadBtn').style.display = 'inline-block';
    document.getElementById('copyBtn').style.display = 'inline-block';
    showNotification('Notes transformed! ✨');
}

function downloadNotes() {
    const content = document.getElementById('notesOutput').innerText;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'study-notes.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('Notes downloaded! 📥');
}

function copyNotes() {
    const content = document.getElementById('notesOutput').innerText;
    navigator.clipboard.writeText(content);
    showNotification('Copied to clipboard! 📋');
}

// ===== STUDY TRACKER =====
function logSession() {
    const subject = document.getElementById('subject').value.trim();
    const duration = parseInt(document.getElementById('duration').value);
    const topic = document.getElementById('topic').value.trim();
    const difficulty = document.getElementById('difficulty').value;
    
    if (!subject || !duration) {
        showNotification('Please fill in subject and duration! 📊');
        return;
    }
    
    const session = {
        subject,
        topic,
        duration,
        difficulty,
        date: new Date().toLocaleString(),
        id: Date.now()
    };
    
    studySessions.push(session);
    
    // Clear form
    document.getElementById('subject').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('topic').value = '';
    
    renderSessions();
    saveToLocalStorage();
    showNotification(`Session logged! ${duration} minutes 📈`);
}

function renderSessions() {
    const sessionsList = document.getElementById('sessionsList');
    if (studySessions.length === 0) {
        sessionsList.innerHTML = '<p class="empty-state">No sessions logged yet. Start studying! 🚀</p>';
        return;
    }
    
    sessionsList.innerHTML = studySessions.reverse().slice(0, 10).map(session => `
        <div class="session-item">
            <div class="session-info-item">
                <strong>${session.subject}</strong>
                <small>${session.topic} • ${session.difficulty}</small>
            </div>
            <div class="session-duration">${session.duration} min</div>
        </div>
    `).join('');
}

// ===== CALENDAR =====
function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarDays.appendChild(emptyCell);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Check if today
        if (day === now.getDate() && month === now.getMonth()) {
            dayEl.classList.add('today');
        }
        
        // Check for events
        const dateKey = `${year}-${month}-${day}`;
        if (calendarEvents[dateKey]) {
            dayEl.classList.add('event');
        }
        
        dayEl.addEventListener('click', () => selectDate(day, month, year));
        calendarDays.appendChild(dayEl);
    }
}

function selectDate(day, month, year) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    document.getElementById('eventDate').value = dateStr;
}

function previousMonth() {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    renderCalendar();
}

function addEvent() {
    const dateStr = document.getElementById('eventDate').value;
    const eventName = document.getElementById('eventName').value.trim();
    
    if (!dateStr || !eventName) {
        showNotification('Please fill in date and event! 📅');
        return;
    }
    
    calendarEvents[dateStr] = eventName;
    document.getElementById('eventName').value = '';
    renderCalendar();
    saveToLocalStorage();
    showNotification('Event added! 📌');
}

// ===== EXAMS TRACKER =====
function addExam() {
    const subject = document.getElementById('examSubject').value.trim();
    const dateTime = document.getElementById('examDateTime').value;
    const duration = parseInt(document.getElementById('examDuration').value) || 120;
    const topics = document.getElementById('examTopics').value.trim();
    const prepProgress = parseInt(document.getElementById('prepProgress').value) || 0;
    
    if (!subject || !dateTime) {
        showNotification('Please fill in subject and date/time! 📝');
        return;
    }
    
    const exam = {
        subject,
        dateTime,
        duration,
        topics,
        prepProgress,
        id: Date.now()
    };
    
    exams.push(exam);
    
    // Clear form
    document.getElementById('examSubject').value = '';
    document.getElementById('examDateTime').value = '';
    document.getElementById('examTopics').value = '';
    document.getElementById('prepProgress').value = '0';
    document.getElementById('prepPercent').textContent = '0%';
    
    renderExams();
    saveToLocalStorage();
    showNotification('Exam added! ✏️');
}

function renderExams() {
    const examsList = document.getElementById('examsList');
    if (exams.length === 0) {
        examsList.innerHTML = '<p class="empty-state">No exams scheduled yet. Add your first exam! 📚</p>';
        return;
    }
    
    examsList.innerHTML = exams.map(exam => {
        const examDate = new Date(exam.dateTime);
        return `
            <div class="exam-card">
                <h4>${exam.subject}</h4>
                <p>📅 ${examDate.toLocaleDateString()} at ${examDate.toLocaleTimeString()}</p>
                <p>⏱️ Duration: ${exam.duration} minutes</p>
                ${exam.topics ? `<p>📚 Topics: ${exam.topics}</p>` : ''}
                <div class="exam-progress">
                    <div class="exam-progress-bar">
                        <div class="exam-progress-fill" style="width: ${exam.prepProgress}%"></div>
                    </div>
                    <p style="font-size: 12px; margin-top: 5px;">${exam.prepProgress}% prepared</p>
                </div>
            </div>
        `;
    }).join('');
}

// ===== UTILITIES =====
function showNotification(message) {
    // Simple notification (can be enhanced with toast library)
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FFB3D9 0%, #E6D4F5 100%);
        color: #5A4A6F;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(138, 123, 168, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

function saveToLocalStorage() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('exams', JSON.stringify(exams));
    localStorage.setItem('studySessions', JSON.stringify(studySessions));
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
    localStorage.setItem('sessionsCompleted', sessionsCompleted);
}

function loadFromLocalStorage() {
    flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    exams = JSON.parse(localStorage.getItem('exams')) || [];
    studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
    calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    sessionsCompleted = parseInt(localStorage.getItem('sessionsCompleted')) || 0;
    
    renderFlashcards();
    renderExams();
    renderSessions();
    document.getElementById('sessionsCount').textContent = sessionsCompleted;
}

// Update prep progress display
document.addEventListener('DOMContentLoaded', () => {
    const prepProgress = document.getElementById('prepProgress');
    if (prepProgress) {
        prepProgress.addEventListener('input', (e) => {
            document.getElementById('prepPercent').textContent = e.target.value + '%';
        });
    }
});
