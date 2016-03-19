var game = (function(){
   var socket = io.connect();
   var server = new GameServer(socket);
   
   var rooms = (function(){
      var container = $("#rooms ul");
      var rooms;
      
      var createRoom = (function (){
         var name = $("#room-name-input");
         var password = $("#room-pass-input");
         var turns = $("#room-turns-input");
         
         var create = function(){
            var room = {
               'name':name.val(),
               'password':password.val(),
               'turns':parseInt(turns.val())
            }
            console.log(room);
            server.createRoom(room);
         };
         
         return create;
      })();
      
      // bind events
      $("#room-create-btn").click(createRoom);
      socket.on("roomsUpdate", roomsUpdate);
      
      
      function roomsUpdate(data){
         console.log(data);
         rooms = data;
         render();
      };
      
      function render(){
         var htmlList = "";
         for(var r in rooms){
            htmlList += "<a href=\"#\"><li>" + rooms[r].name + "</li></a>";
         }
         container.html(htmlList);
      };
   })();
   
    // Bind events
    
   $("#send-move input").click(function(){
      server.sendMove($(this).index());
   });
   
   function logData(data){
      console.log(data);
   }

})();