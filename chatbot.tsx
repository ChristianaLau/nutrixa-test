'use client';

import { useState, useEffect } from 'react';
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { currentUser } from '@clerk/nextjs';
import connect from "@/lib/db";
import mongoose from "mongoose";

console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_KEY);

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function Chatbot() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [chat, setChat] = useState<any>(null);
  const [diets, setDiets] = useState<any>(null);
  const [goal, setGoal] = useState<any>(null);
  const [person, setPerson] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await currentUser();
        if (!user) {
          console.error('User not authenticated');
          return;
        }

        const email = user.emailAddresses[0].emailAddress;
        await connect();
        console.log("Connected to DB");

        const db = mongoose.connection.db;
        const collection = db.collection("Nutrixa_Users");

        const userDoc = await collection.findOne({ email: email });
        if (!userDoc) {
          console.error('User not found in the database');
          return;
        }

        setDiets(userDoc.diets);
        setGoal(userDoc.goal);
        setPerson(userDoc.person);

        const chatInstance = await model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: Hello, Gemini, this is a pre-introduction to ${userDoc.person.firstName}. This individual is ${userDoc.person.height} tall, ${userDoc.person.weight}kg, on a ${userDoc.diets.vegan ? 'vegan' : 'non-vegan'} diet and ${userDoc.person.gender}. Please greet them, then help them with any general health questions. The chat with ${userDoc.person.firstName} will start now. }],
            },
            {
              role: "model",
              parts: [{ text: "I'm Ready" }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });
        setChat(chatInstance);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {
    if (message.trim() && chat) {
      setMessages([...messages, You: ${message}]);
      setMessage('');

      try {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = await response.text();

        const formattedText = text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br/>');

        setMessages([...messages, You: ${message}, King George III: ${formattedText}]);
      } catch (error) {
        console.error('Error occurred while sending message:', error);
        setMessages([...messages, You: ${message}, King George III: Error occurred]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen">
      <h1 className="text-2xl mt-24 mb-12 text-center">
        Say hi to your personal fitness buddy, King George III
      </h1>

      <div
        className="p-2 border-4 border-gray-300 rounded text-sm"
        style={{ width: '800px', height: '700px', overflowY: 'scroll' }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={p-2 rounded mb-2 ${msg.startsWith('You:') ? 'bg-blue-500 text-white' : 'bg-gray-300'}}
            dangerouslySetInnerHTML={{ __html: msg.replace(/^King George III: /, '') }}
          />
        ))}
      </div>

      <div
        className="bg-gray-300 border-2 border-gray-700 flex items-center p-2"
        style={{ width: '800px', height: '200px' }}
      >
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type Here"
          className="p-2 border border-gray-700 rounded-full text-lg flex-grow"
          style={{ marginRight: '10px', height: '80px' }}
          onKeyDown={handleKeyDown}
        />
        <img
          src="/send.png"
          onClick={handleSend}
          style={{ width: '50px', height: '50px', cursor: 'pointer' }}
          alt="Send Icon"
        />
      </div>
      <img 
        src="/bot_icon.gif" 
        className="w-full h-full object-cover"
        style={{ height: '100%', width: '100%' }}
        alt="Bot Icon"
      />
    </main>
  );
}
