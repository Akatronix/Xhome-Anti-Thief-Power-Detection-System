import React, { useState } from "react";
import { Cpu, Zap, Save, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthStore } from "@/stores/userStore";

const HardwareResigter = () => {
  const [formData, setFormData] = useState({
    hardwareID: "",
    thresholdPower: "",
  });

  const setNewAuth = useAuthStore((state) => state.setNewAuth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hardwareID.trim() || !formData.thresholdPower.trim()) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    const formDataToSend = {
      hardwareID: formData.hardwareID.trim(),
      thresholdPower: Number(formData.thresholdPower),
    };

    console.log(formDataToSend);

    try {
      setLoading(true);
      const response = await api.post("/meter/create", formDataToSend);

      if (response.status === 201) {
        const { accessToken, user } = response.data;
        toast.success("Meter registered successfully");
        setFormData({
          hardwareID: "",
          thresholdPower: "",
        });

        setLoading(false);
        setNewAuth(user);
        window.location.href = "/";
      } else {
        setLoading(false);
        toast.error("Failed to register meter");
      }
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-6 max-w-lg w-full ">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Register New Meter
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Add a new power meter to your system
        </p>

        <form
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4"
          onSubmit={handleFormSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hardware ID
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Cpu className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={formData.hardwareID}
                onChange={(e) => handleChange("hardwareID", e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                placeholder="Enter hardware ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold Power
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Zap className="w-5 h-5" />
              </div>
              <input
                type="number"
                value={formData.thresholdPower}
                onChange={(e) => handleChange("thresholdPower", e.target.value)}
                className="w-full py-2.5 pl-10 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                placeholder="Enter threshold"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                W
              </span>
            </div>
            <p className="text-red-500">{error}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors  bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Registering..." : "Register Meter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HardwareResigter;
