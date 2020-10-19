const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const con = require("./modules/connection.js");
const cors = require('cors');
app.use(cors());

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

// home route
app.get("/", (req, res) => {
    res.render("home");
});
// return text given id
app.get("/level",(req,res)=>{
    let {id} = req.query;
    console.log("************"+id)
    const querySelect = `Select fileContent from TLevel where id = '${id}'`;
    let result =  con.query(querySelect)
 
    const dataArray = result[0].fileContent
    res.send(dataArray)
    
})

app.post("/selection", urlencodedParser, (req, res) => {
    const game = req.body.game;
    let Files =[];
    const querySelect = "Select fileName from TLevel order by id";
    let result = con.query(querySelect)
       Files =  result.map(item=>{
           console.log(item.fileName)
          return item.fileName
        })


    const content = {
        game: game,
        samples1:Files,
    }
    console.log(Files)
    res.render("game", { content });
 
});

let restore = "";
let row = 0;
let col = 0;
let resArray = [];
// update file
app.get("/update", (req, res) => {
    const fileName = req.query.id;
    const pathstr = fileName.toString();
    restore = pathstr;
    const subs = pathstr.substring(pathstr.lastIndexOf("_") + 1, pathstr.lastIndexOf("."));
 
        const querySelect = `Select fileContent from TLevel where fileName = '${pathstr}' order by id`;
       let result =  con.query(querySelect)
    
       const dataArray = result[0].fileContent.toString().trim().split('\n');
       dataArray.shift();
       dataArray.shift();
            console.log("*****"+dataArray[0])
            res.render("update", { matrix: dataArray, level: subs, error: null})
        
   
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

    let player = 0;
    let target = 0;
    let playerError = null;
    let targetError = null;
    let {level} = req.query;
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
        
        const queryUpdate = `update TLevel set fileContent = '${text}' where id = ${level}`;
        con.query(queryUpdate)
            res.redirect(307,"/selection");
       
           
    }

    
});
app.get("/src/main.html", (req, res) => {

    res.sendFile("main.html");
});
const PORT = process.env.PORT || 3000
app.listen(PORT);

