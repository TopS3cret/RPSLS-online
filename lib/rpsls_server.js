var socketio = require("socket.io");
var io;
var rooms = {};

var lobby = 'lobby';

exports.listen = function (server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    
    io.sockets.on("connection", function(socket){
        console.log("Socket connected.");
        var player = new Player(socket);
        broadcastRooms();
    });
}

function broadcastRooms(){
    var r = [];
    for(var e in rooms){
        r.push({
            "name":rooms[e].name,
            "private":rooms[e].private
        });
    }
    
    
    io.sockets.emit("roomsUpdate", r);
    console.log(rooms);
}


// ************** //
//  Player class  //
// ************** //

var Player = function(socket){
    this.socket = socket;
    this.bindEvents();
};

// Bind events to handlers
Player.prototype.bindEvents = function() {
    this.socket.on('makeMove', this.makeMove.bind(this));
    this.socket.on('joinRoom', this.joinRoom.bind(this));
    this.socket.on('createRoom', this.createRoom.bind(this));
};


// Event handlers:
// Process the move received from player
Player.prototype.makeMove = function(data){
    console.log("Move: " + data.move);
    console.log("Socket: " + this.socket.id);
};


// Process the join request from player
Player.prototype.joinRoom = function(data){
    if(this.curRoom != undefined){
        console.log("already in room");
        // TODO: send error to player (already in room)
    }
    else if (!(data.name in rooms)){
        console.log("no such room");
        // TODO: send error to player (no such room)
    }
    else{
        if(rooms[data.name].private){
            if(rooms[data.name].password == data.password){
                rooms[data.name].game.addPlayer(this);
                this.curRoom = data.name;
            }
        }
        else{
            
        }
    }
};

// Process create room request from player
Player.prototype.createRoom = function(data){
    if(data.name in rooms){
        console.log("room with this name exists");
        // TODO: send error to player (room with name already exists)
    }
    else if(this.curRoom != undefined){
        console.log("already in a room");
        // TODO: send error to player (already in a room)
    }
    else {
        rooms[data.name] = {
          name: data.name,
          private: data.private,
          password: data.password,
          game: new Game(this, data)
        };
        broadcastRooms();
        this.curRoom = data.name;
    }
};

Player.prototype.opponentsMove = function(move){
    this.socket.emit('opponentsMove', {'move':move});
};

Player.prototype.sendResult = function(result){
    this.socket.emit('moveResult', {
        "result": result,
        "points": this.points
    }) ;
}

Player.prototype.winTurn = function(){
    this.points += 1;
    this.sendResult('win');
};

Player.prototype.lostTurn = function(){
    this.sendResult('lose');
};

Player.prototype.drawTurn = function(){
    this.sendResult('draw');
};




// ************** //
//   Game class   //
// ************** //

var Game = function(player1, room){
    this.state = 'waiting';
    this.room = room.name;
    this.turns = room.turns;
    this.players = [player1];
};

Game.prototype.addPlayer = function(player){
  this.players.push(player); 
  if(this.players.length == 2){
      this.beginGame();
  }
};

Game.prototype.beginGame = function(){
    delete rooms(this.room);
    this.state = 'playing';
    this.players[0].points = 0;
    this.players[1].points = 0;
};

Game.prototype.processMove = function(){
    // Did both players send their moves?
    for(var i=0; i<2; i++){
        if(this.players[i].curMove == undefined)
            return;
    }
    
    // Inform players about their opponent's moves
    this.players[0].opponentsMove(this.players[1].curMove);
    this.players[1].opponentsMove(this.players[0].curMove);
    
    
    // Calculate outcome and inform players
    var winner = calculateWin(this.players[0].curMove, this.players[1].curMove);
    
    if(winner==-1){
        this.players[0].winTurn();
        this.players[1].loseTurn();
    }
    else if(winner==1){
        this.players[1].winTurn();
        this.players[0].loseTurn();
    }
    else{
        this.players[0].drawTurn();
        this.players[0].drawTurn();
    }
    
    // Delete curent moves
    for(var i=0; i<2; i++){
        delete this.players[i].curMove;
    }
};

var calculateWin = (function(){
    var resultMatrix = [
        [0,1,-1,-1,1],
        [-1,0,1,1,-1],
        [1,-1,0,-1,1],
        [1,-1,1,0,-1],
        [-1,1,-1,1,0] ];
        
    function calculate(move1, move2){
        return resultMatrix[move1][move2];
    }
    
    return calculate;
})();