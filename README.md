<h1 align="center">QuizQuest</h1>
<p align="center">
  <a href="https://quiz--quest.herokuapp.com/" target="_blank">
    <img src="https://i.imgur.com/QcIUNAW.png" width="700px">
    <br>
    Live Demo
  </a>
</p>

QuizQuest is a location-based game that inspires players to learn about various landmarks through engaging quizzes and community oriented features. QuizQuest engages players by providing a variety of question difficulties for a plethora of locations. Players are incentivized to explore and complete as many quizzes as possible through a robust leaderboard system.

Requirements
-------------
[Node.js](https://nodejs.org/en/ "Node.js") 10+

[npm](https://nodejs.org/en/ "npm") (bundled with Node.js)

Usage instructions
-------------

Navigate to QuizQuest root directory

```bash
cd QuizQuest
```

Install dependencies

```bash
npm install
```

Start server

```bash
npm start
```

Database implementation
-------------

The database utlizes SQLite, meaning it has less data-types than more advanced SQL implementations. Because of this, booleans are stored as integers.

![](https://i.imgur.com/ODEUMPb.png)

> Entity–relationship diagram for QuizQuest.db

The database file itself is located at `assets/db/QuizQuest.db`

Credits
-------------

**Compass SVG**:
https://www.flaticon.com/free-icon/compass_2439677?term=compass&page=1&position=3

**Background SVGs**:
https://www.svgbackgrounds.com

## License

GPLv3
