import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { NavLink ,useParams} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ImCross } from "react-icons/im";
import { IoMdEye } from "react-icons/io";
const User = () => {
  const [users, setUsers] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const { id } = useParams(); // Get the ID from the URL

  useEffect(() => {
    fetchData();
  }, [page, search,id]);

  const fetchRoleName = async (id) => {
    const roleRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleRole`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const roleData = await roleRes.json();
    const type = roleData.success ? roleData.data[0].role : "Unknown";
    return type;
  };

  const fetchData = async () => {
    setLoader(true);
    let apiUrl;

    if (id) {
      // If the ID is present in the URL, fetch data for that specific user
      apiUrl = `${process.env.REACT_APP_BACKEND_URL}/api/getSingleUserBankID/${id}`;
    } else {
      // If no ID in URL, fetch all users as usual
      apiUrl = `${process.env.REACT_APP_BACKEND_URL}/api/getAllUserBank?page=${page}&limit=${pageSize}&search=${search}`;
    }
    const res = await fetch(apiUrl);
    const response = await res.json();
    if (response.success) {
      setNoData(false);
      console.log(response.result);
      if (response.result.length === 0) {      
        setNoData(true);
      }
      setUsers(response.result);
      setCount(response.count);
      setLoader(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const permissionOfDelete = window.confirm(
      `Are you sure you want to ${newStatus} the KYC?`
    );
    if (permissionOfDelete) {
      let projectOne = users.length === 1;
      if (count === 1) {
        projectOne = false;
      }
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/updatekycstatus/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        const response = await res.json();
        if (response.success) {
          toast.success(`Kyc Status updated Successfully!`, {
            position: "top-right",
            autoClose: 1000,
          });
          if (projectOne) {
            setPage((prevPage) => Math.max(prevPage - 1, 1));
          } else {
            fetchData();
          }
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Error updating status");
      }
    }
  };
  const handleDelete = async (e, id) => {
    e.preventDefault();
    const permissionOfDelete = window.confirm(
      "Are you sure, you want to delete the user"
    );
    if (permissionOfDelete) {
      let userOne = users.length === 1;
      if (count === 1) {
        userOne = false;
      }
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/deleteemployee`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const response = await res.json();
      if (response.success) {
        toast.success("Employee is deleted Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        if (userOne) {
          setPage(page - 1);
        } else {
          fetchData();
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearch(value);
      setPage(1);
    }
  };

  const handledeletephoto = async (e, id) => {
    e.preventDefault();
    const permissionOfDelete = window.confirm(
      "Are you sure, you want to delete the employee photo"
    );
    if (permissionOfDelete) {
      let userOne = users.length === 1;
      if (count === 1) {
        userOne = false;
      }
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/deleteEmployeePhoto`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const response = await res.json();
      if (response.success) {
        toast.success("Employee photo is deleted Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        if (userOne) {
          setPage(page - 1);
        } else {
          fetchData();
        }
      }
    }
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
        <div className="text-2xl font-bold mx-2 my-8 px-4">User KYC List</div>
      </div>
      <div className="flex justify-between">
        <div className={`flex items-center`}>
          <input
            placeholder="Search "
            type="text"
            name="search"
            value={search}
            onChange={handleChange}
            className={`text-black border-[1px] rounded-lg bg-white p-2 m-5`}
          />
        </div>
      </div>

      {loader && (
        <div className="absolute h-full w-full top-64  flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]  "
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      )}
      <div className="relative overflow-x-auto m-5 mb-0">
        {users.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Sr no.
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Bank Name
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Account Number
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Account Holder Name
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Ifsc Code
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Mobile Number 
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  UPI ID 
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Request Date                  
                       </th>
                       <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Status                  
                       </th>
                       <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Action                  
                       </th>
              </tr>
            </thead>

            <tbody>
              {users.map((item, index) => (
                <tr key={item?._id} className="bg-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-2 border-gray-300"
                  >
                    {startIndex + index + 1}
                  </th>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-2 border-gray-300"
                  >
                    {item?.bankName}
                  </th>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.accountNo}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.accountholdername}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.ifscCode}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.mobileNo}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.upiId}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.requested_date?.split("T")[0]}
                  </td>
                  <td className="px-6 py-4 font-medium border-2">
                    {item?.kycstatus === 'pending' ? (
                      <div
                        className=" hover:bg-blue-600  font-bold py-2 px-4 rounded"
                      >
                        Pending
                      </div>
                    ) : item?.kycstatus === 'approved' ? (
                      <div
                        className=" hover:bg-green-600  font-bold py-2 px-4 rounded"
                      >
                        Approved
                      </div>

                    ) : (
                      <div
                        className=" hover:bg-red-600  font-bold py-2 px-4 rounded"
                      >
                        Rejected
                      </div>
                    )}
                    &ensp;
                  </td>
                  <td className="px-6 py-4 font-medium border-2">
                    <div className="flex justify-between">
                      {item?.kycstatus === 'pending' ? (
                        <div>
                          <button
                            className="bg-green-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleStatusChange(item._id, 'approved')}
                          >
                            Approve
                          </button>&ensp;
                          <button
                            className="bg-red-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleStatusChange(item._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : '-'}

                      {/* <IoMdEye
                        className="text-xl text-blue-500 hover:scale-110 cursor-pointer"
                        onClick={() => navigate(`/view/${item._id}`)}
                      /> */}
                     
                    </div>
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {noData && (
        <div className="text-center text-xl">
          Currently! There are no users Kyc details in the storage.
        </div>
      )}

      {users.length > 0 && (
        <div className="flex flex-col items-center my-10">
          <span className="text-sm text-black">
            Showing{" "}
            <span className="font-semibold text-black">{startIndex + 1}</span>{" "}
            to{" "}
            <span className="font-semibold text-black">
              {Math.min(startIndex + pageSize, count)}
            </span>{" "}
            of <span className="font-semibold text-black">{count}</span> Entries
          </span>
          <div className="inline-flex mt-2 xs:mt-0">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={
                users.length < pageSize || startIndex + pageSize >= count
              }
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
