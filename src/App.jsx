import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProblemView from './pages/ProblemView';
import Gallery from './pages/Gallery';
import Docs from './pages/Docs';
import Changelog from './pages/Changelog';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problem/:id" element={<ProblemView />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/changelog" element={<Changelog />} />
      </Routes>
    </Router>
  );
}

export default App;
