import React, { useContext, useState, useEffect, useRef } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setInput,
    input
  } = useContext(Context);

  const endOfResultsRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [enableSpeech, setEnableSpeech] = useState(true);
  const [spokenText, setSpokenText] = useState('');
  const [speechQueue, setSpeechQueue] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // State to maintain chat history
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInput(e.target.value); // Update input value
  };


  // const handleKeyPress = async (e) => {
  //   if (e.key === 'Enter' && input.trim()) {
  //     e.preventDefault(); // Prevent form submission

  //     const userMessage = input.trim(); // Get the user message
  //     try {
  //       // Send message to backend
  //       const response = await fetch('/chat', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           userId: 'USER_ID', // Replace with actual user ID
  //           userMessage: userMessage,
  //         }),
  //       });

  //       const data = await response.json();

  //       if (response.ok) {
  //         // Update chat history
  //         setChatHistory((prev) => [...prev, { userMessage, aiResponse: data.aiResponse }]);
  //         setInput(''); // Clear input field
  //       } else {
  //         console.error(data.error);
  //       }
  //     } catch (error) {
  //       console.error('Error sending message:', error);
  //     }
  //   }
  // };
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); // User is logged in
    }
  }, []);
  const [file, setFile] = useState(null); // To store the uploaded file
  // const navigate = useNavigate();
// Handle file selection
const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
      setFile(selectedFile);
      console.log('Selected file:', selectedFile);
  }
};

// Function to handle file upload
const handleFileUpload = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
      const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData,
      });

      if (response.ok) {
          console.log('File uploaded successfully.');
      } else {
          console.error('File upload failed.');
      }
  } catch (error) {
      console.error('Error uploading file:', error);
  }
};

  // Function to sanitize and prepare text for speech
  const prepareTextForSpeech = (text) => {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || ''; // Return the clean text
  };

  // Function to speak a single sentence
  const speakSentence = (sentence) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.rate = 1.4; // Increased rate for faster speech
      utterance.pitch = 1; // Normal pitch

      utterance.onend = () => {
        resolve(); // Resolve promise when finished
      };

      speechSynthesis.speak(utterance);
    });
  };

  // Function to process the speech queue
  const processSpeechQueue = async () => {
    if (speechQueue.length > 0 && !isSpeaking) {
      setIsSpeaking(true);
      const sentence = speechQueue[0];
      await speakSentence(sentence);
      setSpeechQueue((prevQueue) => prevQueue.slice(1));
      setIsSpeaking(false);
    }
  };

  // Effect to handle speech queue
  useEffect(() => {
    processSpeechQueue();
  }, [speechQueue, isSpeaking]);

  // Modified function to speak text in chunks
  const speakInChunks = (newText) => {
    if (enableSpeech) {
      const unsaidText = newText.substring(spokenText.length);
      if (unsaidText.trim() === '') return;

      const cleanText = prepareTextForSpeech(unsaidText);
      const sentences = cleanText.split(/(?<=[.!?])\s+/); // Split by sentence ending with punctuation

      setSpeechQueue((prevQueue) => [...prevQueue, ...sentences]);
      setSpokenText(newText);
    }
  };

  // Effect to handle resultData changes
  useEffect(() => {
    if (resultData && !loading) {
      speakInChunks(resultData);
    }
  }, [resultData, loading]);

  // Function to stop speaking
  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setSpeechQueue([]);
    setIsSpeaking(false);
  };

  const formatResultDataAsHTML = (data) => {
    return { __html: data };
  };

  const formatResultDataAsParagraphs = (data) => {
    const codeRegex = /`{3}(.*?)`{3}/gs;
    const result = [];
    const lines = data.split('\n');

    lines.forEach((line, index) => {
      const codeMatch = line.match(codeRegex);
      if (codeMatch) {
        const codeContent = codeMatch[1].trim();
        result.push(
          <p key={index} style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '5px' }}>
            {codeContent}
          </p>
        );
      } else {
        if (line.includes('<') && line.includes('>')) {
          result.push(
            <div key={index} dangerouslySetInnerHTML={formatResultDataAsHTML(line)} />
          );
        } else if (line.trim() !== "") {
          result.push(<p key={index}>{line}</p>);
        }
      }
    });

    return <>{result}</>;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleNewSearch();
    }
  };

  const handleNewSearch = () => {
    if (!input.trim()) return;
    onSent();
    setInput('');
    setSpokenText(''); // Reset spoken text when a new search is started
  };

  const copyToClipboard = () => {
    if (resultData) {
      navigator.clipboard.writeText(resultData)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  useEffect(() => {
    if (endOfResultsRef.current) {
      endOfResultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [resultData]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started. Speak into the microphone.');
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        console.log('You said:', transcript);
        handleNewSearch();
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error occurred in recognition: ', event.error);
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Speech Recognition is not supported in this browser.');
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
    }
  };
  
  const handleRegister = () => {
    console.log("Register button clicked");
    // Redirect to /register
    navigate('/register'); 
  };

  const handleLogin = () => {
    console.log("Login button clicked");
    // Simulating a successful login (replace with actual login logic)
    setIsLoggedIn(true);
    // Redirect to /login or wherever needed
    navigate('/login'); 
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Redirect to /xyz when profile icon is clicked
  };

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <div className="button-container">
          {isLoggedIn ? (
            <img 
              src={assets.user_icon} 
              alt="Profile" 
              onClick={handleProfileClick} 
              style={{ cursor: 'pointer', width: '30px', height: '30px' }} 
            />
          ) : (
            <>
              <button className="button" onClick={handleRegister}>Register</button>
              <button className="button" onClick={handleLogin}>Login</button>
            </>
          )}
        </div>
      </div>
      <div className="main-container">
        {showResult && (
          <div className="result">
            <div className='result-title'>
              <img src={assets.user_icon} alt="" />
              <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
              <img src={assets.gemini_icon} alt="" />
              {loading
                ? <div className="loader">
                  <hr className="animated-bg" />
                  <hr className="animated-bg" />
                  <hr className="animated-bg" />
                </div>
                : (
                  <div className="output-box">
                    {formatResultDataAsParagraphs(resultData)}
                    <div ref={endOfResultsRef} />
                    <button onClick={copyToClipboard} className="copy-button">Copy</button>
                    {enableSpeech && (
                      <button onClick={stopSpeaking} className="copy-button" style={{ marginLeft: '10px' }}>Stop Speaking</button>
                    )}
                  </div>
                )}
            </div>
          </div>
        )}

        {copySuccess && <div className="copy-notification">Copied!</div>}

        {!showResult && (
          <div className="greet">
            <p><span>Hello, Dev.</span></p>
            <p>How can I help you today?</p>
            <div className="cards">
              <div className="card">
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="" />
              </div>
              <div className="card">
                <p>Briefly summarize this concept: urban planning</p>
                <img src={assets.bulb_icon} alt="" />
              </div>
              <div className="card">
                <p>Brainstorm team bonding activities for our work retreat</p>
                <img src={assets.message_icon} alt="" />
              </div>
              <div className="card">
                <p>Improve the readability of the following code</p>
                <img src={assets.code_icon} alt="" />
              </div>
            </div>
          </div>
        )}

        <div className="main-bottom">
          <div className="search-box">
            <input
              onChange={handleInputChange}
              value={input}
              type="text"
              placeholder='Enter a prompt here'
              onKeyDown={handleKeyDown}
            />
            <div>
            <label style={{ cursor: 'pointer' }}>
            <img 
              src={assets.gallery_icon} 
              width={30} 
              alt="Gallery" 
              onClick={() => document.getElementById('file-input').click()} 
            />
            <input 
              type="file" 
              id="file-input" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
              accept="image/*" // Accepts image files
            />
          </label>
              <img 
                src={assets.mic_icon} 
                width={30} 
                alt="" 
                onClick={toggleListening}
                style={{ cursor: 'pointer', color: isListening ? 'red' : 'black' }}
              />
              {input && <img onClick={handleNewSearch} src={assets.send_icon} width={30} alt="" />}
            </div>
          </div>
          <div className="speech-control" style={{ marginTop: '10px', color: 'white' }}>
            <label>
              <input 
                type="checkbox" 
                checked={enableSpeech} 
                onChange={() => {
                  setEnableSpeech(!enableSpeech);
                  if (!enableSpeech) {
                    stopSpeaking();
                  }
                }} 
                style={{ marginRight: '5px' }}
              />
              
              <span style={{ fontSize: '16px', marginLeft: '5px' ,color: 'grey'}}>Enable speech output</span>
            </label>
          </div>

          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so double-check its responses. Your privacy and Gemini Apps
          </p>
        </div>
      </div>
    </div>
  );
}

export default Main;
