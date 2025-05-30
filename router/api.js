const  express = require('express');
const Router = express.Router()
const OpenAI  = require("openai");
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const systeamRole = fs.readFileSync('./sysrole.txt','utf-8')
const  AI = new OpenAI();
const {pipeline} = require("node:stream/promises")

Router.use(express.json());



Router.get('/',(req,res)=>{
     res.send('from api router');
})

// Chat
//----------------------------------------------
Router.post('/masseg', async (req, res) => {
    const Data = req.body
    try {
        console.log(req.body)
        const stream = await SendToAI(Data["Data"]);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                res.write(chunk.choices[0].delta.content);
            }
        }
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send("Error communicating with AI");
    }
});

async function SendToAI(message) {
    let  x = [{role:"system",content:systeamRole}]
    for(let i of message){
        x.push(i)
    }
    console.log(x);

    const stream = await AI.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages:x,
        temperature: 0.7,
        max_tokens: 300,
        stream: true
    });
    return stream;
}






Router.get("/session", async (req, res) => {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini-realtime-preview",
            voice: "verse",
            instructions: systeamRole
        }),
    });
    const data = await r.json();
    // Send back the JSON we received from the OpenAI REST API
    res.send(data);
});
module.exports = Router;

