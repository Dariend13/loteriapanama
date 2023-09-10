import React from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameHistory from './components/GameHistory';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={
            <div>
              <header className="App-header">
                <h1>Ejemplo</h1>
                <AuthForm />
              </header>
            </div>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gamehistory" element={<GameHistory />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
