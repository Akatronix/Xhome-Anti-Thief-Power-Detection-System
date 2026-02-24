import React, { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { useUserDataStore } from "@/stores/userDataStore";
import { toast } from "sonner";
import api from "@/services/api";

const ThresholdSettings = () => {
  const [threshold, setThreshold] = useState(0);
  const [error, setError] = useState("");

  const { hardwareData } = useUserDataStore();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!hardwareData.hardwareID) {
      console.error("Hardware ID is missing");
      return;
    }
    if (threshold <= 0) {
      setError("Threshold must be greater than 0");
      return;
    }

    // Send the threshold value to the backend API in the request body
    const response = await api.post("/meter/threshold", {
      hardwareID: hardwareData.hardwareID,
      thresholdPower: Number(threshold),
    });

    if (response.status === 200) {
      setThreshold(0);
      toast.success("Threshold updated successfully");
    } else {
      toast.error("Failed to update threshold");
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Threshold Setting
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Set the detection threshold in watt
      </p>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Threshold (Watts)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => {
                    setThreshold(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 text-lg"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Alert triggered when power exceeds this threshold.
              </p>

              <p className="text-red-500">{error}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="bg-blue-500 text-white flex items-center justify-start gap-3 px-6 py-3 rounded-md">
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThresholdSettings;
