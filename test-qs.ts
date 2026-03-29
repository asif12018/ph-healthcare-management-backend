import express from "express";
import qs from "qs";

const app = express();

app.use("query parser", (str : string)=> qs.parse(str));

app.get("/test", (req, res) => {
    res.json(req.query);
});

console.log("Mock app created, query parser default is:", app.get("query parser"));
console.log("Testing with qs.parse directly:", qs.parse("experience[gte]=5"));
