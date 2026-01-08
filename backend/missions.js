// Mission validation logic
const missions = {
    1: {
        chapter: 1,
        title: "The Diagnosis",
        mission: 1,
        objective: "Show every character in the database. I want a full list.",
        validate: (results) => {
            return results.length === 7;
        }
    },
    2: {
        chapter: 1,
        title: "The Diagnosis",
        mission: 2,
        objective: "Find all characters who are male. I need to know who the men are.",
        validate: (results) => {
            return results.length === 5 && results.every(r => r.Gender === 'Male');
        }
    },
    3: {
        chapter: 1,
        title: "The Diagnosis",
        mission: 3,
        objective: "List all characters sorted by their last name alphabetically.",
        validate: (results) => {
            const lastNames = results.map(r => r.LastName);
            const sorted = [...lastNames].sort();
            return JSON.stringify(lastNames) === JSON.stringify(sorted) && results.length === 7;
        }
    },
    4: {
        chapter: 2,
        title: "The First Cook",
        mission: 1,
        objective: "Show me all characters who appeared in the pilot episode.",
        validate: (results) => {
            return results.length === 4;
        }
    },
    5: {
        chapter: 2,
        title: "The First Cook",
        mission: 2,
        objective: "Find all episodes where Walter White had a main role.",
        validate: (results) => {
            return results.length === 7;
        }
    },
    6: {
        chapter: 2,
        title: "The First Cook",
        mission: 3,
        objective: "Count how many times each character appeared in episodes.",
        validate: (results) => {
            const walterCount = results.find(r => r.FirstName === 'Walter');
            return walterCount && walterCount.AppearanceCount === 7;
        }
    },
    7: {
        chapter: 2,
        title: "The First Cook",
        mission: 4,
        objective: "Show all characters who are associated with the Desert location.",
        validate: (results) => {
            return results.length === 2;
        }
    },
    8: {
        chapter: 3,
        title: "The Basement Standoff",
        mission: 1,
        objective: "Find all characters who are involved with Methamphetamine.",
        validate: (results) => {
            return results.length === 3;
        }
    },
    9: {
        chapter: 3,
        title: "The Basement Standoff",
        mission: 2,
        objective: "List all episodes that aired in Season 1 after February 1, 2008.",
        validate: (results) => {
            return results.length === 6;
        }
    },
    10: {
        chapter: 3,
        title: "The Basement Standoff",
        mission: 3,
        objective: "Find characters who appeared in more than 5 episodes.",
        validate: (results) => {
            return results.length === 2;
        }
    },
    11: {
        chapter: 3,
        title: "The Basement Standoff",
        mission: 4,
        objective: "Show all locations where Walter White has been.",
        validate: (results) => {
            return results.length === 2;
        }
    },
    12: {
        chapter: 4,
        title: "Breaking Bad",
        mission: 1,
        objective: "Delete all events that occurred before February 1, 2008.",
        validate: (results) => {
            // For DELETE queries, we check affected rows via separate query
            return true; // Will be validated by checking remaining rows
        }
    },
    13: {
        chapter: 4,
        title: "Breaking Bad",
        mission: 2,
        objective: "Update Jesse Pinkman's occupation to 'Partner'.",
        validate: (results) => {
            return true; // Will be validated by checking the updated value
        }
    },
    14: {
        chapter: 4,
        title: "Breaking Bad",
        mission: 3,
        objective: "Count how many episodes each character appeared in, including those who never appeared (use LEFT JOIN).",
        validate: (results) => {
            return results.length === 7;
        }
    }
};

function validateMission(missionId, results) {
    const mission = missions[missionId];
    if (!mission) {
        return { valid: false, message: "Invalid mission ID" };
    }

    try {
        const isValid = mission.validate(results);
        return {
            valid: isValid,
            mission: mission,
            message: isValid ? "Mission complete!" : "Not quite right. Try again."
        };
    } catch (error) {
        return {
            valid: false,
            mission: mission,
            message: "Query error or incorrect result format."
        };
    }
}

function getMissionInfo(missionId) {
    return missions[missionId] || null;
}

function getAllMissions() {
    return Object.values(missions);
}

module.exports = {
    validateMission,
    getMissionInfo,
    getAllMissions
};
