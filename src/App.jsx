import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import LearnMore from './pages/LearnMore';
import Success from './pages/Success';
import Send from './pages/Send';
import SendToUser from './pages/SendToUser';
import PayUser from './pages/PayUser';
import PaymentProcessing from './pages/PaymentProcessing';
import PaymentResult from './pages/PaymentResult';
import TransactionDetails from './pages/TransactionDetails';
import PayMobile from './pages/PayMobile';
import PayUpiId from './pages/PayUpiId';
import ProfilePage from './pages/ProfilePage';
import ScanPay from './pages/ScanPay';
import NotificationsPage from './pages/NotificationsPage';
import HelpPage from './pages/HelpPage';
import HelpTransactionDetail from './pages/HelpTransactionDetail';
import SplitTransaction from './pages/SplitTransaction';
import MySplits from './pages/MySplits';
import PaySplit from './pages/PaySplit';
import AddMoney from './pages/AddMoney';
import AnalysisPage from './pages/AnalysisPage';
import ZupPay from './pages/ZupPay';
import ApplyPayLater from './pages/ApplyPayLater';
import ZapPayLaterDashboard from './pages/ZapPayLaterDashboard';
import PayLaterTransactionDetails from './pages/PayLaterTransactionDetails';
import PayDue from './pages/PayDue';
import ExtendDue from './pages/ExtendDue';
import ReferralDetails from './pages/ReferralDetails';
import AdminDashboard from './pages/ AdminDashboard';
import AdminNotifications from './pages/AdminNotifications';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserDetail from './pages/AdminUserDetail';

function App() {
  return (
    <>
    <Navbar />
     <Routes className="min-h-[calc(100vh-3rem)] flex flex-col bg-gray-100 dark:bg-[#0d0d0d]">
     <Route path="/" element={<Homepage />} />
     <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/login" element ={<Login /> }/>
      <Route path='/success' element={<Success />} />
      <Route path="/send" element={<Send />} />
      <Route path="/send/:userId" element={<SendToUser />} />
      <Route path="/pay/:userId/:sendingAmount" element={<PayUser />} />
     <Route path="/pay/:userId/processing" element={<PaymentProcessing />} />
       <Route path="/payment-result" element={<PaymentResult />} />
      <Route path="/transaction/:id" element={<TransactionDetails />} />
      <Route path="/pay-mobile" element={<PayMobile />} />
      <Route path="/pay-id" element={<PayUpiId />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/scan-pay" element={<ScanPay />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/help/:transactionId" element={<HelpTransactionDetail />} />
      <Route path="/split/:txnId" element={<SplitTransaction />} />
      <Route path="/my-splits" element={<MySplits />} />
      <Route path="/pay-split/:splitId" element={<PaySplit />} />
      <Route path="/add-money" element={<AddMoney />} />
      <Route path='/analysis' element={<AnalysisPage />} />
      <Route path="/zuppay" element={<ZupPay />} />
      <Route path='/apply-paylater' element={<ApplyPayLater />} />
      <Route path='/zap-pay-later' element={<ZapPayLaterDashboard />} />
      <Route path="/paylater-txn/:txnId" element={<PayLaterTransactionDetails />} />
      <Route path="/pay-due/:txnId" element={<PayDue />} />
      <Route path="/extend-due/:txnId" element={<ExtendDue />} />
      <Route path="/referral-details" element={<ReferralDetails />} />
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path='/admin/users' element={<AdminUsersPage />} />
      <Route path="/admin/users/:id" element={<AdminUserDetail /> } />
      {/* Catch-all route for 404 */}
      <Route path="*" element={<div className="text-center mt-20 text-gray-600 dark:text-gray-300 ">Page not found</div>} />

  </Routes>
    </>
  );
}
export default App;