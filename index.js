const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const myToken = process.env.MY_TOKEN;

app.listen(8080||process.env.PORT, () => {
    console.log("WEBHOOK IS LISTENING!!!")
});

// to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if (mode && token) {
        if(mode === "subscribe" && token === myToken) {
            res.status(200).send(challange);
        } else {
            res.status(403);
        }
    }
});

app.post("/webhook", (req, res) => {
    let body_param = req.body; 

    console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object) {
        if (body_param.entry 
        && body_param.entry[0].changes[0].value.messages 
        && body_param.entry[0].changes[0].value.messages[0]) {
            let phone_no_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
            let from = req.body.entry[0].changes[0].value.messages[0].from;
            let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
            
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v13.0/"+phone_no_id+"/messages?access_token="+token,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: "Hi! I'm Cong Vu"
                    }
                },
                headers: {
                    "Content-Type": "application/json"
                }
            });

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
});