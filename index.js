import express from "express";
import bodyParser from "body-parser";
import * as fs from 'fs';

var app = express();
const host = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

let todos = loadTodos();
let wtodos = loadWTodos();

function loadTodos() {
    try {
        const data = fs.readFileSync('todos.json');
        const parsedData = JSON.parse(data);
        return parsedData.flat().filter(task => task !== ''); // Array entverschachteln und leere Aufgaben entfernen
    } catch (error) {
        return [];
    }
}

function loadWTodos() {
    try {
        const data = fs.readFileSync('wtodos.json');
        const parsedData = JSON.parse(data);
        return parsedData.flat().filter(task => task !== ''); 
    } catch (error) {
        return [];
    }
}

function saveTodos() {
    console.log('Saving todos to file...');
    try {
        const flatTodos = todos.flat(); // Array entverschachteln
        fs.writeFileSync('todos.json', JSON.stringify(flatTodos), 'utf-8');
        console.log('Todos saved successfully.');
    } catch (error) {
        console.error('Error saving todos:', error);
    }
}

function saveWTodos() {
    console.log('Saving todos to file...');
    try {
        const flatWTodos = wtodos.flat(); // Array entverschachteln
        fs.writeFileSync('wtodos.json', JSON.stringify(flatWTodos), 'utf-8');
        console.log('Todos saved successfully.');
    } catch (error) {
        console.error('Error saving todos:', error);
    }
}

app.get("/", function(req, res) {    
    res.render("index.ejs", { 
        todos: todos });
});

app.get("/work", function(req, res) {    
    res.render("work.ejs", { 
        wtodos: wtodos });
});

app.post("/addtask", (req, res) => {
    console.log(req.body.new_task);
    var newTask = req.body.new_task;
    todos.push(newTask);
    saveTodos();
    res.redirect("/");
});

app.post("/addsecondtask", (req, res) => {
    console.log(req.body.new_task);
    var newTask = req.body.new_task;
    wtodos.push(newTask);
    saveWTodos();
    res.redirect("/work");
});

app.post('/removetask', (req, res) => {
    console.log('POST request to /removetask received');

    const tasksToRemove = JSON.parse(req.body.task);

    if (Array.isArray(tasksToRemove)) {
        tasksToRemove.forEach(task => {
            const index = todos.indexOf(task);
            console.log(`Trying to remove task: ${task}, found at index: ${index}`);
            if (index !== -1) {
                todos.splice(index, 1);
                console.log(`Removed task: ${task}`);
            }
        });
    }

    console.log(todos);
    saveTodos();
    res.redirect('/');
});

app.post('/removesecondtask', (req, res) => {
    console.log('POST request to /removesecondtask received');

    const tasksToRemove = JSON.parse(req.body.task);

    if (Array.isArray(tasksToRemove)) {
        tasksToRemove.forEach(task => {
            const index = wtodos.indexOf(task);
            console.log(`Trying to remove task: ${task}, found at index: ${index}`);
            if (index !== -1) {
                wtodos.splice(index, 1);
                console.log(`Removed task: ${task}`);
            }
        });
    }

    console.log(wtodos);
    saveWTodos();
    res.redirect('/work');
});

app.listen(3000, () => {
    console.log("Server is running on port 3000!");
});
