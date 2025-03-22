const app = require('./src/app');

const POST = 3001;

const server = app.listen(POST, () => {
    console.log(`Server is running on port ${POST}`);
});

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server is stopped');
    });
});