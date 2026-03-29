const express = require('express');
const app = express();
app.use("query parser", (str) => require('qs').parse(str));
app.get('/', (req, res) => res.json(req.query));
app.listen(5001, () => console.log('started'));
