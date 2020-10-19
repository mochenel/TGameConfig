let Mysql = require("sync-mysql")
let con = new Mysql({
    host:"us-cdbr-east-02.cleardb.com",
    user:"b5a01641b43907",
    password:"4594975e",
    database:"heroku_2e9f0c746791418"
})

// con.connect((err)=>{
//     if(err) throw err
//     console.log("connected")
// })

module.exports = con;