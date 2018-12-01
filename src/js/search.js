const http = require('http');
const https = require('https');
let express = require('express');
let fs = require('fs');
var app = express();
var path = require("path");

app.get('/', function (req, res) {
    app.use("/css", express.static(__dirname.substring(0, __dirname.length - 2) + '/css'));
    res.sendFile(path.join(__dirname.substring(0, __dirname.length - 6)+ '/index.html'));
});

app.post('/', function (req, res) {
    search(req, res)
});
app.listen(3000);

function search(req, res) {
    let search_json;
    let search_query = "";
    let body = '';
    req.on('data', chunk => {
        search_query = chunk.toString().substring(chunk.toString().indexOf('=') + 1);
        body += search_query; // convert Buffer to string
        console.log(search_query);
        var options = {
            "method": "GET",
            "hostname": "api.github.com",
            "path": "/search/repositories?q=" + search_query,
            "headers": {
                "cache-control": "no-cache",
                "User-Agent": "node.js"
            },
        };

        var github_req = http.request(options, function (github_res) {
            console.log("working2");
            var chunks = [];

            github_res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            github_res.on("end", function () {
                var body = Buffer.concat(chunks);
                search_json = JSON.parse(body.toString());
                res.write(`
                        <!doctype html>
                        <html>
                        <body>
                    `);

                let results = search_json.items;
                for (let i = 0; i < results.length; i++) {
                    let obj = "<div>";
                    obj += `<a href="${results[i].html_url}"> ${results[i].name}</a>`;
                    obj += `<p>Stars: ${results[i].stargazers_count}</p>`;
                    obj += `<p>Language: ${results[i].language}</p>`;
                    if (results[i].license !== null) {
                        obj += `License: ${results[i].license.name}`
                    } else {
                        obj += `License: No License`;
                    }
                    res.write(obj)
                }

                res.write(`
                    </body>
                    </html>
                    `);
                res.end();
            });
        });

        github_req.end();
    });
}

//
// s.listen(3000).on("error", (err) => {
//     console.log("Error: " + err.message);
// });