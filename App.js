const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

app.use(express.json());
 //parse application/x-www-form-urlencoded
const urlencodedParser = bodyParser.urlencoded({ extended: false})
// parse application/json
app.use(bodyParser.json())
// allow ejs 
app.set('view engine', 'ejs');
const directorypath1 = path.join(__dirname, 'public') +"/board/samples1";
const directorypath2 = path.join(__dirname, 'public') +"/board/samples2";
app.use(express.static(path.join(__dirname, 'public')));

const pathCheck = path.join(__dirname, 'public') + "/board/samples1";
// home route
app.get("/", (req, res) => {
    res.render("home",{pathCheck});
});

app.post("/selection", urlencodedParser, (req, res) => {
    
    const game = req.body.game;
    const Files1 = [];
    const Files2 = [];
    // samples copy
    const f1 = fs.readdirSync(directorypath1);
    // store all files in samples1 to Files1 array
    f1.forEach(file => {
        if (file.startsWith("board")) {
            Files1.push(file);

        }

    });
    // samples2 copy
    const f2 = fs.readdirSync(directorypath2);
    f2.forEach(file => {
        if (file.startsWith("board")) {
            Files2.push(file);

        }

    });
  
    const content = {
        game: game,
        samples1:Files1,
        samples2:Files2,
    }
    res.render("game", { content });
 
});

let restore = "";
let row = 0;
let col = 0;
let resArray = [];
// update file
app.get("/update", (req, res) => {
    app.use(express.static(path.join(__dirname, 'public')));
    const path = req.query.id;
    const pathstr = path.toString();
    restore = pathstr;
    const subs = pathstr.substring(pathstr.lastIndexOf("_") + 1, pathstr.lastIndexOf("."));
    if (path) {
        const data = fs.readFileSync("/board/" + path);
        const dataArray = data.toString().split('\n');
        dataArray.pop();
        dataArray.shift();
        dataArray.shift();
        row = dataArray.length;
        col = dataArray[0].length;
        resArray = dataArray.slice();
        res.render("update", { matrix: dataArray, level: subs, error: null})
    }
   
} 
);

app.post("/check", urlencodedParser, (req, res) => {
    let player = 0;
    let target = 0;
    let playerError = null;
    let targetError = null;
    const checkArray = [];
    for (var i = 0; i < req.query.row; i++) {
        var tempStr = "";
        for (var j = 0; j < req.query.col; j++) {
            var value = "piece" + i + j;
            if (req.body[value] == 's' || req.body[value] == 'S') {
                player++;
            }
            if (req.body[value] == 't' || req.body[value] == 'T') {
                target++;
            }
            tempStr = tempStr + req.body[value];
            
        }
        checkArray.push(tempStr);
    }
    if (player == 0) {
        playerError = "Player(s/S) is not selected.";
        
    }
    else if (player > 1) {
        playerError = "player(s/S) must be selected only once.";
        
    }
    

    if (target == 0) {
        targetError = "target(t/T) is not selected.";
        
    }
    else if (target > 1) {
        targetError = "target(t/T) must be selected only once.";
        
    }
    let dataArray = checkArray.slice();
    let subs = req.query.level;
    if (targetError != null) {
        res.render("update", { matrix: dataArray, level: subs, error: targetError})
    }
    else if (playerError != null) {
        res.render("update", { matrix: dataArray, level: subs, error: playerError })
    }
    else {
        res.render("update", { matrix: dataArray, level: subs,error:null })
    }
    
   // res.send(checkArray);           

});

app.post("/restore", urlencodedParser, (req, res) => {
    res.redirect("/update?id="+restore)
    
});


app.post("/save", urlencodedParser, (req, res) => {

    app.use(express.static(path.join(__dirname, 'public')));
    let player = 0;
    let target = 0;
    let playerError = null;
    let targetError = null;
    const checkArray = [];
    for (var i = 0; i < req.query.row; i++) {
        var tempStr = "";
        for (var j = 0; j < req.query.col; j++) {
            var value = "piece" + i + j;
            if (req.body[value] == 's' || req.body[value] == 'S') {
                player++;
            }
            if (req.body[value] == 't' || req.body[value] == 'T') {
                target++;
            }
            tempStr = tempStr + req.body[value];

        }
        checkArray.push(tempStr);
    }
    if (player == 0) {
        playerError = "Player(s/S) is not selected.";

    }
    else if (player > 1) {
        playerError = "player(s/S) must be selected only once.";

    }


    if (target == 0) {
        targetError = "target(t/T) is not selected.";

    }
    else if (target > 1) {
        targetError = "target(t/T) must be selected only once.";

    }
    let dataArray = checkArray.slice();
    let subs = req.query.level;
    if (targetError != null) {
        res.render("update", { matrix: dataArray, level: subs, error: targetError })
    }
    else if (playerError != null) {
        res.render("update", { matrix: dataArray, level: subs, error: playerError })
    }
    else {
        const desc = "Level " + subs;
        const dimen = dataArray.length + " " + dataArray[0].length;
        let text = desc + "\n" + dimen + "\n";
        for (var i = 0; i < dataArray.length; i++) {
            text = text + dataArray[i] +"\n";
            
        }
        console.log(text)
        console.log("**"+restore)
        const filepath = "/board/" + restore;
        fs.writeFile(filepath, text, 'utf8', function (err) {
            if (err) {
                throw err
            }
            else {
                console.log("saved");
                res.redirect(307,"/selection");
            }
            
        }
        );
           
        
        //res.render("update", { matrix: dataArray, level: subs, error: null })
    }

    
});
app.get("/src/main.html", (req, res) => {

    res.sendFile("main.html");
});
const PORT = process.env.PORT || 3000
app.listen(PORT);

