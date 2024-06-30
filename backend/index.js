require('dotenv').config(); // Load environment variables

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const cors = require("cors");
const bodyParser = require('body-parser');
const fs = require("fs").promises;
const mongoose = require("mongoose");

const useMongoDB = process.env.USE_MONGO === 'true';

let Item; // Declare Item variable

if (useMongoDB) {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('Could not connect to MongoDB', err));

    const itemSchema = new mongoose.Schema({
        task: String,
        currentDate: Date,
        dueDate: Date
    });

    Item = mongoose.model('Item', itemSchema); // Initialize Item model
}

app.use(cors());
app.use(bodyParser.json({ extended: true }));

app.listen(port, () => console.log("Backend server live on " + port));

app.get("/", (req, res) => {
    res.send({ message: "Connected to Backend server!" });
});

app.post("/add/item", addItem);

async function addItem(request, response) {
    const jsonObject = request.body.jsonObject;

    if (useMongoDB) {
        const newItem = new Item({
            task: jsonObject.task,
            currentDate: jsonObject.currentDate,
            dueDate: jsonObject.dueDate
        });
        newItem.save()
            .then(() => {response.json({ message: 'Item saved to MongoDB' }); console.log('Item saved to MongoDB');})
            .catch(err => response.status(500).json({ error: err.message }));
    } else {
        try {
            const id = jsonObject.id;
            const task = jsonObject.task;
            const curDate = jsonObject.currentDate;
            const dueDate = jsonObject.dueDate;

            const newTask = {
                ID: id,
                Task: task,
                Current_date: curDate,
                Due_date: dueDate
            };

            const data = await fs.readFile("database.json");
            const json = JSON.parse(data);
            json.push(newTask);
            await fs.writeFile("database.json", JSON.stringify(json));
            console.log('Successfully wrote to file');
            response.sendStatus(200);
        } catch (err) {
            console.log("error: ", err);
            response.sendStatus(500);
        }
    }
}
