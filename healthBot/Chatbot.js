import React, { useEffect, useRef, useState } from "react";
import "./Chatbot.css";
import { findResponse } from "./data/botMessagesHandle";
import { readStudentDatafromxl } from "./data/botFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRefresh } from "@fortawesome/free-solid-svg-icons";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: "bot", text: "Hello.. I'm listening! Go on..", },
    // can also send multiple messages at a time // {obj-1},{obj-2}
    /*messages object has: 
    id='bot/user', 
    text='' , 
    typing='Typing...', 
    delay='animation delay',
    animate=true/false,
    defaultClass='', 
    type='button/input',
    typeMsg=[] buttons messages or payload messages */
  ]);
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const isAnyMessageAnimating = messages.some(message => message.animate);
  const diagnose = /\b[0-9]{1}[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}\b/i;

  function output(input) {
    userMessageSend({ text: input });
    const lowerInput = input.toLowerCase();
    const includesDiagnose = ["diagnose", "symptoms"].some(keyword => lowerInput.includes(keyword));
    const diagnose_exp = diagnose.test(lowerInput) ? lowerInput.match(diagnose)[0] : null;

    if (includesDiagnose || diagnose_exp) {
      if (diagnose_exp) {
        readStudentDatafromxl(diagnose_exp)
          .then(message => { botMessageSend(message) })
      } else {
        botMessageSend({ text: "Enter Symptoms 📝"});
      }
    } else {
      botMessageSend({ text: findResponse(lowerInput) });
    }
  }

  function userMessageSend(...messages) {
    const updatedMessages = messages.map((message) => {
      const { text, defaultClass } = message;
      const newMessage = { id: "user", text, defaultClass };
      return newMessage;
    });
    setMessages((prevMessages) => [...prevMessages, ...updatedMessages]);
  }

  async function botMessageSend(...messages) {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const { text, typing = 'Typing...', delay = 1000, defaultClass, type, typeMsg = ['Ok'] } = message;
      const newMessage = { id: 'bot', text, typing, delay, animate: true, defaultClass };

      await new Promise((resolve) => {
        setTimeout(() => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          if (type === 'button') {
            newMessage.text = `${text}<br/>
            ${typeMsg.map((value,index) => `<button id="bot-btn-${Date.now()}-${index}" class='quickmessage bot-btn'>${value}</button>`).join('')}`;
            setMessages((prevMessages) => [...prevMessages.slice(0, -1), newMessage]);
          }

          setTimeout(() => {
            setMessages((prevMessages) => {
              const index = prevMessages.findIndex((msg) => msg === newMessage);
              if (index !== -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[index] = { ...newMessage };
                return updatedMessages;
              }
              return prevMessages;
            });
            resolve();
            newMessage.animate = false;
          }, delay);
        }, 100);// delay before the next message
      });
    }
  }

  function handleInputSend(btnMessage) {
    const messageToSend = typeof btnMessage === 'string' ? btnMessage : inputRef.current.value;
    if (messageToSend) {
      output(messageToSend);
      inputRef.current.value = "";
    }
  }

  function reset() {
    setMessages([{ id: "bot", text: "Hello.. I'm listening! Go on.." }]);
  }

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    function handleButtonClick(event) {
      const clickedButtonId = event.target.id;
      const clickedButton = document.getElementById(clickedButtonId);
      if (clickedButtonId.startsWith('bot-btn')) {
        userMessageSend({ text: clickedButton.innerText });
        // handleInputSend(clickedButton.innerText)
        // handle http interaction
      }
    }
  
    var messageSection = document.getElementById('message-section');
    messageSection.addEventListener('click', handleButtonClick);
  
    return () => {
      messageSection.removeEventListener('click', handleButtonClick);
    };
  }, []);


  return (
    <div className="chatbot">
      <div id="botheader">
        <h1>HealthBot+</h1>
        <button className="send" onClick={reset}>
          <div className="circle refresh">
            <FontAwesomeIcon className="icon-block" icon={faRefresh} />
          </div>
        </button>
      </div>
      <hr />
      <div
        id="message-section"
        ref={messageContainerRef}
        className="message-container"
      >
        {messages.map((message, index) => (
          <span
            className={`message ${message.id === 'bot' && message.animate ? 'typing-animation' : ''}'`}
            key={index}
            id={message.id}
          >
            {message.animate ? (
              <span>{message.typing}</span>
            ) : (
              <span className={`${message.defaultClass && message.defaultClass}`}>
                <span dangerouslySetInnerHTML={{ __html: message.text }} />
              </span>
            )}
          </span>
        ))}
      </div>
      <div id="input-section">
        <div className="allquickbtn">
          <button
            tabIndex="1"
            className="quickmessage"
            onClick={() => handleInputSend("Diagnose 🤒")}
            disabled={isAnyMessageAnimating}
          >
            Diagnose 🤒
          </button>
          <button
            tabIndex="2"
            className="quickmessage"
            onClick={() => handleInputSend("Contact 📞")}
            disabled={isAnyMessageAnimating}
          >
            Contact 📞
          </button>
        </div>
        <div className="input-flex">
          <input
            ref={inputRef}
            style={{ padding: "0.6rem", paddingLeft: '1rem' }}
            type="text"
            placeholder="Type a message..."
            autoFocus="autofocus"
            tabIndex="3"
            onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
            disabled={isAnyMessageAnimating}
          />
          <button
            type="submit"
            className="send"
            onClick={handleInputSend}
            tabIndex="3"
            disabled={isAnyMessageAnimating}
          >
            <div className="circle">
              <FontAwesomeIcon className="icon-block" icon={faPaperPlane} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
