import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ShowEmployee = () => {
  const initialState = {
    username: "",
    contact: "",
    user_id: "",
    email: "",
    balance: "",
    last_recharge: "",
    promocode: "",
  };
  const [loader, setLoader] = useState(true);
  const [userDetail, setUserDetail] = useState(initialState);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [addingBalance, setAddingBalance] = useState(false);

  const params = useParams();
  const { id } = params;

  useEffect(() => {
    console.log("before");
    fetchUserDetails();
    console.log("after");
  }, []);

  const fetchUserDetails = async () => {
    setLoader(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const response = await res.json();
      if (response.success && response.result) {
        setUserDetail({
          username: response.result.username || "N/A",
          contact: response.result.contact || "N/A",
          email: response.result.email || "N/A",
          balance: response.result.balance || 0,
          last_recharge: response.result.last_recharge || 0,
          promocode: response.result.promocode || "N/A",
          user_id: response.result.user_id || response.result._id,
        });
      } else {
        console.error("No data found for the given parameter.");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoader(false);
    }
  };

  const handleAddBalance = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setAddingBalance(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/addBalance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, amount: parseFloat(amount) }),
      });
      const response = await res.json();

      if (response.success) {
        alert("Balance added successfully!");
        setUserDetail({ ...userDetail, balance: response.newBalance });
        setShowModal(false);
        setAmount("");
      } else {
        alert(response.message || "Failed to add balance");
      }
    } catch (error) {
      console.error("Failed to add balance:", error);
      alert("Error adding balance. Please try again.");
    } finally {
      setAddingBalance(false);
    }
  };

  return (
    <div className="relative bg-gray-100">
      {loader ? (
        <div className="absolute h-full w-full top-64  flex justify-center items-center">
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
        <div className="container mx-auto py-8">
          <div className="text-2xl text-center underline">User details</div>
          <div className="flex justify-center m-5">
            <div>
              <div className="text-lg flex my-2">
                <div className="font-bold px-2">username:</div>{" "}
                {userDetail?.username}
              </div>
              <div className="text-lg flex my-2">
                <div className="font-bold px-2">contact:</div>{" "}
                {userDetail?.contact}
              </div>
              <div className="text-lg flex my-2">
                <div className="font-bold px-2">user_id:</div>{" "}
                {userDetail?.user_id || "gurpreet123"}
              </div>
              <div className="text-lg flex my-2">
                <div className="font-bold px-2">email:</div> {userDetail?.email}
              </div>
              <div className="text-lg flex my-2">
                <div className="font-bold px-2">balance:</div>{" "}
                {userDetail?.balance}
              </div>
              <div className="text-lg flex my-2">
                <div className="font-bold px-2">last_recharge:</div>{" "}
                {userDetail?.last_recharge}
              </div>
              <div className="text-lg flex my-2">
                <div className="font-bold px-2">promocode:</div>{" "}
                {userDetail?.promocode || 743333}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
                >
                  Add Balance
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add Balance</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setAmount("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={addingBalance}
              >
                Cancel
              </button>
              <button
                onClick={handleAddBalance}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={addingBalance}
              >
                {addingBalance ? "Adding..." : "Add Balance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowEmployee;
