import React, { useState } from "react";
import "./../assets/styles/Login.css";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { FaEnvelope } from "react-icons/fa";
import Phone from "../components/login/Phone";
import Email from "../components/login/Email";
import logo from "../assets/images/home/aviator.png";

export default function LoginSignup() {
  const [activeTab, setActiveTab] = useState("phone");
  return (
    <div className="login-screen bg-[url('./assets/images/login/bg.png')] bg-cover h-screen w-full bg-no-repeat')]">
      <div className="login-container w-max h-max flex flex-col justify-center items-center rounded-2xl px-14">
        <h2 className="text-red-700 text-[1.4rem] uppercase font-semibold mb-6 text-center">
          Login
        </h2>

        <div className="w-max mx-auto">
          <div className="mb-4 flex mx-auto">
            <ul
              className="flex flex-wrap -mb-px text-sm font-medium text-center gap-4 mx-auto"
              role="tablist"
            >
              <li className="me-2" role="presentation">
                <button
                  className={`p-2 px-3 cursor-pointer flex gap-2 items-center ${
                    activeTab === "phone"
                      ? "text-white bg-sky-600"
                      : "text-sky-700  bg-sky-200"
                  }`}
                  onClick={() => setActiveTab("phone")}
                  type="button"
                  role="tab"
                  aria-controls="phone"
                  aria-selected={activeTab === "phone"}
                >
                  <MdOutlinePhoneAndroid /> By Phone
                </button>
              </li>
              <li className="me-2" role="presentation">
                <button
                  className={`p-2 px-3  cursor-pointer flex gap-2 items-center ${
                    activeTab === "email"
                      ? "text-white bg-sky-600"
                      : "text-sky-700 bg-sky-200"
                  }`}
                  onClick={() => setActiveTab("email")}
                  type="button"
                  role="tab"
                  aria-controls="email"
                  aria-selected={activeTab === "email"}
                >
                  <FaEnvelope />
                  By Email Id
                </button>
              </li>
            </ul>
          </div>

          <div id="default-styled-tab-content">
            {activeTab === "phone" && <Phone />}
            {activeTab === "email" && <Email />}
          </div>
        </div>
      </div>
    </div>
  );
}
