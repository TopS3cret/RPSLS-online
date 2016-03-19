var GameServer = function(socket){
    this.socket = socket;
};

// Sends a move to the game server
GameServer.prototype.sendMove = function(move){
    this.socket.emit('makeMove', {"move": move});
};

// Sends a request to join a room
GameServer.prototype.joinRoom = function(room, password){
    this.socket.emit('joinRoom', {
        'room': room,
        'password': password
    });
};

// Sends a request to create a room
GameServer.prototype.createRoom = function(room){
    var private = room.password.length > 0 ? true : false;
    this.socket.emit('createRoom', {
        'name': room.name,
        'private': private,
        'password': room.password,
        'turns': room.turns
    } );
};