// SQL Badlands: The First Cook - Game Logic

// Game State
const gameState = {
    currentChapter: 1,
    currentMission: 1,
    totalChapters: 4,
    chapterData: null,
    completedMissions: {}, // Track completed missions: {chapterNum: [missionIds]}
    queryHistory: [] // Store query history
};

// DOM Elements
const elements = {
    chapterIndicator: document.getElementById('chapter-indicator'),
    missionIndicator: document.getElementById('mission-indicator'),
    chapterTitle: document.getElementById('chapter-title'),
    chapterNarration: document.getElementById('chapter-narration'),
    missionText: document.getElementById('mission-text'),
    sqlInput: document.getElementById('sql-input'),
    runBtn: document.getElementById('run-btn'),
    clearBtn: document.getElementById('clear-btn'),
    nextBtn: document.getElementById('next-btn'),
    feedback: document.getElementById('feedback'),
    navigation: document.getElementById('navigation'),
    resultsContainer: document.getElementById('results-container'),
    // New elements
    missionSelectorBtn: document.getElementById('mission-selector-btn'),
    schemaBtn: document.getElementById('schema-btn'),
    historyBtn: document.getElementById('history-btn'),
    missionSelectorModal: document.getElementById('mission-selector-modal'),
    schemaModal: document.getElementById('schema-modal'),
    historyModal: document.getElementById('history-modal'),
    closeMissionSelector: document.getElementById('close-mission-selector'),
    closeSchema: document.getElementById('close-schema'),
    closeHistory: document.getElementById('close-history'),
    missionSelectorBody: document.getElementById('mission-selector-body'),
    historyBody: document.getElementById('history-body'),
    // Certificate elements
    badgeBtn: document.getElementById('badge-btn'),
    certificateModal: document.getElementById('certificate-modal'),
    closeCertificate: document.getElementById('close-certificate'),
    downloadCertificate: document.getElementById('download-certificate'),
    shareCertificate: document.getElementById('share-certificate')
};

// Initialize game
async function initGame() {
    // loadProgress(); // Disabled - game always starts fresh
    await loadChapter(gameState.currentChapter);
    updateUI();
    attachEventListeners();
}

// Load chapter data from server
async function loadChapter(chapterId) {
    try {
        const response = await fetch(`/api/chapter/${chapterId}`);
        const data = await response.json();
        gameState.chapterData = data;
    } catch (error) {
        console.error('Error loading chapter:', error);
        showFeedback('Error loading chapter data. Please refresh the page.', 'error');
    }
}

// Update UI with current game state
function updateUI() {
    if (!gameState.chapterData) return;

    // Update progress indicators
    elements.chapterIndicator.textContent = `Chapter ${gameState.currentChapter}`;
    elements.missionIndicator.textContent = `Mission ${gameState.currentMission} of ${gameState.chapterData.missionCount}`;

    // Update chapter info
    elements.chapterTitle.textContent = gameState.chapterData.title;
    elements.chapterNarration.textContent = gameState.chapterData.narration;

    // Update mission text
    const mission = gameState.chapterData.missions[gameState.currentMission - 1];
    if (mission) {
        elements.missionText.textContent = mission.text;
    }

    // Hide feedback and navigation
    elements.feedback.classList.add('hidden');
    elements.navigation.classList.add('hidden');

    // Clear SQL input
    elements.sqlInput.value = '';
    elements.sqlInput.focus();

    // Update badge button visibility
    updateBadgeButton();
}

// Attach event listeners
function attachEventListeners() {
    elements.runBtn.addEventListener('click', runQuery);
    elements.clearBtn.addEventListener('click', clearConsole);
    elements.nextBtn.addEventListener('click', nextMission);

    // Modal buttons
    elements.missionSelectorBtn.addEventListener('click', openMissionSelector);
    elements.schemaBtn.addEventListener('click', openSchema);
    elements.historyBtn.addEventListener('click', openHistory);

    // Close buttons
    elements.closeMissionSelector.addEventListener('click', () => closeModal(elements.missionSelectorModal));
    elements.closeSchema.addEventListener('click', () => closeModal(elements.schemaModal));
    elements.closeHistory.addEventListener('click', () => closeModal(elements.historyModal));

    // Certificate buttons
    elements.badgeBtn.addEventListener('click', openCertificate);
    elements.closeCertificate.addEventListener('click', () => closeModal(elements.certificateModal));
    elements.downloadCertificate.addEventListener('click', downloadCertificate);
    elements.shareCertificate.addEventListener('click', shareCertificateCode);

    // Close modals on background click
    [elements.missionSelectorModal, elements.schemaModal, elements.historyModal, elements.certificateModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Allow Ctrl+Enter to run query
    elements.sqlInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            runQuery();
        }
    });
}

// Run SQL query
async function runQuery() {
    const query = elements.sqlInput.value.trim();

    if (!query) {
        showFeedback('Please enter an SQL query.', 'error');
        return;
    }

    // Disable run button
    elements.runBtn.disabled = true;
    elements.runBtn.textContent = 'Running...';

    // Determine if this is a write mission (Chapter 4)
    const isWriteMission = gameState.currentChapter === 4;
    const endpoint = isWriteMission ? '/api/run-command' : '/api/run-query';

    const startTime = Date.now();

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                chapter: gameState.currentChapter,
                mission: gameState.currentMission
            })
        });

        const result = await response.json();
        const executionTime = Date.now() - startTime;

        // Add to query history
        addToHistory(query, result.ok && result.correct, executionTime);

        if (result.ok) {
            // Display results
            if (result.rows) {
                displayResults(result.rows, result.columns);
            } else if (result.affectedRows !== undefined) {
                displayCommandResult(result.affectedRows);
            }

            // Show feedback with story progression if correct
            if (result.correct && result.storyProgression) {
                showFeedbackWithStory(result.message, result.storyProgression);
                // Mark mission as completed
                markMissionCompleted(gameState.currentChapter, gameState.currentMission);
            } else {
                showFeedback(result.message, result.correct ? 'success' : 'error');
            }

            // Show next button if correct
            if (result.correct) {
                elements.navigation.classList.remove('hidden');
            }
        } else {
            showFeedback(result.message, 'error');
            clearResults();
        }
    } catch (error) {
        console.error('Error running query:', error);
        showFeedback('Network error. Please check your connection.', 'error');
        addToHistory(query, false, Date.now() - startTime);
    } finally {
        // Re-enable run button
        elements.runBtn.disabled = false;
        elements.runBtn.textContent = 'Run Query';
    }
}

// Display query results in table
function displayResults(rows, columns) {
    if (!rows || rows.length === 0) {
        elements.resultsContainer.innerHTML = '<p class="placeholder-text">Query returned no results.</p>';
        return;
    }

    let html = '<table class="results-table"><thead><tr>';

    // Table headers
    columns.forEach(col => {
        html += `<th>${escapeHtml(col)}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Table rows
    rows.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            const value = row[col] !== null && row[col] !== undefined ? row[col] : 'NULL';
            html += `<td>${escapeHtml(String(value))}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    html += `<div class="row-count">${rows.length} row${rows.length !== 1 ? 's' : ''} returned</div>`;

    elements.resultsContainer.innerHTML = html;
}

// Display command result (UPDATE/DELETE/INSERT)
function displayCommandResult(affectedRows) {
    elements.resultsContainer.innerHTML = `
    <p class="placeholder-text">
      Command executed successfully. ${affectedRows} row${affectedRows !== 1 ? 's' : ''} affected.
      <br><br>
      Note: Changes are rolled back for training purposes.
    </p>
  `;
}

// Clear results display
function clearResults() {
    elements.resultsContainer.innerHTML = '<p class="placeholder-text">Run a query to see results here.</p>';
}

// Show feedback message
function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type}`;
    elements.feedback.classList.remove('hidden');
}

// Show feedback with story progression
function showFeedbackWithStory(message, storyText) {
    elements.feedback.innerHTML = `
    <div class="feedback-success">${escapeHtml(message)}</div>
    <div class="story-progression">${escapeHtml(storyText)}</div>
  `;
    elements.feedback.className = 'feedback success story';
    elements.feedback.classList.remove('hidden');
}

// Clear console
function clearConsole() {
    elements.sqlInput.value = '';
    elements.feedback.classList.add('hidden');
    elements.navigation.classList.add('hidden');
    clearResults();
    elements.sqlInput.focus();
}

// Move to next mission
async function nextMission() {
    const totalMissions = gameState.chapterData.missionCount;

    if (gameState.currentMission < totalMissions) {
        // Next mission in same chapter
        gameState.currentMission++;
    } else if (gameState.currentChapter < gameState.totalChapters) {
        // Next chapter
        gameState.currentChapter++;
        gameState.currentMission = 1;
        await loadChapter(gameState.currentChapter);
    } else {
        // Game complete
        showGameComplete();
        return;
    }

    // saveProgress(); // Disabled - no progress saving
    updateUI();
    clearResults();
}

// Show game completion message
function showGameComplete() {
    elements.chapterTitle.textContent = 'Congratulations!';
    elements.chapterNarration.textContent = 'You have completed all chapters of SQL Badlands: The First Cook. You have mastered the basics of SQL and helped manage the database through a dangerous journey.';
    elements.missionText.textContent = 'Game Complete! Click the trophy badge to view your certificate.';
    elements.sqlInput.disabled = true;
    elements.runBtn.disabled = true;
    elements.navigation.classList.add('hidden');
    clearResults();

    // Show badge and open certificate
    updateBadgeButton();
    setTimeout(() => {
        openCertificate();
    }, 1000);
}

// Mark mission as completed
function markMissionCompleted(chapter, mission) {
    if (!gameState.completedMissions[chapter]) {
        gameState.completedMissions[chapter] = [];
    }
    if (!gameState.completedMissions[chapter].includes(mission)) {
        gameState.completedMissions[chapter].push(mission);
        // saveProgress(); // Disabled - no progress saving
    }
}

// Check if mission is completed
function isMissionCompleted(chapter, mission) {
    return gameState.completedMissions[chapter] && gameState.completedMissions[chapter].includes(mission);
}

// Check if mission is unlocked
function isMissionUnlocked(chapter, mission) {
    // First mission of first chapter is always unlocked
    if (chapter === 1 && mission === 1) return true;

    // Check if previous mission is completed
    if (mission > 1) {
        return isMissionCompleted(chapter, mission - 1);
    } else {
        // First mission of chapter - check if last mission of previous chapter is completed
        if (chapter > 1) {
            // Get mission count of previous chapter (hardcoded for now)
            const prevChapterMissions = chapter === 2 ? 3 : (chapter === 3 ? 4 : 3);
            return isMissionCompleted(chapter - 1, prevChapterMissions);
        }
    }
    return false;
}

// Add query to history
function addToHistory(query, success, executionTime) {
    gameState.queryHistory.unshift({
        query,
        success,
        executionTime,
        timestamp: new Date().toLocaleString(),
        chapter: gameState.currentChapter,
        mission: gameState.currentMission
    });

    // Keep only last 50 queries
    if (gameState.queryHistory.length > 50) {
        gameState.queryHistory = gameState.queryHistory.slice(0, 50);
    }

    // saveProgress(); // Disabled - no progress saving
}

// Open mission selector modal
async function openMissionSelector() {
    const chapterNames = ['The Diagnosis', 'The First Cook', 'The Basement Standoff', 'Breaking Bad'];
    const missionCounts = [3, 4, 3, 4]; // Missions per chapter

    let html = '';

    for (let chapter = 1; chapter <= 4; chapter++) {
        html += `<div class="chapter-section">`;
        html += `<h3>Chapter ${chapter}: ${chapterNames[chapter - 1]}</h3>`;
        html += `<div class="mission-grid">`;

        for (let mission = 1; mission <= missionCounts[chapter - 1]; mission++) {
            const isCompleted = isMissionCompleted(chapter, mission);
            const isUnlocked = isMissionUnlocked(chapter, mission);
            const isCurrent = chapter === gameState.currentChapter && mission === gameState.currentMission;

            let classes = 'mission-card';
            if (!isUnlocked) classes += ' locked';
            if (isCompleted) classes += ' completed';
            if (isCurrent) classes += ' current';

            const onclick = isUnlocked ? `onclick="jumpToMission(${chapter}, ${mission})"` : '';

            html += `
        <div class="${classes}" ${onclick}>
          <div class="mission-card-title">Mission ${mission}</div>
          <div class="mission-card-desc">${isCompleted ? 'Completed' : (isUnlocked ? (isCurrent ? 'Current' : 'Available') : 'Locked')}</div>
        </div>
      `;
        }

        html += `</div></div>`;
    }

    elements.missionSelectorBody.innerHTML = html;
    elements.missionSelectorModal.classList.remove('hidden');
}

// Jump to specific mission
window.jumpToMission = async function (chapter, mission) {
    gameState.currentChapter = chapter;
    gameState.currentMission = mission;
    await loadChapter(chapter);
    updateUI();
    clearResults();
    // saveProgress(); // Disabled - no progress saving
    closeModal(elements.missionSelectorModal);
};

// Open schema modal
function openSchema() {
    elements.schemaModal.classList.remove('hidden');
}

// Open history modal
function openHistory() {
    // Reload history from localStorage to ensure fresh data
    const saved = localStorage.getItem('sqlBadlandsProgress');
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            gameState.queryHistory = progress.queryHistory || [];
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    if (gameState.queryHistory.length === 0) {
        elements.historyBody.innerHTML = '<p class="placeholder-text">No queries run yet.</p>';
    } else {
        let html = '';
        gameState.queryHistory.forEach((item, index) => {
            html += `
        <div class="history-item">
          <div class="history-item-header">
            <span>Ch${item.chapter} M${item.mission} • ${item.timestamp}</span>
            <span>${item.executionTime}ms</span>
          </div>
          <div class="history-query">${escapeHtml(item.query)}</div>
          <span class="history-status ${item.success ? 'success' : 'error'}">
            ${item.success ? '✓ Success' : '✗ Failed'}
          </span>
        </div>
      `;
        });
        elements.historyBody.innerHTML = html;
    }
    elements.historyModal.classList.remove('hidden');
}

// Close modal
function closeModal(modal) {
    modal.classList.add('hidden');
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('sqlBadlandsProgress', JSON.stringify({
        chapter: gameState.currentChapter,
        mission: gameState.currentMission,
        completedMissions: gameState.completedMissions,
        queryHistory: gameState.queryHistory
    }));
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('sqlBadlandsProgress');
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            gameState.currentChapter = progress.chapter || 1;
            gameState.currentMission = progress.mission || 1;
            gameState.completedMissions = progress.completedMissions || {};
            gameState.queryHistory = progress.queryHistory || [];
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
}

// Check if all missions are completed
function checkCertificateUnlocked() {
    // Total missions: Ch1=3, Ch2=4, Ch3=3, Ch4=4 = 14 total
    const totalMissionsPerChapter = [3, 4, 3, 4];

    for (let chapter = 1; chapter <= 4; chapter++) {
        const completedInChapter = gameState.completedMissions[chapter] || [];
        if (completedInChapter.length < totalMissionsPerChapter[chapter - 1]) {
            return false;
        }
    }
    return true;
}

// Update badge button visibility
function updateBadgeButton() {
    if (checkCertificateUnlocked()) {
        elements.badgeBtn.classList.remove('hidden');
        elements.badgeBtn.classList.add('unlocked');
    } else {
        elements.badgeBtn.classList.add('hidden');
        elements.badgeBtn.classList.remove('unlocked');
    }
}

// Generate achievement code
function generateAchievementCode() {
    const totalQueries = gameState.queryHistory.length;
    const timestamp = Date.now();
    const hash = (timestamp + totalQueries).toString(36).toUpperCase();
    return `SQL-${hash.slice(-8)}`;
}

// Open certificate modal
function openCertificate() {
    if (!checkCertificateUnlocked()) {
        return;
    }

    // Update certificate data
    const totalQueries = gameState.queryHistory.length;
    const achievementCode = generateAchievementCode();
    const completionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('cert-total-queries').textContent = totalQueries;
    document.getElementById('certificate-date').textContent = `Completed: ${completionDate}`;
    document.getElementById('certificate-code').textContent = achievementCode;

    elements.certificateModal.classList.remove('hidden');
}

// Download certificate as image
async function downloadCertificate() {
    try {
        // Use html2canvas library if available, otherwise show message
        if (typeof html2canvas === 'undefined') {
            // Fallback: Create a simple text file with certificate info
            const certificateText = `
SQL BADLANDS: THE FIRST COOK
CERTIFICATE OF COMPLETION

This certifies that SQL MASTER has successfully completed
all missions and demonstrated mastery of SQL fundamentals
through the dangerous journey of SQL Badlands.

Queries Executed: ${document.getElementById('cert-total-queries').textContent}
Missions Completed: 14
Chapters Mastered: 4

${document.getElementById('certificate-date').textContent}
Achievement Code: ${document.getElementById('certificate-code').textContent}
            `.trim();

            const blob = new Blob([certificateText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'SQL_Badlands_Certificate.txt';
            a.click();
            URL.revokeObjectURL(url);

            alert('Certificate downloaded as text file! For a full image version, consider taking a screenshot.');
        }
    } catch (error) {
        console.error('Error downloading certificate:', error);
        alert('Please take a screenshot of your certificate to save it!');
    }
}

// Share certificate code
function shareCertificateCode() {
    const code = document.getElementById('certificate-code').textContent;
    const shareText = `I completed SQL Badlands: The First Cook! 🏆\nAchievement Code: ${code}`;

    // Try to use clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Achievement code copied to clipboard!');
        }).catch(() => {
            fallbackCopyText(shareText);
        });
    } else {
        fallbackCopyText(shareText);
    }
}

// Fallback copy method
function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('Achievement code copied to clipboard!');
    } catch (err) {
        alert('Could not copy text. Please copy manually: ' + text);
    }
    document.body.removeChild(textarea);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
