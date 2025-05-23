import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Intro from './Pages/intro';
import Login from './Pages/logo';  
import Signup from './Pages/SignupPage';
import Beranda from './Pages/beranda';
import InputPemasukan from './Pages/InputPemasukan';
import InputPengeluaran from './Pages/InputPengeluaran';
import Setting from './Pages/Setting';
import Analisis from './Pages/Analisis';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/beranda" replace />
            ) : (
              <Login onLogin={() => setIsLoggedIn(true)} />
            )
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/beranda"
          element={isLoggedIn ? <Beranda onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/pemasukan"
          element={isLoggedIn ? <InputPemasukan /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/pengeluaran"
          element={isLoggedIn ? <InputPengeluaran /> : <Navigate to="/login" replace />}
        />
        <Route path="/setting" element={<Setting />} />
        <Route
          path="/analisis"
          element={isLoggedIn ? <Analisis /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
