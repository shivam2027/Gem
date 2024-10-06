import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/login', { // Adjust the endpoint as needed
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle successful login (e.g., redirect or store token)
                console.log('Login successful:', data);
                // Redirect to another page (e.g., dashboard)
                navigate('/dashboard'); // Adjust the path as needed
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
            console.error(err);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/register'); // Navigate to the register page
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form className="login-form" onSubmit={handleLogin}>
                <div className="input-group">
                    <label htmlFor="email">Email</label> <br />
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label> <br />
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
            <p className="register-link">
                New user? <span onClick={handleRegisterRedirect} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>Register here</span>
            </p>
        </div>
    );
};

export default Login;
