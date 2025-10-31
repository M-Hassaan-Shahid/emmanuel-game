import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Payment = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [noData, setNoData] = useState(false);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("recharge"); // State for active tab

  useEffect(() => {
    fetchPayment();
    fetchWithdrawals(); // Fetch withdrawal data
    fetchKycRequests(); // Fetch KYC data
  }, [page, search]);

  const fetchuserName = async (id) => {
    const userRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const userData = await userRes.json();
    return userData.success ? userData.result : "Unknown";
  };

  const fetchPayment = async () => {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/getpayment?page=${page}&limit=${pageSize}&search=${search}&transactionType=recharge&status=pending`
          );
          const response = await res.json();
      if (response.success) {
        const paymentWithuser = await Promise.all(
            response.result.map(async (users) => {
              const user = await fetchuserName(users.user_id);
              const username = user.username;
              const user_id = user.u_id;
              return {
                ...users,
                username,
                user_id,
              };
            })
          );
          setPayment(paymentWithuser);
        //setPayment(response.result);
        setNoData(response.result.length === 0);
        setCount(response.count);
        setLoader(false);
      }
    } catch (error) {
        setLoader(false);
      console.error("Error fetching withdrawals:", error);
    }
  };

  const fetchWithdrawals = async () => {
    // Fetch withdrawal requests (adjust the API endpoint as necessary)
    try {
        const res = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/getpayment?page=${page}&limit=${pageSize}&search=${search}&transactionType=withdraw&status=pending`
          );  const response = await res.json();
      if (response.success) {
        const paymentWithuser = await Promise.all(
            response.result.map(async (users) => {
              const user = await fetchuserName(users.user_id);
              const username = user.username;
              const user_id = user.u_id;
              return {
                ...users,
                username,
                user_id,
              };
            })
          );
          setWithdrawals(paymentWithuser);
        setNoData(response.result.length === 0);
        setCount(response.count);
        setLoader(false);
      }
    } catch (error) {
        setLoader(false);
      console.error("Error fetching withdrawals:", error);
    }
  };

  const fetchKycRequests = async () => {
    // Fetch KYC requests (adjust the API endpoint as necessary)
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllUserBank?page=${page}&limit=${pageSize}&search=${search}&kycstatus=pending`);
      const response = await res.json();
      if (response.success) {


        const paymentWithuser = await Promise.all(
            response.result.map(async (users) => {
              const user = await fetchuserName(users.user_id);
              const username = user.username;
              const user_id = user.u_id;
              return {
                ...users,
                username,
                user_id,
              };
            })
          );
          setKycRequests(paymentWithuser);
       // setKycRequests(response.result);
        setNoData(response.result.length === 0);
        setCount(response.count);
        setLoader(false);
      }
    } catch (error) {
        setLoader(false);
      console.error("Error fetching KYC requests:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearch(value);
      setPage(1);
    } 
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Change active tab
    setPage(1); // Reset to the first page on tab change
  };


  const startIndex = (page - 1) * pageSize;
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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Request</div>
      </div>
      <div className="flex justify-center mb-4">
        <button 
          className={`py-2 px-4 mr-2 ${activeTab === 'recharge' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}
          onClick={() => handleTabChange('recharge')}
        >
          Recharge Requests
        </button>
        <button 
          className={`py-2 px-4 mr-2 ${activeTab === 'withdraw' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}
          onClick={() => handleTabChange('withdraw')}
        >
          Withdrawal Requests
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'kyc' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}
          onClick={() => handleTabChange('kyc')}
        >
          KYC Requests
        </button>
      </div>

      <div className="flex justify-between">
        <input
          placeholder="Search "
          type="text"
          name="search"
          value={search}
          onChange={handleChange}
          className="text-black border-[1px] rounded-lg bg-white p-2 m-5"
        />
      </div>

      {loader && (
        <div className="absolute h-full w-full flex justify-center items-center">
          <div
            className="flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent text-surface  "
            role="status"
          >
            <span className="absolute m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0">
              Loading...
            </span>
          </div>
        </div>
      )}

      <div className="relative overflow-x-auto m-5 mb-0">
      {activeTab === 'recharge' && (
  payment.length > 0 ? (
          <table className="w-full text-sm text-left border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th className="px-6 py-3 border-2">Sr no.</th>
                <th className="px-6 py-3 border-2">User Id</th>
                <th className="px-6 py-3 border-2">Payment Category</th>
                <th className="px-6 py-3 border-2">Amount</th>
                <th className="px-6 py-3 border-2">Request Date</th>
                <th className="px-6 py-3 border-2">Status</th>
                <th className="px-6 py-3 border-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payment.map((item, index) => (
                <tr key={item._id} className="bg-white border-b">
                  <th className="px-6 py-4 font-medium border-2">
                    {startIndex + index + 1}
                  </th>
                  <td className="px-6 py-4 font-medium border-2">{item?.user_id}</td>
                  <td className="px-6 py-4 font-medium border-2">{item?.paymentType}</td>
                  <td className="px-6 py-4 font-medium border-2">{item?.amount}</td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.requested_date?.split("T")[0]}
                  </td> 
                  <td className="px-6 py-4 font-medium border-2">
                    {item?.status}
                  </td>
                  <td className="px-6 py-4 font-medium border-2">
                  <CiEdit
                        className="text-xl text-blue-500 hover:scale-110 cursor-pointer"
                        onClick={() => navigate(`/rechargehistory/${item._id}`)}
                      />
                     </td>
                </tr>
              ))}
            </tbody>
          </table>
         ) : (
            <div className="text-center text-gray-500 my-5">No Data Available</div>
          )
        )}
        
        {activeTab === 'withdraw' && (
  withdrawals.length > 0 ? (
          <table className="w-full text-sm text-left border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
              <th className="px-6 py-3 border-2">Sr no.</th>
                <th className="px-6 py-3 border-2">User Id</th>
                <th className="px-6 py-3 border-2">Payment Category</th>
                <th className="px-6 py-3 border-2">Amount</th>
                <th className="px-6 py-3 border-2">Request Date</th>
                <th className="px-6 py-3 border-2">Status</th>
                <th className="px-6 py-3 border-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((item, index) => (
                 <tr key={item._id} className="bg-white border-b">
                 <th className="px-6 py-4 font-medium border-2">
                   {startIndex + index + 1}
                 </th>
                 <td className="px-6 py-4 font-medium border-2">{item?.user_id}</td>
                 <td className="px-6 py-4 font-medium border-2">{item?.paymentType}</td>
                 <td className="px-6 py-4 font-medium border-2">{item?.amount}</td>
                 <td className="px-6 py-4 border-2 border-gray-300">
                   {item?.requested_date?.split("T")[0]}
                 </td> 
                 <td className="px-6 py-4 font-medium border-2">
                   {item?.status}
                 </td>
                 <td className="px-6 py-4 font-medium border-2">
                 <CiEdit
                       className="text-xl text-blue-500 hover:scale-110 cursor-pointer"
                       onClick={() => navigate(`/withdrawehistory/${item._id}`)}
                     />
                    </td>
               </tr>
              ))}
              
            </tbody>
          </table>
          ) : (
            <div className="text-center text-gray-500 my-5">No Data Available</div>
          )
        )}


{activeTab === 'kyc' && (
    kycRequests.length > 0 ? (
          <table className="w-full text-sm text-left border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th className="px-6 py-3 border-2">Sr no.</th>
                <th className="px-6 py-3 border-2">Account Holder Name</th>
                <th className="px-6 py-3 border-2">User Id</th>
                 <th className="px-6 py-3 border-2">Request Date</th>
                <th className="px-6 py-3 border-2">Status</th>
                <th className="px-6 py-3 border-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {kycRequests.map((item, index) => (
                <tr key={item._id} className="bg-white border-b">
                  <th className="px-6 py-4 font-medium border-2">
                    {startIndex + index + 1}
                  </th>
                  <td className="px-6 py-4 font-medium border-2">{item?.accountholdername}</td>
                  <td className="px-6 py-4 font-medium border-2">{item?.user_id}</td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.requested_date?.split("T")[0]}
                  </td> 
                  <td className="px-6 py-4 font-medium border-2">
                    {item?.kycstatus}
                  </td>
                  <td className="px-6 py-4 font-medium border-2">
                  <CiEdit
                       className="text-xl text-blue-500 hover:scale-110 cursor-pointer"
                       onClick={() => navigate(`/kycusers/${item._id}`)}
                     />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         ) : (
            <div className="text-center text-gray-500 my-5">No Data Available</div>
          )
        )}

        {noData && (
          <div className="text-center text-gray-500 mt-4">
            No data available for the selected tab.
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
