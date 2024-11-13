const {program} = require('commander');

program
    .requiredOption('-h, --host <type>', 'server address')
    .requiredOption('-p, --port <number>', 'server port')
    .requiredOption('-c, --cache <path>', 'cache directory');

program.parse(process.argv);

const { host, port, cache } = program.opts();


console.log(`Параметри серверу: хост =${host}, порт =${port}, кеш =${cache}`);
