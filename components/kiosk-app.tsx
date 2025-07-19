"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import WelcomeScreen from "./welcome-screen"
import CheckinScreen from "./checkin-screen"
import SuccessScreen from "./success-screen"
import axios from 'axios';

type Screen = "welcome" | "checkin" | "success"

export default function KioskApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("checkin")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [points, setPoints] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomePhone] = useState("")
  const [checkinError, setCheckinError] = useState("")
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleWelcomeClick = () => {
    setCurrentScreen("checkin")
  }

  const handleCheckin = async () => {
    console.log("Check-in initiated with phone number:", phoneNumber)
    setCheckinError("")

    try {
      const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/";
      
      // Check for pending orders and perform check-in using the same endpoint
      const res = await axios.post(BACKEND_URL + 'api/checkin/checkin', { 
        phone: phoneNumber
      });
      
      console.log(res.data);
      
      if (res.data.pendingOrder) {
        // If there's a pending order, proceed to success
        setPoints(res.data.rewardPoints || 0);
        setCustomerName(res.data.pendingOrder.name);
        setCustomePhone(res.data.pendingOrder.phone);
        setCurrentScreen("success")
        
        // Reset to welcome screen after 8 seconds
        setTimeout(() => {
          setCurrentScreen("checkin")
          setPhoneNumber("")
          setCustomerName("")
          setCheckinError("")
        }, 8000)
      } else {
        // No pending order found
        setCheckinError("You have no order");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to check in';
        console.log(errorMessage);
        
        if (errorMessage === "You have a waiting order.") {
          // If there's a pending order, allow check-in and proceed to success
          const pendingOrder = err.response?.data?.pendingOrder;
          setPoints(0); // You might want to get actual points from the pending order
          setCustomerName(pendingOrder?.name || customerName);
          setCustomePhone(pendingOrder?.phone || phoneNumber);
          setCurrentScreen("success")
          
          // Reset to welcome screen after 8 seconds
          setTimeout(() => {
            setCurrentScreen("checkin")
            setPhoneNumber("")
            setCustomerName("")
            setCheckinError("")
          }, 8000)
        } else {
          // Show error message and stay on checkin screen
          setCheckinError("You have no order");
        }
      } else {
        console.log('An unexpected error occurred');
        setCheckinError("An unexpected error occurred");
      }
    }
  }
  
  useEffect(() => {
    if (currentScreen !== "checkin") {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/";
    const pollLatestOrder = async () => {
      try {
        const res = await axios.get(BACKEND_URL + "api/orders/latest");
        if (res.data) {
          setCustomerName(res.data.name || "");
          setCustomePhone(res.data.phone || "");
          setPoints(res.data.rewardPoints || 0);
          setCurrentScreen("success");
          // Reset to welcome screen after 8 seconds
          setTimeout(() => {
            setCurrentScreen("checkin");
            setPhoneNumber("");
            setCustomerName("");
            setCheckinError("");
          }, 8000);
        }
      } catch (err) {
        // Ignore 404 (no order found), only log other errors
        if (axios.isAxiosError(err) && err.response?.status !== 404) {
          console.error("Polling error:", err);
        }
      }
    };

    pollingRef.current = setInterval(pollLatestOrder, 60000); // 1 mins
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [currentScreen]);

  return (
    <div className="w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <WelcomeScreen onTap={handleWelcomeClick} />
          </motion.div>
        )}

        {currentScreen === "checkin" && (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <CheckinScreen phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} onCheckin={handleCheckin} customerName={customerName} setCustomerName={setCustomerName} checkinError={checkinError} />
          </motion.div>
        )}

        {currentScreen === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <SuccessScreen points={points} customerName={customerName} customerPhone={customerPhone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
