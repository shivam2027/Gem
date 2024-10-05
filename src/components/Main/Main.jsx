import React, { useContext, useState, useEffect, useRef } from 'react';
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

  const endOfResultsRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const formatResultDataAsHTML = (data) => {
    return { __html: data }; // Convert to an object for dangerouslySetInnerHTML
  };
  
  const formatResultDataAsParagraphs = (data) => {
    const codeRegex = /`{3}(.*?)`{3}/gs; // Updated regex for code blocks
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

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} alt="" />
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
                    {formatResultDataAsParagraphs(resultData)} {/* This handles both cases */}
                    <div ref={endOfResultsRef} /> {/* Add this ref to scroll to the bottom */}
                  </div>
                )
              }
              {resultData && !loading && ( // Show the copy button only when there is resultData and loading is false
                <button onClick={copyToClipboard} className="copy-button">Copy</button>
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
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder='Enter a prompt here'
              onKeyDown={handleKeyDown}
            />
            <div>
              <img src={assets.gallery_icon} width={30} alt="" />
              <img src={assets.mic_icon} width={30} alt="" />
              {input && <img onClick={handleNewSearch} src={assets.send_icon} width={30} alt="" />}
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
