$('.search-button').click(function(){
  $(this).parent().toggleClass('open');
});
const http = require('http');
const https = require('https');

const s = http.createServer(server);

function server(req, res) {
    let search_json;
    if (req.method === 'POST') {
        let search_query = "";
        let body = '';
        req.on('data', chunk => {
            search_query = chunk.toString().substring(chunk.toString().indexOf('=') + 1);
            body += search_query; // convert Buffer to string
            var http = require("https");

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
                console.log(options.path);
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
                    for(let i = 0; i < results.length; i++){
                        let obj = "<div>";
                        obj += `<a href="${results[i].html_url}"> ${results[i].name}</a>`;
                        obj += `<p>Stars: ${results[i].stargazers_count}</p>`;
                        obj += `<p>Language: ${results[i].language}</p>`;
                        if(results[i].license !== null){
                            obj += `License: ${results[i].license.name}`
                        }else{
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
    else {
        res.end(`
        <!doctype html>
        <html>
        <body>
            <form action="/" method="post">
                <input type="text" name="search" /><br />
            </form>
        </body>
        </html>
      `);
    }
}

s.listen(3000).on("error", (err) => {
    console.log("Error: " + err.message);
});