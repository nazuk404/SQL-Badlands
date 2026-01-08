-- SQL Badlands Database Schema
-- This file is for reference only

-- Main Tables

CREATE TABLE Characters (
  CharacterID INT PRIMARY KEY,
  FirstName VARCHAR(255),
  LastName VARCHAR(255),
  DateOfBirth DATE,
  Gender VARCHAR(10),
  Occupation VARCHAR(255),
  Description TEXT
);

CREATE TABLE Episodes (
  EpisodeID INT PRIMARY KEY,
  Title VARCHAR(255),
  Season INT,
  Airdate DATE,
  Description TEXT
);

CREATE TABLE Locations (
  LocationID INT PRIMARY KEY,
  Name VARCHAR(255),
  Type VARCHAR(255),
  Description TEXT
);

CREATE TABLE Drugs (
  DrugID INT PRIMARY KEY,
  Name VARCHAR(255),
  ChemicalFormula VARCHAR(255),
  Description TEXT
);

CREATE TABLE Events (
  EventID INT PRIMARY KEY,
  Date DATE,
  Description TEXT
);

-- Junction Tables

CREATE TABLE CharacterEpisode (
  AppearanceID INT PRIMARY KEY,
  CharacterID INT,
  EpisodeID INT,
  Role VARCHAR(50),
  FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
  FOREIGN KEY (EpisodeID) REFERENCES Episodes(EpisodeID)
);

CREATE TABLE CharacterLocation (
  AssociationID INT PRIMARY KEY,
  CharacterID INT,
  LocationID INT,
  FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
  FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);

CREATE TABLE CharacterDrug (
  InvolvementID INT PRIMARY KEY,
  CharacterID INT,
  DrugID INT,
  Role VARCHAR(50),
  FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
  FOREIGN KEY (DrugID) REFERENCES Drugs(DrugID)
);

CREATE TABLE EventAssociation (
  EventAssociationID INT PRIMARY KEY,
  EventID INT,
  CharacterID INT,
  EpisodeID INT,
  FOREIGN KEY (EventID) REFERENCES Events(EventID),
  FOREIGN KEY (CharacterID) REFERENCES Characters(CharacterID),
  FOREIGN KEY (EpisodeID) REFERENCES Episodes(EpisodeID)
);
