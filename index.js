const {program} = require('commander');

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

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});