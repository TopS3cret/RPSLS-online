var http = require('http');
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var cache = {};

function errorResponse(errno, response){
    response.writeHead(errno, {"Content-Type":"text/plain"});
    response.write("Napaka " + errno + ": poguglaj kaj to pomeni...");
    response.end();
}

function fileResponse(response, fileDir, fileContent){
    response.writeHead(200, {"Content-Type":mime.lookup(fileDir)});
    response.write(fileContent);
    response.end();
}

function staticContentResponse(response, cache, fileDir){
    if(cache[fileDir])
        fileResponse(response, fileDir, cache[fileDir]);
    else{
        fs.exists(fileDir, function(exists){
            if(exists){
                fs.readFile(fileDir, function(err, fileContent){
                    if(err){
                        errorResponse(500, response);
                    }
                    else{
                        cache[fileDir] = fileContent;
                        fileResponse(response, fileDir, fileContent);
                    }
                    
                });
            }
        });
    }
}

var server = http.createServer(function(request, response){
    
    var fileDir = false;
    
    if(request.url=="/")
        fileDir = "./public/index.html";
    else
        fileDir = "./public" + request.url;
    
    
    staticContentResponse(response, cache, fileDir);
});

server.listen(process.env.PORT, function(){
    console.log("The server is running.");
});

var gameServer = require('./lib/rpsls_server');
gameServer.listen(server);
