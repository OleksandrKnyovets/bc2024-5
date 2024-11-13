const {program} = require('commander');
const fs = require('fs');
const path = require('path');
const express = require('express');

program
    .requiredOption('-h, --host <type>', 'server address')
    .requiredOption('-p, --port <number>', 'server port')
    .requiredOption('-c, --cache <path>', 'cache directory');
program.parse(process.argv);

// Отримання опцій з командного рядка
const { host, port, cache } = program.opts();

const app = express();      
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Функція для отримання шляху до нотатки
function getNotePath(name) {
    return path.join(cache, `${name}.txt`);
}

app.get('/notes/:name', (req, res) => {
    const filePath = getNotePath(req.params.name);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
    const noteText = fs.readFileSync(filePath, 'utf8');
    res.send(noteText);
});

app.put('/notes/:name', (req, res) => {
    const filePath = getNotePath(req.params.name);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
    fs.writeFileSync(filePath, req.body.text);
    res.send('Note updated');
});

app.delete('/notes/:name', (req, res) => {
    const filePath = getNotePath(req.params.name);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
    fs.unlinkSync(filePath);
    res.send('Note deleted');
});

app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(cache).map(file => {
        const name = path.parse(file).name;
        const text = fs.readFileSync(path.join(cache, file), 'utf8');
        return { name, text };
    });
    res.json(notes);
});

app.post('/write', (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;
    const filePath = getNotePath(noteName);

    if (fs.existsSync(filePath)) return res.status(400).send('Note already exists');
    fs.writeFileSync(filePath, noteText);
    res.status(201).send('Note created');
});

app.get('/UploadForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});