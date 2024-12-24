import React, { useState } from 'react';

function App() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Backend URL from environment variable or default to localhost
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        body: formData
      });

      if (response.status === 401) {
        setIsLoggedIn(false);
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResults(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </div>
          <button 
            type="submit"
            style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
          >
            Login
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h2>Sentiment Analysis</h2>
      
      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '10px' }}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            display: 'block',
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze File'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {results && (
        <div style={{ marginTop: '20px' }}>
          <h3>Results:</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Distribution:</h4>
            {Object.entries(results.sentiment_distribution).map(([sentiment, count]) => (
              <div key={sentiment}>
                {sentiment}: {count}
              </div>
            ))}
          </div>

          <div>
            <h4>Details:</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Text</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {results.detailed_results.map((result, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.text}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.sentiment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
