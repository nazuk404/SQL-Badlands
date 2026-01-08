const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD_HERE',  // ⚠️ CHANGE THIS TO YOUR MYSQL PASSWORD!
    database: 'sql_badlands'
};

// Create a connection pool
let pool;

async function initializeDatabase() {
    try {
        // First, connect without specifying a database to create it if needed
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // Create database if it doesn't exist
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log('✅ Database created or already exists');
        await tempConnection.end();

        // Now create the connection pool with the database
        pool = mysql.createPool(dbConfig);

        // Drop existing tables to ensure fresh start
        await pool.query('DROP TABLE IF EXISTS EventAssociation');
        await pool.query('DROP TABLE IF EXISTS CharacterDrug');
        await pool.query('DROP TABLE IF EXISTS CharacterLocation');
        await pool.query('DROP TABLE IF EXISTS CharacterEpisode');
        await pool.query('DROP TABLE IF EXISTS Events');
        await pool.query('DROP TABLE IF EXISTS Drugs');
        await pool.query('DROP TABLE IF EXISTS Locations');
        await pool.query('DROP TABLE IF EXISTS Episodes');
        await pool.query('DROP TABLE IF EXISTS Characters');

        // Create tables
        await createTables();
        await insertSampleData();

        console.log('✅ Database initialized successfully!');
        return pool;
    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
        throw error;
    }
}

async function createTables() {
    // Characters table
    await pool.query(`
    CREATE TABLE Characters (
      CharacterID INT PRIMARY KEY,
      FirstName VARCHAR(255),
      LastName VARCHAR(255),
      DateOfBirth DATE,
      Gender VARCHAR(10),
      Occupation VARCHAR(255),
      Description TEXT
    )
  `);

    // Episodes table
    await pool.query(`
    CREATE TABLE Episodes (
      EpisodeID INT PRIMARY KEY,
      Title VARCHAR(255),
      Season INT,
      Airdate DATE,
      Description TEXT
    )
  `);

    // Locations table
    await pool.query(`
    CREATE TABLE Locations (
      LocationID INT PRIMARY KEY,
      Name VARCHAR(255),
      Type VARCHAR(255),
      Description TEXT
    )
  `);

    // Drugs table
    await pool.query(`
    CREATE TABLE Drugs (
      DrugID INT PRIMARY KEY,
      Name VARCHAR(255),
      ChemicalFormula VARCHAR(255),
      Description TEXT
    )
  `);

    // Events table
    await pool.query(`
    CREATE TABLE Events (
      EventID INT PRIMARY KEY,
      Date DATE,
      Description TEXT
    )
  `);

    // CharacterEpisode junction table
    await pool.query(`
    CREATE TABLE CharacterEpisode (
      AppearanceID INT PRIMARY KEY,
      CharacterID INT,
      EpisodeID INT,
      Role VARCHAR(50),
      FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
      FOREIGN KEY (EpisodeID) REFERENCES Episodes(EpisodeID)
    )
  `);

    // CharacterLocation junction table
    await pool.query(`
    CREATE TABLE CharacterLocation (
      AssociationID INT PRIMARY KEY,
      CharacterID INT,
      LocationID INT,
      FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
      FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
    )
  `);

    // CharacterDrug junction table
    await pool.query(`
    CREATE TABLE CharacterDrug (
      InvolvementID INT PRIMARY KEY,
      CharacterID INT,
      DrugID INT,
      Role VARCHAR(50),
      FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
      FOREIGN KEY (DrugID) REFERENCES Drugs(DrugID)
    )
  `);

    // EventAssociation junction table
    await pool.query(`
    CREATE TABLE EventAssociation (
      EventAssociationID INT PRIMARY KEY,
      EventID INT,
      CharacterID INT,
      EpisodeID INT,
      FOREIGN KEY (EventID) REFERENCES Events(EventID),
      FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
      FOREIGN KEY (EpisodeID) REFERENCES Episodes(EpisodeID)
    )
  `);

    console.log('✅ Tables created');
}

async function insertSampleData() {
    // Insert Characters
    await pool.query(`
    INSERT INTO Characters (CharacterID, FirstName, LastName, DateOfBirth, Gender, Occupation, Description) VALUES
    (1, 'Walter', 'White', '1958-09-07', 'Male', 'Chemistry Teacher', 'High school chemistry teacher turned methamphetamine manufacturer'),
    (2, 'Jesse', 'Pinkman', '1984-09-24', 'Male', 'Meth Cook', 'Former student and partner in methamphetamine production'),
    (3, 'Skyler', 'White', '1970-08-11', 'Female', 'Accountant', 'Walter White wife and bookkeeper'),
    (4, 'Hank', 'Schrader', '1966-03-10', 'Male', 'DEA Agent', 'DEA agent and Walter brother-in-law'),
    (5, 'Saul', 'Goodman', '1960-11-12', 'Male', 'Lawyer', 'Criminal defense attorney'),
    (6, 'Gus', 'Fring', '1958-01-26', 'Male', 'Restaurant Owner', 'Methamphetamine distributor and Los Pollos Hermanos owner'),
    (7, 'Mike', 'Ehrmantraut', '1944-07-15', 'Male', 'Private Investigator', 'Former police officer and fixer')
  `);

    // Insert Episodes
    await pool.query(`
    INSERT INTO Episodes (EpisodeID, Title, Season, Airdate, Description) VALUES
    (1, 'Pilot', 1, '2008-01-20', 'Walter White is diagnosed with cancer and decides to cook meth'),
    (2, 'Cat in the Bag', 1, '2008-01-27', 'Walter and Jesse dispose of Emilio body'),
    (3, 'And the Bag in the River', 1, '2008-02-10', 'Walter confronts Krazy-8 in Jesse basement'),
    (4, 'Cancer Man', 1, '2008-02-17', 'Walter tells his family about his cancer diagnosis'),
    (5, 'Gray Matter', 1, '2008-02-24', 'Walter rejects help from his former colleagues'),
    (6, 'Crazy Handful of Nothin', 1, '2008-03-02', 'Walter adopts the Heisenberg persona'),
    (7, 'A No-Rough-Stuff-Type Deal', 1, '2008-03-09', 'Walter and Jesse attempt to expand their operation')
  `);

    // Insert Locations
    await pool.query(`
    INSERT INTO Locations (LocationID, Name, Type, Description) VALUES
    (1, 'White Residence', 'House', 'Walter and Skyler family home'),
    (2, 'Jesse House', 'House', 'Jesse residence and occasional meth lab'),
    (3, 'Los Pollos Hermanos', 'Restaurant', 'Fast food chain owned by Gus Fring'),
    (4, 'Saul Office', 'Office', 'Saul Goodman legal office'),
    (5, 'Superlab', 'Laboratory', 'Underground meth lab built by Gus Fring'),
    (6, 'Desert', 'Outdoor', 'Remote location for cooking and meetings')
  `);

    // Insert Drugs
    await pool.query(`
    INSERT INTO Drugs (DrugID, Name, ChemicalFormula, Description) VALUES
    (1, 'Methamphetamine', 'C10H15N', 'Blue crystal meth produced by Walter White'),
    (2, 'Ricin', 'C35H49N9O10S2', 'Poison created by Walter White'),
    (3, 'Cocaine', 'C17H21NO4', 'Drug distributed by various dealers')
  `);

    // Insert Events
    await pool.query(`
    INSERT INTO Events (EventID, Date, Description) VALUES
    (1, '2008-09-07', 'Walter 50th birthday and cancer diagnosis'),
    (2, '2008-01-20', 'First meth cook in the RV'),
    (3, '2008-01-27', 'Emilio death'),
    (4, '2008-02-10', 'Krazy-8 death'),
    (5, '2008-03-02', 'Heisenberg persona created'),
    (6, '2008-03-09', 'Deal with Tuco Salamanca')
  `);

    // Insert CharacterEpisode (Walter appears in all 7 episodes - FIXED!)
    await pool.query(`
    INSERT INTO CharacterEpisode (AppearanceID, CharacterID, EpisodeID, Role) VALUES
    (1, 1, 1, 'Main'), (2, 2, 1, 'Main'),
    (3, 1, 2, 'Main'), (4, 2, 2, 'Main'),
    (5, 1, 3, 'Main'), (6, 2, 3, 'Main'),
    (7, 1, 4, 'Main'), (8, 3, 4, 'Supporting'),
    (9, 1, 5, 'Main'), (10, 3, 5, 'Supporting'),
    (11, 1, 6, 'Main'), (12, 2, 6, 'Main'),
    (13, 1, 7, 'Main'), (14, 2, 7, 'Main'),
    (15, 4, 1, 'Supporting'), (16, 4, 4, 'Supporting')
  `);

    // Insert CharacterLocation
    await pool.query(`
    INSERT INTO CharacterLocation (AssociationID, CharacterID, LocationID) VALUES
    (1, 1, 1), (2, 1, 6), (3, 2, 2), (4, 2, 6),
    (5, 3, 1), (6, 5, 4), (7, 6, 3), (8, 7, 3)
  `);

    // Insert CharacterDrug
    await pool.query(`
    INSERT INTO CharacterDrug (InvolvementID, CharacterID, DrugID, Role) VALUES
    (1, 1, 1, 'Manufacturer'), (2, 1, 2, 'Creator'),
    (3, 2, 1, 'Distributor'), (4, 6, 1, 'Distributor'),
    (5, 6, 3, 'Distributor')
  `);

    // Insert EventAssociation
    await pool.query(`
    INSERT INTO EventAssociation (EventAssociationID, EventID, CharacterID, EpisodeID) VALUES
    (1, 1, 1, 1), (2, 2, 1, 1), (3, 2, 2, 1),
    (4, 3, 2, 2), (5, 4, 1, 3), (6, 5, 1, 6),
    (7, 6, 1, 7), (8, 6, 2, 7)
  `);

    console.log('✅ Sample data inserted');
}

async function executeQuery(query) {
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    executeQuery,
    getPool: () => pool
};
