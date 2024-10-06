import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Login from './components/login/login';
import Register from './components/register/register';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Sidebar /> <Main /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </Router>
  );
};

export default App;
