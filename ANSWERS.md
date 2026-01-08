# SQL Badlands: The First Cook - Mission Answers

This file contains the correct SQL queries for all missions across all 4 chapters. Use this as a reference guide.

---

## Chapter 1: The Diagnosis
**Focus**: Basic SELECT queries

### Mission 1: Show every character in the database
```sql
SELECT * FROM Characters;
```

**Alternative solutions:**
```sql
SELECT CharacterID, FirstName, LastName, DateOfBirth, Gender, Occupation, Description 
FROM Characters;
```

---

### Mission 2: Show the record for the chemistry teacher named Walter White
```sql
SELECT * FROM Characters 
WHERE FirstName = 'Walter' AND LastName = 'White';
```

**Alternative solutions:**
```sql
SELECT * FROM Characters 
WHERE FirstName = 'Walter' 
  AND LastName = 'White';
```

---

### Mission 3: Show each character with their occupation, ordered by occupation
```sql
SELECT FirstName, LastName, Occupation 
FROM Characters 
ORDER BY Occupation;
```

**Alternative solutions:**
```sql
SELECT * FROM Characters 
ORDER BY Occupation;

SELECT FirstName, LastName, Occupation 
FROM Characters 
ORDER BY Occupation ASC;
```

---

## Chapter 2: The First Cook
**Focus**: JOINs and filtering

### Mission 1: List all characters who were at the RV lab
```sql
SELECT c.FirstName, c.LastName 
FROM Characters c
JOIN CharacterLocation cl ON c.CharacterID = cl.CharacterID
JOIN Locations l ON cl.LocationID = l.LocationID
WHERE l.Name = 'RV Lab';
```

**Alternative solutions:**
```sql
SELECT Characters.FirstName, Characters.LastName 
FROM Characters
INNER JOIN CharacterLocation ON Characters.CharacterID = CharacterLocation.CharacterID
INNER JOIN Locations ON CharacterLocation.LocationID = Locations.LocationID
WHERE Locations.Name = 'RV Lab';

SELECT DISTINCT c.* 
FROM Characters c, CharacterLocation cl, Locations l
WHERE c.CharacterID = cl.CharacterID 
  AND cl.LocationID = l.LocationID 
  AND l.Name = 'RV Lab';
```

---

### Mission 2: Show all episodes where Walter appears, with titles and airdates
```sql
SELECT e.Title, e.Airdate 
FROM Episodes e
JOIN CharacterEpisode ce ON e.EpisodeID = ce.EpisodeID
JOIN Characters c ON ce.CharacterID = c.CharacterID
WHERE c.FirstName = 'Walter' AND c.LastName = 'White';
```

**Alternative solutions:**
```sql
SELECT Episodes.Title, Episodes.Airdate, Episodes.Season
FROM Episodes
INNER JOIN CharacterEpisode ON Episodes.EpisodeID = CharacterEpisode.EpisodeID
INNER JOIN Characters ON CharacterEpisode.CharacterID = Characters.CharacterID
WHERE Characters.FirstName = 'Walter' AND Characters.LastName = 'White';

SELECT e.* 
FROM Episodes e
WHERE e.EpisodeID IN (
  SELECT ce.EpisodeID 
  FROM CharacterEpisode ce
  JOIN Characters c ON ce.CharacterID = c.CharacterID
  WHERE c.FirstName = 'Walter' AND c.LastName = 'White'
);
```

---

### Mission 3: List the roles of Jesse related to the drug Blue Meth
```sql
SELECT cd.Role 
FROM CharacterDrug cd
JOIN Characters c ON cd.CharacterID = c.CharacterID
JOIN Drugs d ON cd.DrugID = d.DrugID
WHERE c.FirstName = 'Jesse' AND d.Name = 'Blue Meth';
```

**Alternative solutions:**
```sql
SELECT CharacterDrug.Role, Characters.FirstName, Characters.LastName, Drugs.Name
FROM CharacterDrug
JOIN Characters ON CharacterDrug.CharacterID = Characters.CharacterID
JOIN Drugs ON CharacterDrug.DrugID = Drugs.DrugID
WHERE Characters.FirstName = 'Jesse' 
  AND Characters.LastName = 'Pinkman'
  AND Drugs.Name = 'Blue Meth';
```

---

### Mission 4: Count how many characters are tied to each location
```sql
SELECT l.Name, COUNT(cl.CharacterID) AS CharacterCount
FROM Locations l
LEFT JOIN CharacterLocation cl ON l.LocationID = cl.LocationID
GROUP BY l.LocationID, l.Name;
```

**Alternative solutions:**
```sql
SELECT Locations.Name, COUNT(CharacterLocation.CharacterID) AS CharacterCount
FROM Locations
LEFT JOIN CharacterLocation ON Locations.LocationID = CharacterLocation.LocationID
GROUP BY Locations.Name;

SELECT l.Name, COUNT(*) AS CharacterCount
FROM Locations l
JOIN CharacterLocation cl ON l.LocationID = cl.LocationID
GROUP BY l.Name;
```

---

## Chapter 3: The Basement Standoff
**Focus**: Aggregations and subqueries

### Mission 1: Show dates and descriptions of all events involving Walter
```sql
SELECT e.Date, e.Description 
FROM Events e
JOIN EventAssociation ea ON e.EventID = ea.EventID
JOIN Characters c ON ea.CharacterID = c.CharacterID
WHERE c.FirstName = 'Walter' AND c.LastName = 'White';
```

**Alternative solutions:**
```sql
SELECT Events.Date, Events.Description, Events.EventID
FROM Events
INNER JOIN EventAssociation ON Events.EventID = EventAssociation.EventID
INNER JOIN Characters ON EventAssociation.CharacterID = Characters.CharacterID
WHERE Characters.FirstName = 'Walter' AND Characters.LastName = 'White'
ORDER BY Events.Date;

SELECT e.* 
FROM Events e
WHERE e.EventID IN (
  SELECT ea.EventID 
  FROM EventAssociation ea
  JOIN Characters c ON ea.CharacterID = c.CharacterID
  WHERE c.FirstName = 'Walter' AND c.LastName = 'White'
);
```

---

### Mission 2: Show every character who appears in any event that Walter is part of
```sql
SELECT DISTINCT c.FirstName, c.LastName 
FROM Characters c
JOIN EventAssociation ea ON c.CharacterID = ea.CharacterID
WHERE ea.EventID IN (
  SELECT ea2.EventID 
  FROM EventAssociation ea2
  JOIN Characters c2 ON ea2.CharacterID = c2.CharacterID
  WHERE c2.FirstName = 'Walter' AND c2.LastName = 'White'
);
```

**Alternative solutions:**
```sql
SELECT DISTINCT c.* 
FROM Characters c
WHERE c.CharacterID IN (
  SELECT ea.CharacterID 
  FROM EventAssociation ea
  WHERE ea.EventID IN (
    SELECT ea2.EventID 
    FROM EventAssociation ea2
    JOIN Characters c2 ON ea2.CharacterID = c2.CharacterID
    WHERE c2.FirstName = 'Walter'
  )
);

SELECT DISTINCT c.FirstName, c.LastName
FROM Characters c
JOIN EventAssociation ea1 ON c.CharacterID = ea1.CharacterID
JOIN EventAssociation ea2 ON ea1.EventID = ea2.EventID
JOIN Characters walter ON ea2.CharacterID = walter.CharacterID
WHERE walter.FirstName = 'Walter' AND walter.LastName = 'White';
```

---

### Mission 3: Show how many episodes exist in each season
```sql
SELECT Season, COUNT(*) AS EpisodeCount 
FROM Episodes 
GROUP BY Season;
```

**Alternative solutions:**
```sql
SELECT Season, COUNT(EpisodeID) AS EpisodeCount 
FROM Episodes 
GROUP BY Season
ORDER BY Season;
```

---

## Chapter 4: Breaking Bad
**Focus**: UPDATE, DELETE, complex queries

### Mission 1: Remove all episode links for the dealer K. Ochoa
```sql
DELETE FROM CharacterEpisode 
WHERE CharacterID = (
  SELECT CharacterID 
  FROM Characters 
  WHERE LastName = 'Ochoa'
);
```

**Alternative solutions:**
```sql
DELETE FROM CharacterEpisode 
WHERE CharacterID IN (
  SELECT CharacterID 
  FROM Characters 
  WHERE FirstName = 'Krazy' AND LastName = 'Ochoa'
);

DELETE FROM CharacterEpisode 
WHERE CharacterID = (
  SELECT CharacterID 
  FROM Characters 
  WHERE FirstName = 'Krazy'
);
```

---

### Mission 2: Fix a wrong airdate for the first episode
```sql
UPDATE Episodes 
SET Airdate = '2008-01-20' 
WHERE Title = 'Pilot';
```

**Alternative solutions:**
```sql
UPDATE Episodes 
SET Airdate = '2008-01-20' 
WHERE EpisodeID = 1;

UPDATE Episodes 
SET Airdate = '2008-01-20' 
WHERE Title = 'Pilot' AND Season = 1;
```

---

### Mission 3: Change the drug role of Walter from Manufacturer to Unknown for Blue Meth
```sql
UPDATE CharacterDrug 
SET Role = 'Unknown' 
WHERE CharacterID = (
  SELECT CharacterID 
  FROM Characters 
  WHERE FirstName = 'Walter' AND LastName = 'White'
) 
AND DrugID = (
  SELECT DrugID 
  FROM Drugs 
  WHERE Name = 'Blue Meth'
);
```

**Alternative solutions:**
```sql
UPDATE CharacterDrug 
SET Role = 'Unknown' 
WHERE CharacterID = 1 AND DrugID = 1;

UPDATE CharacterDrug 
SET Role = 'Unknown' 
WHERE InvolvementID = 1;
```

---

### Mission 4: Show all events with the number of characters involved, ordered by date
```sql
SELECT e.Date, e.Description, COUNT(ea.CharacterID) AS CharacterCount
FROM Events e
LEFT JOIN EventAssociation ea ON e.EventID = ea.EventID
GROUP BY e.EventID, e.Date, e.Description
ORDER BY e.Date;
```

**Alternative solutions:**
```sql
SELECT Events.EventID, Events.Date, Events.Description, 
       COUNT(EventAssociation.CharacterID) AS CharacterCount
FROM Events
LEFT JOIN EventAssociation ON Events.EventID = EventAssociation.EventID
GROUP BY Events.EventID, Events.Date, Events.Description
ORDER BY Events.Date ASC;

SELECT e.*, COUNT(ea.CharacterID) AS CharacterCount
FROM Events e
LEFT JOIN EventAssociation ea ON e.EventID = ea.EventID
GROUP BY e.EventID
ORDER BY e.Date;
```

---

## Tips for Writing SQL Queries

1. **Use table aliases** to make queries shorter and more readable
2. **Be consistent** with capitalization (SQL keywords in UPPERCASE is common)
3. **Use proper indentation** for complex queries
4. **Test incrementally** - build complex queries step by step
5. **Use DISTINCT** when you need unique results
6. **Remember JOIN types**:
   - INNER JOIN: Only matching rows
   - LEFT JOIN: All rows from left table, matching from right
   - RIGHT JOIN: All rows from right table, matching from left
7. **GROUP BY** requires all non-aggregated columns in SELECT
8. **ORDER BY** comes after GROUP BY and WHERE clauses

---

## Common SQL Functions Used

- `COUNT(*)` - Count all rows
- `COUNT(column)` - Count non-null values in a column
- `DISTINCT` - Remove duplicates
- `WHERE` - Filter rows before grouping
- `HAVING` - Filter groups after grouping
- `ORDER BY` - Sort results (ASC or DESC)
- `GROUP BY` - Aggregate rows by column values

---

## Database Schema Quick Reference

**Main Tables:**
- Characters (CharacterID, FirstName, LastName, DateOfBirth, Gender, Occupation, Description)
- Episodes (EpisodeID, Title, Season, Airdate, Description)
- Locations (LocationID, Name, Type, Description)
- Drugs (DrugID, Name, ChemicalFormula, Description)
- Events (EventID, Date, Description)

**Junction Tables:**
- CharacterEpisode (AppearanceID, CharacterID, EpisodeID, Role)
- CharacterLocation (AssociationID, CharacterID, LocationID)
- CharacterDrug (InvolvementID, CharacterID, DrugID, Role)
- EventAssociation (EventAssociationID, EventID, CharacterID, EpisodeID)
