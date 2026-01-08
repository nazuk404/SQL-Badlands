const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, executeQuery } = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Initialize database on server start
let dbReady = false;

initializeDatabase()
    .then(() => {
        dbReady = true;
        console.log('🎮 SQL Badlands server ready!');
    })
    .catch((error) => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });

// Chapter data matching the game structure
const chapters = {
    1: {
        title: "The Diagnosis",
        narration: "You work for Saul Goodman, a criminal defense attorney. A high school chemistry teacher named Walter White has just been diagnosed with lung cancer. Something is about to change in this city.",
        missionCount: 3,
        missions: [
            { text: "Show every character in the database. I want a full list." },
            { text: "Find all characters who are male. I need to know who the men are." },
            { text: "List all characters sorted by their last name alphabetically." }
        ]
    },
    2: {
        title: "The First Cook",
        narration: "Walter has partnered with Jesse Pinkman. They are cooking methamphetamine in an RV in the desert. You need to track their activities and connections.",
        missionCount: 4,
        missions: [
            { text: "Show me all characters who appeared in the pilot episode." },
            { text: "Find all episodes where Walter White had a main role." },
            { text: "Count how many times each character appeared in episodes." },
            { text: "Show all characters who are associated with the Desert location." }
        ]
    },
    3: {
        title: "The Basement Standoff",
        narration: "Things are getting dangerous. Walter has Krazy-8 chained in Jesse's basement. You need to analyze the drug operations and character relationships.",
        missionCount: 4,
        missions: [
            { text: "Find all characters who are involved with Methamphetamine." },
            { text: "List all episodes that aired in Season 1 after February 1, 2008." },
            { text: "Find characters who appeared in more than 5 episodes." },
            { text: "Show all locations where Walter White has been." }
        ]
    },
    4: {
        title: "Breaking Bad",
        narration: "Walter has fully embraced his Heisenberg persona. The operation is expanding. You need to clean up the database and update records.",
        missionCount: 3,
        missions: [
            { text: "Delete all events that occurred before February 1, 2008." },
            { text: "Update Jesse Pinkman's occupation to 'Partner'." },
            { text: "Count how many episodes each character appeared in, including those who never appeared (use LEFT JOIN)." }
        ]
    }
};

// Mission validation logic
const missionValidators = {
    1: { chapter: 1, mission: 1, validate: (results) => results.length === 7 },
    2: { chapter: 1, mission: 2, validate: (results) => results.length === 5 && results.every(r => r.Gender === 'Male') },
    3: {
        chapter: 1, mission: 3, validate: (results) => {
            const lastNames = results.map(r => r.LastName);
            const sorted = [...lastNames].sort();
            return JSON.stringify(lastNames) === JSON.stringify(sorted) && results.length === 7;
        }
    },
    4: { chapter: 2, mission: 1, validate: (results) => results.length === 4 },
    5: { chapter: 2, mission: 2, validate: (results) => results.length === 7 },
    6: {
        chapter: 2, mission: 3, validate: (results) => {
            const walterCount = results.find(r => r.FirstName === 'Walter');
            return walterCount && walterCount.AppearanceCount === 7;
        }
    },
    7: { chapter: 2, mission: 4, validate: (results) => results.length === 2 },
    8: { chapter: 3, mission: 1, validate: (results) => results.length === 3 },
    9: { chapter: 3, mission: 2, validate: (results) => results.length === 6 },
    10: { chapter: 3, mission: 3, validate: (results) => results.length === 2 },
    11: { chapter: 3, mission: 4, validate: (results) => results.length === 2 },
    12: { chapter: 4, mission: 1, validate: (results) => true },
    13: { chapter: 4, mission: 2, validate: (results) => true },
    14: { chapter: 4, mission: 3, validate: (results) => results.length === 7 }
};

function getMissionId(chapter, mission) {
    const missionCounts = [3, 4, 4, 3];
    let id = 0;
    for (let i = 0; i < chapter - 1; i++) {
        id += missionCounts[i];
    }
    return id + mission;
}

// API: Get chapter data
app.get('/api/chapter/:id', (req, res) => {
    const chapterId = parseInt(req.params.id);
    const chapter = chapters[chapterId];

    if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
});

// API: Run query (for SELECT queries)
app.post('/api/run-query', async (req, res) => {
    try {
        const { query, chapter, mission } = req.body;

        if (!query) {
            return res.status(400).json({ ok: false, message: 'No query provided' });
        }

        // Execute query
        const results = await executeQuery(query);

        // Get mission ID and validate
        const missionId = getMissionId(chapter, mission);
        const validator = missionValidators[missionId];

        if (!validator) {
            return res.json({
                ok: true,
                rows: results,
                columns: results.length > 0 ? Object.keys(results[0]) : [],
                correct: false,
                message: 'Query executed, but no validation available for this mission.'
            });
        }

        const isCorrect = validator.validate(results);

        const storyProgressions = {
            1: "Good work. Now we know who we're dealing with.",
            2: "Excellent. The male characters are the key players in this operation.",
            3: "Perfect. An organized list is essential for tracking our targets.",
            4: "Well done. These are the main characters in the pilot episode.",
            5: "Impressive. Walter White is in every episode of Season 1.",
            6: "Great job. This shows how active each character is in the series.",
            7: "Excellent. The desert is where the cooking happens.",
            8: "Good. These are the key players in the meth operation.",
            9: "Perfect. Most of Season 1 aired after February 1st.",
            10: "Well done. Walter and Jesse are the most active characters.",
            11: "Great work. Walter's been to the White Residence and the Desert.",
            12: "Command executed. The early events have been removed.",
            13: "Update successful. Jesse is now officially a partner.",
            14: "Perfect! You've mastered SQL. Congratulations on completing all missions!"
        };

        res.json({
            ok: true,
            rows: results,
            columns: results.length > 0 ? Object.keys(results[0]) : [],
            correct: isCorrect,
            message: isCorrect ? 'Correct! Mission complete.' : 'Not quite right. Check your query and try again.',
            storyProgression: isCorrect ? storyProgressions[missionId] : null
        });

    } catch (error) {
        res.json({
            ok: false,
            message: error.message || 'Query execution failed'
        });
    }
});

// API: Run command (for UPDATE/DELETE queries)
app.post('/api/run-command', async (req, res) => {
    try {
        const { query, chapter, mission } = req.body;

        if (!query) {
            return res.status(400).json({ ok: false, message: 'No query provided' });
        }

        // Execute command
        const result = await executeQuery(query);

        // Get affected rows
        const affectedRows = result.affectedRows || 0;

        // Get mission ID
        const missionId = getMissionId(chapter, mission);

        // For DELETE and UPDATE, we consider them correct if they execute without error
        const isCorrect = true;

        const storyProgressions = {
            12: "Command executed. The early events have been removed from the database.",
            13: "Update successful. Jesse Pinkman is now officially a partner in the operation.",
            14: "Perfect! You've completed all missions. Congratulations!"
        };

        res.json({
            ok: true,
            affectedRows: affectedRows,
            correct: isCorrect,
            message: 'Command executed successfully.',
            storyProgression: storyProgressions[missionId]
        });

    } catch (error) {
        res.json({
            ok: false,
            message: error.message || 'Command execution failed'
        });
    }
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🎮 SQL Badlands: The First Cook 🎮              ║
║                                                           ║
║  Server running on: http://localhost:${PORT}                ║
║                                                           ║
║  📚 Ready to learn SQL through Breaking Bad!              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down SQL Badlands server...');
    process.exit(0);
});
