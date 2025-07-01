import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import LearnMore from './pages/LearnMore';
import Success from './pages/Success';
import Footer from './components/Footer';
import Send from './pages/Send';
import SendToUser from './pages/SendToUser';
import PayUser from './pages/PayUser';
function App() {
  return (
    <>
    <Navbar />
     <Routes>
     <Route path="/" element={<Homepage />} />
     <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/login" element ={<Login /> }/>
      <Route path='/success' element={<Success />} />
      <Route path="/send" element={<Send />} />
      <Route path="/send/:userId" element={<SendToUser />} />
      <Route path="/pay/:userId" element={<PayUser />} />

    </Routes>
    <Footer />
    </>
  );
}
export default App;