import React, { useState } from 'react';
import './LoginSignup.css';
import email_icon from '../assets/email_icon.png';
import password_icon from '../assets/password_icon.png';
import user_icon from '../assets/profile_icon.png';
import profile_icon from '../assets/profile_icon.png';
import axios from 'axios';

axios.defaults.baseURL = 'https://localhost:3000';
axios.defaults.withCredentials = true;

const LoginSignup = () => {
  const [action, setAction] = useState('Register');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form submission for Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error message

    // Validate fields
    if (!fullName || !idNumber || !accountNumber || !username || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('/register', {
        fullName,
        idNumber,
        accountNumber,
        username,
        password,
      });
      console.log('Registration successful:', response.data);
      alert('Registered successfully!'); // Popup message
      setAction('Login'); // Change to login after successful registration
      // Clear form fields
      setFullName('');
      setIdNumber('');
      setAccountNumber('');
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage(
        error.response?.data?.message || 'No connection. Please connect to the API'
      );
    }
  };

  // Handle form submission for Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error message

    // Validate fields
    if (!username || !password || !accountNumber) {
      setErrorMessage('Username, password, and account number are required.');
      return;
    }

    try {
      const response = await axios.post('/login', {
        username,
        password,
        accountNumber,  // Include account number in the request
      });
      console.log('Login successful:', response.data);
      alert('Logged In successfully!'); // Popup message
      setAction("Logged In");
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage(
        error.response?.data?.message || 'Too many attempts.'
      );
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={action === 'Register' ? handleRegister : handleLogin}>
          <div className="inputs">
            {action === 'Register' && (
              <>
                <div className="input">
                  <img src={profile_icon} height={25} alt="icon" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div className="input">
                  <img src={profile_icon} height={25} alt="icon" />
                  <input
                    type="number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="ID Number"
                  />
                </div>
              </>
            )}

            {action !== "Logged In" && (
              <>
                <div className="input">
                  <img src={profile_icon} height={25} alt="icon" />
                  <input
                    type="number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account Number"
                  />
                </div>
                <div className="input">
                  <img src={user_icon} height={25} alt="icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                </div>
                <div className="input">
                  <img src={password_icon} height={25} alt="icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
              </>
            )}
          </div>

          {action !== "Logged In" && (
            <div className="submit-container">
              <button className="submit" type="submit">
                {action === 'Register' ? 'Register' : 'Login'}
              </button>
            </div>
          )}

          {action === "Logged In" && <h1>Welcome</h1>}

          {action === "Logged In" && (
            <div className="submit-container">
              <button
                className="submit"
                type="button"
                onClick={() => {
                  setAction("Register");
                  setUsername('');
                  setAccountNumber('');
                  setPassword('');
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;
