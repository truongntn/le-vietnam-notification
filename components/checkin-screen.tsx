"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import io from "socket.io-client";

interface CheckinScreenProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onCheckin: () => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  checkinError?: string;
}

export default function CheckinScreen({
  phoneNumber,
  setPhoneNumber,
  onCheckin,
  customerName,
  setCustomerName,
  checkinError,
}: CheckinScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAgreed, setIsAgreed] = useState(true); // Pre-checked for better UX

  const [status, setStatus] = useState("Disconnected");
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://le-vietnam-checkin-backend.onrender.com",
      { withCredentials: true }
    );
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setStatus("Connected");
      setMessage("Connected to the server");
    });

    socketInstance.on("disconnect", () => {
      setStatus("Disconnected");
      setMessage("Disconnected from the server");
    });

    socketInstance.on("phoneResponse", (response) => {
      setMessage(`Server: ${response.message}`);
      if (response.status === "success") {
        console.log("Phone number sent successfully");
        onCheckin();
      } else {
        console.error("Error:", response.message);
      }
    });

    socketInstance.on("receivePhoneNumber", (data) => {
      setPhoneNumber(data.phoneNumber);
      if (data.phoneNumber && /^\d{10}$/.test(data.phoneNumber)) {
        setPhoneNumber(data.phoneNumber);
        setMessage(`Received phone number from server: ${data.phoneNumber}`);
      } else {
        setMessage("Invalid phone number received from server");
      }
    });

    socketInstance.on("checkin", (data) => {
      console.log(data.phoneNumber);
      onCheckin();
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [setPhoneNumber, onCheckin]);

  const handleNumberClick = (num: string) => {
    if (phoneNumber.length < 10) {
      setPhoneNumber(phoneNumber + num);
    }
  };

  const handleClear = () => {
    setPhoneNumber("");
    setCustomerName("");
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleCheckin = () => {
    // Only proceed if phone number is valid
    if (phoneNumber.length >= 10) {
      console.log("Checking in with phone number:", phoneNumber);
      onCheckin();
    } else {
      // Visual feedback that more digits are needed
      const phoneInput = document.querySelector(".phone-input");
      if (phoneInput) {
        phoneInput.classList.add("shake-animation");
        setTimeout(() => {
          phoneInput.classList.remove("shake-animation");
        }, 500);
      }
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 0) return "";
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const slides = [
    {
      title: "10% OFF",
      subtitle: "WHEN YOU REDEEM",
      highlight: "10 REWARD POINTS",
    },
    {
      title: "FREE BREAD",
      subtitle: "WITH PURCHASE OF",
      highlight: "FULL SET",
    },
    {
      title: "REFER A FRIEND",
      subtitle: "AND EARN",
      highlight: "5 BONUS POINTS",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side - Promotional Content 
      <div
        className="w-full md:w-1/2 p-6 flex flex-col h-full"
        style={{ backgroundColor: "#070923" }}
      >
        <div className="mb-4 text-center">
          <div className="w-48 h-auto mx-auto mb-2">
            <Image
              src="/images/perdigi-logo.png"
              alt="Perdigi Logo"
              width={200}
              height={80}
              priority
            />
          </div>
          <h2
            className="text-white text-2xl font-bold mb-1"
            style={{ color: "#F3B5FD" }}
          >
            Check-In System
          </h2>
          <p className="text-white text-sm" style={{ color: "#F3B5FD" }}>
            0433 605 645
          </p>
        </div>

        <div className="flex-1 flex items-start justify-center relative pt-20">
          <motion.div
            className="w-full flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={prevSlide}
              className="absolute left-0 z-10 bg-white/20 hover:bg-white/40 rounded-full w-10 h-10 flex items-center justify-center -ml-1 transform -translate-x-1/2 transition-all duration-300 backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <div className="w-full overflow-hidden rounded-2xl shadow-lg">
              <motion.div
                className="flex h-64" 
                initial={{ x: 0 }}
                animate={{ x: -currentSlide * 100 + "%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {slides.map((slide, index) => (
                  <div key={index} className="min-w-full h-full">
                    <div className="bg-white p-6 w-full h-full mx-auto flex flex-col items-center justify-center">
                      <h3
                        className="text-5xl font-bold"
                        style={{ color: "#f05122" }}
                      >
                        {slide.title}
                      </h3>
                      <p className="text-gray-700 uppercase text-sm font-medium mt-4">
                        {slide.subtitle}
                      </p>
                      <p
                        className="text-4xl font-bold mt-2"
                        style={{ color: "#000000" }}
                      >
                        {slide.highlight}
                      </p>

                      {index === 0 && (
                        <div className="mt-4 flex items-center">
                          <motion.div
                            className="w-8 h-8 rounded-full bg-yellow-400 mr-2"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          />
                          <motion.div
                            className="w-6 h-6 rounded-full bg-red-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: 0.5,
                            }}
                          />
                        </div>
                      )}

                      {index === 1 && (
                        <div className="mt-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#f05122"
                            strokeWidth="1"
                          >
                            <path d="m4.6 13.11 5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23.16.79 15.23 4.6 13.11Z"></path>
                            <path d="m10.5 9.5-1-2.29C9.2 6.48 8.8 6 8 6H4.5C2.79 6 2 6.5 2 8.5a7.71 7.71 0 0 0 2 4.83"></path>
                            <path d="M8 6c0-1.55.24-4-2-4-2 0-2.5 2.17-2.5 4"></path>
                            <path d="m14.5 13.5 2.29 1c.73.3 1.21.7 1.21 1.5v3.5c0 1.71-.5 2.5-2.5 2.5a7.71 7.71 0 0 1-4.83-2"></path>
                            <path d="M18 16c1.55 0 4-.24 4 2 0 2-2.17 2.5-4 2.5"></path>
                          </svg>
                        </div>
                      )}

                      {index === 2 && (
                        <div className="mt-4 flex">
                          <motion.div
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black text-white mr-2"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          >
                            <span>+</span>
                          </motion.div>
                          <motion.div
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black text-white"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: 0.5,
                            }}
                          >
                            <span>5</span>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-0 z-10 bg-white/20 hover:bg-white/40 rounded-full w-10 h-10 flex items-center justify-center -mr-1 transform translate-x-1/2 transition-all duration-300 backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </motion.div>
        </div>

        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className={`h-2 rounded-full ${
                currentSlide === dot ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
              animate={{ width: currentSlide === dot ? 24 : 8 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <div className="flex-1"></div>

        <div className="mt-4">
          <label className="flex items-start text-white text-sm bg-white/10 p-2 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 mr-2 w-4 h-4"
              style={{ accentColor: "#000000" }}
              checked={isAgreed}
              onChange={() => setIsAgreed(!isAgreed)}
            />
            <span style={{ color: "#F3B5FD" }}>
              By entering my phone number and name, I agree to receive{" "}
              <strong>Le Vietnam</strong> notifications via auto text!
              Unsubscribe anytime and still participate in{" "}
              <strong>Le Vietnam</strong>.
            </span>
          </label>
        </div>
      </div>*/}

      {/* Right Side - Phone Entry */}
      <div
        className="w-full md:w-1/1 bg-white p-6 flex flex-col justify-center items-center w-full h-full"
        style={{ backgroundColor: "#070923" }}
      >
        <div
          className="w-full max-w-xl p-12"
          style={{
            backgroundColor: "#070923",
            border: "3px solid",
            borderImage: "linear-gradient(45deg, #31DCFF, #F88BFE, #A2C0FE) 1",
            boxShadow: `
      0 0 20px rgba(49, 220, 255, 0.4),
      0 0 40px rgba(248, 139, 254, 0.3),
      0 0 60px rgba(162, 192, 254, 0.2),
      inset 0 0 20px rgba(49, 220, 255, 0.1)
    `,
          }}
        >
          {/*<div className="flex justify-end mb-4">
          <div className="flex items-center">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center mr-1"
              style={{ backgroundColor: "#f05122" }}
            >
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-gray-800">
              <Image
                src="/images/le-vietnam.png"
                alt="Le Vietnam Logo"
                width={100}
                height={40}
                priority
              />
            </span>
          </div>
        </div>*/}

          <div className="text-center mb-4">
            <h2
              className="text-2xl font-bold text-gray-800 mb-1"
              style={{
                color: "#F3B5FD",
                textShadow:
                  "0 0 5px #F3B5FD, 0 0 10px #F3B5FD, 0 0 15px #F3B5FD",
                fontFamily: "monospace",
                fontWeight: 700,
                display: "block",
                fontSize: "1.8rem",
              }}
            >
              PLEASE ENTER YOUR<br></br>PASSWORD
            </h2>
            {/*<p className="text-gray-600 text-sm" style={{ color: "#F3B5FD" }}>
              Your info will not be shared with any third party
            </p>*/}
          </div>

          <div className="mb-8">
            <div
              className="phone-input h-14 border-2 border-gray-200 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-800"
              style={{ color: "#fff" }}
            >
              {formatPhoneNumber(phoneNumber) || "xxx-xxx-xxxx"}
            </div>
            {checkinError && (
              <div className="mt-2 text-center">
                <p
                  style={{
                    color: "#F3B5FD",
                    textShadow:
                      "0 0 5px #F3B5FD, 0 0 10px #F3B5FD, 0 0 15px #F3B5FD",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    display: "block",
                    fontSize: "1.2rem",
                  }}
                >
                  {checkinError}
                </p>
              </div>
            )}
          </div>
          {/*<div className="mb-8">
            <div
              className="phone-input h-14 border-2 border-gray-200 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-800"
              style={{ color: "#F3B5FD" }}
            >
              <input
                type="text"
                // value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full text-center text-black focus:outline-none"
                style={{ backgroundColor: "#070923", color: "#fff" }}
                //onClick={() => setActiveInput("name")}
              />
            </div>
          </div>*/}
          {/*} <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
              <motion.button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 rounded-full border flex items-center justify-center text-2xl font-medium transition-colors"
                style={{
                  borderColor: `linear-gradient(45deg, #31DCFF, #F88BFE, #A2C0FE)`,
                  color: "#31DCFF",
                  boxShadow: `
          0 0 10px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.3)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.3)"
              : "rgba(162, 192, 254, 0.3)"
          },
          0 0 20px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.2)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.2)"
              : "rgba(162, 192, 254, 0.2)"
          },
          0 0 30px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.1)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.1)"
              : "rgba(162, 192, 254, 0.1)"
          },
          inset 0 0 10px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.1)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.1)"
              : "rgba(162, 192, 254, 0.1)"
          }
        `,
                }}
                whileHover={{
                  boxShadow: `
          0 0 15px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.5)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.5)"
              : "rgba(162, 192, 254, 0.5)"
          },
          0 0 30px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.3)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.3)"
              : "rgba(162, 192, 254, 0.3)"
          },
          0 0 45px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.2)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.2)"
              : "rgba(162, 192, 254, 0.2)"
          },
          inset 0 0 15px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.2)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.2)"
              : "rgba(162, 192, 254, 0.2)"
          }
        `,
                }}
                whileTap={{
                  scale: 0.95,
                  backgroundColor:
                    index % 3 === 0
                      ? "rgba(49, 220, 255, 0.1)"
                      : index % 3 === 1
                      ? "rgba(248, 139, 254, 0.1)"
                      : "rgba(162, 192, 254, 0.1)",
                  boxShadow: `
          0 0 20px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.7)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.7)"
              : "rgba(162, 192, 254, 0.7)"
          },
          0 0 40px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.4)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.4)"
              : "rgba(162, 192, 254, 0.4)"
          },
          0 0 60px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.3)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.3)"
              : "rgba(162, 192, 254, 0.3)"
          },
          inset 0 0 20px ${
            index % 3 === 0
              ? "rgba(49, 220, 255, 0.3)"
              : index % 3 === 1
              ? "rgba(248, 139, 254, 0.3)"
              : "rgba(162, 192, 254, 0.3)"
          }
        `,
                }}
              >
                {num}
              </motion.button>
            ))}
            <motion.button
              onClick={handleClear}
              className="h-16 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              whileTap={{
                scale: 0.95,
                backgroundColor: "rgba(156, 163, 175, 0.1)",
              }}
            >
              <ArrowLeft className="h-6 w-6" />
            </motion.button>
            <motion.button
              onClick={() => handleNumberClick("0")}
              className="h-16 rounded-full border flex items-center justify-center text-2xl font-medium transition-colors"
              style={{
                borderColor: "#F88BFE",
                padding: "2px",
                color: "#31DCFF",
                boxShadow: `
          0 0 10px rgba(248, 139, 254, 0.3),
          0 0 20px rgba(248, 139, 254, 0.2),
          0 0 30px rgba(248, 139, 254, 0.1),
          inset 0 0 10px rgba(248, 139, 254, 0.1)
        `,
              }}
              whileHover={{
                boxShadow: `
          0 0 15px rgba(49, 220, 255, 0.5),
          0 0 30px rgba(248, 139, 254, 0.3),
          0 0 45px rgba(162, 192, 254, 0.2),
          inset 0 0 15px rgba(49, 220, 255, 0.2)
        `,
              }}
              whileTap={{
                scale: 0.95,
                boxShadow: `
          0 0 20px rgba(49, 220, 255, 0.7),
          0 0 40px rgba(248, 139, 254, 0.4),
          0 0 60px rgba(162, 192, 254, 0.3),
          inset 0 0 20px rgba(49, 220, 255, 0.3)
        `,
              }}
            >
              0
            </motion.button>
            <motion.button
              onClick={handleBackspace}
              className="h-16 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              whileTap={{
                scale: 0.95,
                backgroundColor: "rgba(156, 163, 175, 0.1)",
              }}
            >
              <X className="h-6 w-6" />
            </motion.button>
          </div>

          <div className="mt-auto mb-4">
            <motion.button
              onClick={handleCheckin}
              className={`w-full py-5 rounded-full text-white font-bold text-xl transition-colors relative overflow-hidden`}
              style={{
                backgroundColor:
                  phoneNumber.length >= 10
                    ? "#f05122"
                    : "rgba(240, 81, 34, 0.6)",
                color: "#fff",
              }}
              whileHover={phoneNumber.length >= 10 ? { scale: 1.02 } : {}}
              whileTap={phoneNumber.length >= 10 ? { scale: 0.98 } : {}}
            >
              {phoneNumber.length < 10 && (
                <span className="absolute inset-0 flex items-center justify-center">
                  {10 - phoneNumber.length} more digits needed
                </span>
              )}
              <span className={phoneNumber.length < 10 ? "opacity-0" : ""}>
                CHECK-IN
              </span>
            </motion.button>
          </div>*/}
        </div>{" "}
      </div>
    </div>
  );
}
