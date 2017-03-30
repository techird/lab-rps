const express = require('express');

const app = express();

app.use((request, response, next) => {
    response.write('Response from express');
    response.end();
});

const port = 8765;
app.listen(port);
console.log(`Server listening at http://127.0.0.1:${port}`);