const express = require('express');
const app = express();
const PORT = 4000;
const http = require('http').Server(app);
const cors = require('cors');
const socketIO = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000" // where react app run
  }
});
app.use(cors());
let users = [];
socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data);
  });
  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));
  //Listens when a new user joins the server
  socket.on('newUser', (data) => {
    //Adds the new user to the list of users
    users.push(data);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
  });
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });
});

// create node server and share url for socket connection
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`); // 4000 
});
