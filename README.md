# SQL Badlands: The First Cook

A browser-based SQL learning game set in the Breaking Bad universe. Learn SQL through an engaging narrative while helping manage a criminal database.

![SQL Badlands Game](https://img.shields.io/badge/SQL-Learning%20Game-blue)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)

## 🎮 About

**SQL Badlands: The First Cook** is an interactive SQL tutorial disguised as a narrative game. You work for Saul Goodman, managing a database while a chemistry teacher named Walter White makes life-changing decisions. Progress through 4 chapters and 14 missions to master SQL fundamentals.

### ✨ Features

- 🎯 **14 Progressive Missions** - From basic SELECT to complex JOINs and data manipulation
- 📖 **Story-Driven Learning** - Engaging Breaking Bad narrative with real characters
- 🔒 **Progressive Unlocking** - Missions unlock as you complete them
- 📊 **Schema Viewer** - Reference database structure anytime
- 📝 **Query History** - Track your attempts (cleared on refresh)
- 🎨 **Greyscale UI** - Clean, distraction-free interface
- 🔄 **Fresh Start** - Game resets on every page refresh
- ✅ **Real-time Validation** - Instant feedback on your SQL queries
- 🏆 **Certificate System** - Unlock achievement certificate after completing all missions
- 🗄️ **MySQL Database** - Industry-standard database for realistic learning

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v14 or higher)
2. **MySQL Server** (required)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Make sure MySQL server is running

### Installation

1. **Clone or download the repository**

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Configure MySQL connection:**

Open `backend/db.js` and update your MySQL password (line 6):
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'YOUR_MYSQL_PASSWORD_HERE',  // ⚠️ CHANGE THIS!
  database: 'sql_badlands'
};
```

4. **Start MySQL Server:**
   - **Windows**: MySQL should start automatically, or use MySQL Workbench
   - **Mac**: `mysql.server start`
   - **Linux**: `sudo systemctl start mysql`

5. **Start the game server:**
```bash
cd backend
node server.js
```

The server will automatically:
- Create the `sql_badlands` database if it doesn't exist
- Create all tables
- Insert sample data

6. **Open your browser and navigate to:**
```
http://localhost:3000
```

That's it! Start playing and learning SQL! 🎮

## 📁 Project Structure

```
SQL badlands/
├── backend/              # Server-side code
│   ├── server.js         # Express server
│   ├── db.js             # MySQL database operations
│   ├── missions.js       # Mission validation logic
│   ├── schema.sql        # Database schema reference
│   ├── package.json      # Backend dependencies
│   └── package-lock.json
│
├── frontend/             # Client-side code
│   └── public/
│       ├── index.html    # Main HTML file
│       ├── app.js        # Frontend JavaScript
│       └── style.css     # Greyscale styling
│
├── README.md             # This file
├── ANSWERS.md            # Mission answers (solutions guide)
├── CERTIFICATE_FEATURE.md # Certificate system documentation
└── .gitignore            # Git ignore rules
```

## 📚 Game Structure

### Chapter 1: The Diagnosis
**Focus**: Basic SELECT queries
- SELECT all records
- Filtering with WHERE
- Sorting with ORDER BY

### Chapter 2: The First Cook
**Focus**: JOINs and relationships
- Multi-table JOINs
- Filtering joined data
- Aggregation with COUNT and GROUP BY

### Chapter 3: The Basement Standoff
**Focus**: Advanced queries
- Subqueries
- Complex filtering
- Aggregations

### Chapter 4: Breaking Bad
**Focus**: Data manipulation
- DELETE with subqueries
- UPDATE statements
- Complex aggregations with LEFT JOIN

## 🗄️ Database Schema

The game uses a MySQL database with 9 tables:

**Main Tables:**
- `Characters` - 7 Breaking Bad characters
- `Episodes` - 7 episodes
- `Locations` - 6 key locations
- `Drugs` - 3 drugs
- `Events` - 6 major events

**Junction Tables:**
- `CharacterEpisode` - Character appearances
- `CharacterLocation` - Character-location associations
- `CharacterDrug` - Drug involvement
- `EventAssociation` - Event relationships

## 🎯 How to Play

1. **Read the Mission** - Each mission has a clear SQL objective
2. **Write Your Query** - Use the SQL console to write your solution
3. **Run & Learn** - Execute with "Run Query" or `Ctrl+Enter`
4. **Get Feedback** - Receive instant validation and story progression
5. **Unlock More** - Complete missions to unlock new challenges

### Tips

- Click **"Schema"** to view database structure
- Click **"History"** to review your previous queries
- Click **"Missions"** to see all chapters and jump to unlocked missions
- Use `ANSWERS.md` if you get stuck (but try first!)
- Complete all 14 missions to unlock the **achievement certificate** 🏆

## 🔄 Game Behavior

### Every Time You Refresh the Page:
- ✅ Game resets to **Chapter 1, Mission 1**
- ✅ Query history is **cleared**
- ✅ No progress is saved (by design)

### Every Time You Start the Server:
- ✅ Connects to MySQL
- ✅ Creates `sql_badlands` database (if needed)
- ✅ Drops and recreates all tables
- ✅ Inserts fresh sample data

This ensures a **clean, consistent learning experience** every time!

## 🛠️ Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **MySQL** (mysql2) - Industry-standard database
- **CORS** - Cross-origin support

### Frontend
- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML5** - Semantic markup
- **CSS3** - Greyscale design system

## 🎨 Design Philosophy

- **Greyscale Only** - No colors, pure monochrome design
- **No Distractions** - Clean, focused interface
- **Direct Language** - Simple, clear instructions
- **Code-First** - Learn by doing, not reading

## 🔒 Safety Features

- **Query Validation** - Dangerous SQL commands are blocked
- **Transaction Rollback** - All write operations rollback automatically
- **XSS Prevention** - All output is properly escaped
- **Training Mode** - Database remains unchanged for practice

## 📖 Learning Outcomes

By completing SQL Badlands, you will learn:

- ✅ Basic SELECT queries and filtering
- ✅ Sorting and ordering results
- ✅ INNER and LEFT JOINs
- ✅ Aggregation functions (COUNT, GROUP BY)
- ✅ Subqueries and nested queries
- ✅ UPDATE and DELETE statements
- ✅ Database relationships and foreign keys
- ✅ Query optimization basics

## 🏆 Certificate System

Complete all 14 missions to unlock your **SQL Badlands Certificate of Completion**!

Features:
- Professional certificate design
- Personalized with your stats (total queries executed)
- Unique achievement code
- Downloadable as text file
- Shareable achievement code

The trophy badge (🏆) appears in the header when you complete all missions.

## 🔧 Troubleshooting

### "Access denied for user 'root'"
→ Update the password in `backend/db.js` to match your MySQL root password

### "Can't connect to MySQL server"
→ Make sure MySQL server is running
→ Check if the host and port are correct (default: localhost:3306)

### "Database creation failed"
→ Make sure your MySQL user has permission to create databases
→ Try creating the database manually:
```sql
CREATE DATABASE sql_badlands;
```

### Game doesn't reset on refresh
→ Clear browser cache (Ctrl+Shift+Delete)

### Port 3000 already in use
→ Stop any other Node.js processes: `Stop-Process -Name "node" -Force` (Windows)

## 🐛 Recent Updates

### Version 2.0 Changes:
1. **MySQL Integration** - Switched from SQLite to MySQL for realistic learning
2. **Fresh Start System** - Game now resets on every page refresh
3. **Bug Fix** - Fixed Walter appearing in only 6 episodes (now correctly 7)
4. **Certificate System** - Added achievement certificate for completing all missions
5. **History Clearing** - Query history now clears on page refresh

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

- 🐛 Report bugs
- 💡 Suggest new missions
- 📝 Improve documentation
- 🎨 Enhance the UI
- 🌍 Add translations

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by the TV series Breaking Bad
- Built for SQL learners everywhere
- Special thanks to the open-source community

## 📧 Contact

Have questions or feedback? Open an issue on GitHub!

---

**Happy Learning! 🎓**

*Remember: In SQL Badlands, the only thing you're breaking is bad query habits.*
