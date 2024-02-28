import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const host = "http://localhost:5000";
const socket = socketIOClient(host, { transports: ["websocket"] });

const App = () => {
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [inputId, setInputId] = useState('');

  const generateUserId = () => {
    return Math.random().toString(36).substring(7);
  };

  useEffect(() => {
    const newSenderId = generateUserId();
    setSenderId(newSenderId);
    setReceiverId(generateUserId());
  }, []);

  useEffect(() => {
    socket.on('newMessage', message => {
      setMessages([...messages, message]);
    });

    // Fetch old messages when component mounts
    socket.emit('getOldMessages', receiverId);


  }, [receiverId]);

  const sendMessage = () => {
    const message = { sender: senderId, receiver: receiverId, content };
    socket.emit('sendMessage', message);
    setContent('');
  };

  const handleSubmitId = (e) => {
    e.preventDefault();
    setSenderId(inputId);
    // Join the room corresponding to the sender ID
    socket.emit('join', inputId);
  };

  return (
    <div>
      <h1>Simple Messaging App</h1>
      <div>
        <form onSubmit={handleSubmitId}>
          <input type="text" placeholder="Your ID" value={inputId} onChange={(e) => setInputId(e.target.value)} />
          <button type="submit">Submit</button>
        </form>
        <p><strong>Sender ID:</strong> {senderId}</p>
        <input type="text" placeholder="Receiver ID" value={receiverId} onChange={e => setReceiverId(e.target.value)} />
        <input type="text" placeholder="Message" value={content} onChange={e => setContent(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              <strong>Sender:</strong> {message.sender}<br />
              <strong>Receiver:</strong> {message.receiver}<br />
              <strong>Message:</strong> {message.content}<br />
              <strong>Timestamp:</strong> {message.timestamp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
