import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowRoundBack } from "react-icons/io";
import $ from "jquery";
import "jquery-validation";
const PromocodeSetting = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const initialState = {
    reward: "",
    exprirationDate: "",
  };

  const [data, setData] = useState(initialState);
  useEffect(() => {
    fetchOldData();
  }, []);
  const fetchOldData = async () => {
    try {
      setLoader(true);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getPromoCodeSetting`);
      const response = await res.json();
      console.log(response);
      if (response.success && response.result && response.result.length > 0) {
        setData({
          reward: response.result[0].reward || "",
          exprirationDate: response.result[0].exprirationDate ? response.result[0].exprirationDate.split("T")[0] : "",
        });
      }
    } catch (error) {
      console.error("Error fetching promo code settings:", error);
      toast.error("Failed to fetch promo code settings");
    } finally {
      setLoader(false);
    }
  };
  const validateSettingForm = () => {
    $("#settingform").validate({
      rules: {
        reward: { required: true },
        exprirationDate: { required: true },
      },
      messages: {
        reward: { required: "Please enter reward for using promocode" },
        exprirationDate: { required: "Please enter expiration Date" },
      },
    });
    return $("#settingform").valid();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSettingForm()) {
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/updatePromoCodesetting`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      if (response.success) {
        toast.success("Setting updated Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setTimeout(() => {
          navigate(0);
        }, 1500);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  return (
    <div className="relative">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex items-center">
        <IoIosArrowRoundBack
          onClick={() => navigate(-1)}
          className="bg-[#0472ff] rounded-full hover:scale-110 transition-all text-white text-[40px] cursor-pointer ml-5"
        />
        <div className="text-2xl font-bold mx-2 my-8 px-2">Promocode setting</div>
      </div>
      {loader ? (
        <div className="absolute w-[100%] h-[40%] flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] "
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-[70%] m-auto">
          <form id="settingform" className="w-[60%]">

            <div className="my-4 relative">
              <label
                htmlFor="reward"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Reward
              </label>
              <input
                type="text"
                name="reward"
                id="reward"
                value={data?.reward}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter reward for using promocode"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="exprirationDate"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Expriration Date
              </label>
              <input
                type="date"
                name="exprirationDate"
                id="exprirationDate"
                value={data?.exprirationDate}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter expiration Date"
              />
            </div>

            <button
              type="submit"
              className="text-white bg-[#0472ff] hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5"
              onClick={handleSubmit}
            >
              Save changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PromocodeSetting;
