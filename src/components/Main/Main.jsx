import React, { useContext, useState } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

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

  // State to manage dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Function to format result data into paragraphs
  const formatResultData = (data) => {
    const paragraphs = data.split('\n').map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ));
    return paragraphs;
  };

  // Function to handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input) {
      onSent();
    }
  };

  // Function to copy result to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultData)
      .then(() => {
        alert('Result copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className={`main ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} alt="" />
      </div>
      <div className="main-container">
        {showResult
          ? <div className="result">
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
                  : <div className="output-box">
                      {formatResultData(resultData)}
                      <button onClick={copyToClipboard} className="copy-button">Copy to Clipboard</button>
                    </div>
                }
              </div>
            </div>
          : <div className="greet">
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
        }
        <div className="main-bottom">
          <div className="search-box">
            <input 
              onChange={(e) => setInput(e.target.value)} 
              value={input} 
              type="text" 
              placeholder='Enter a prompt here' 
              onKeyPress={handleKeyPress}
            />
            <div>
              <img src={assets.gallery_icon} width={30} alt="" />
              <img src={assets.mic_icon} width={30} alt="" />
              {input ? <img onClick={() => onSent()} src={assets.send_icon} width={30} alt="" /> : null}
            </div>
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
