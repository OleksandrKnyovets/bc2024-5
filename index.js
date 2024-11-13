const { program: prog } = require('commander');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');  // Додаємо multer для обробки multipart/form-data

prog
    .option('-h, --host <type>', 'server address')
    .option('-p, --port <number>', 'server port')
    .option('-c, --cache <path>', 'cache directory');
prog.parse(process.argv);

const { host, port, cache } = prog.opts();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Налаштування multer для обробки текстових полів
const upload = multer(); // Не використовуємо файли, тільки текстові поля

// Функція для отримання шляху до нотатки
function getNotePath(name) {
    return path.join(cache, `${name}.txt`);
}

// Отримання нотатки
app.get('/notes/:name', (req, res) => {
    const filePath = getNotePath(req.params.name);
    if (!fs.existsSync(filePath)) return res.status(404).send('Не знайдено');
    const noteText = fs.readFileSync(filePath, 'utf8');
    res.send(noteText);
});

// Оновлення нотатки
app.put('/notes/:name', (req, res) => {
    const filePath = getNotePath(req.params.name);
    if (!fs.existsSync(filePath)) return res.status(404).send('Не знайдено');
    fs.writeFileSync(filePath, req.body.text);
    res.send('Нотатка оновлена');
});

// Видалення нотатки
app.delete('/notes/:name', (req, res) => {
    const filePath = getNotePath(req.params.name);
    if (!fs.existsSync(filePath)) return res.status(404).send('Не знайдено');
    fs.unlinkSync(filePath);
    res.send('Нотатка видалена');
});

// Отримання списку нотаток
app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(cache).map(file => {
        const name = path.parse(file).name;
        const text = fs.readFileSync(path.join(cache, file), 'utf8');
        return { name, text };
    });
    res.json(notes);
});

// Створення нової нотатки
app.post('/write', upload.none(), (req, res) => {  // Використовуємо upload.none() для обробки тільки текстових полів
    const noteName = req.body.note_name;
    const noteText = req.body.note;

    if (!noteName || !noteText) { // Перевірка на наявність всіх необхідних полів
        return res.status(400).send('Відсутня назва або текст примітки');
    }

    const filePath = getNotePath(noteName);

    if (fs.existsSync(filePath)) return res.status(400).send('Нотатка вже існує');
    
    // Запис у файл
    fs.writeFileSync(filePath, noteText);
    res.status(201).send('Нотатка створена');
});

// Рендеринг HTML-форми
app.get('/1', (req, res) => {
    res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Сервер працює на http://${host}:${port}/1`);
});