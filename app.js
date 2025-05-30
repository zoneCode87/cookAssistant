const express = require('express')
const path = require("path");
const app = express()
const port = 3000
const routerAPi = require('./router/api');
app.use('/api',routerAPi);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "pug");
app.use(express.json());




app.get('/', (req, res) => {
        res.render("home",{title:"home"});
})
app.get('/voicechat', (req, res) => {
       res.render("voicechat",{title:"voicechat"});
})


app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});


