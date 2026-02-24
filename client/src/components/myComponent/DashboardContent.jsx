import React, { useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Zap,
  Activity,
  Power,
  Shield,
  ShieldOff,
  Play,
  Square,
} from "lucide-react";
import { useUserDataStore } from "@/stores/userDataStore";
import { toast } from "sonner";
import api from "@/services/api";

// Mock Data
const POWER_DATA = [
  { time: "00:00", voltage: 0, current: 0 },
  { time: "04:00", voltage: 0, current: 0 },
  { time: "08:00", voltage: 0, current: 0 },
  { time: "12:00", voltage: 0, current: 0 },
  { time: "16:00", voltage: 0, current: 0 },
  { time: "20:00", voltage: 0, current: 0 },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Card = ({ children, className }) => (
  <div
    className={cn(
      "bg-white border border-gray-200 rounded-xl shadow-sm",
      className,
    )}
  >
    {children}
  </div>
);

const MetricCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card className="p-5 flex items-center gap-4">
    <div className={cn("p-3 rounded-lg", color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  </Card>
);

const ControlButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  activeColor,
  inactiveColor,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
      active
        ? `${activeColor} text-white shadow-md`
        : `${inactiveColor} text-gray-600 hover:bg-gray-100`,
    )}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

const DashboardContent = () => {
  const { hardwareData, chartData } = useUserDataStore();

  // Add null check for hardwareData
  const safeHardwareData = hardwareData || {
    systemStatus: false,
    armed: false,
    voltage: 0,
    current: 0,
    power: 0,
  };

  const transformedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return POWER_DATA;
    }

    const transformed = chartData.map((item) => {
      const date = new Date(item.timestamp);
      const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

      return {
        time,
        voltage: item.voltage,
        current: item.current,
        power: item.power,
      };
    });

    return transformed;
  }, [chartData]);

  const handleToggleSystem = async () => {
    if (!hardwareData.hardwareID) {
      toast.error("Hardware data is not available");
      return;
    }
    const newStatus = !safeHardwareData.systemStatus;
    try {
      const response = await api.post("/meter/status", {
        hardwareID: hardwareData.hardwareID,
        systemStatus: newStatus,
      });

      if (response.status === 200) {
        toast.success(`System turned ${newStatus ? "ON" : "OFF"} successfully`);
      } else {
        toast.error("Failed to toggle system status");
      }
    } catch (error) {
      console.error("Error toggling system status:", error);
      toast.error("An error occurred while toggling system status");
    }
  };

  const handleToggleProtect = async () => {
    if (!hardwareData.hardwareID) {
      toast.error("Hardware data is not available");
      return;
    }
    const newStatus = !safeHardwareData.armed;
    try {
      const response = await api.post("/meter/protect", {
        hardwareID: hardwareData.hardwareID,
        protectStatus: newStatus,
      });

      if (response.status === 200) {
        toast.success(
          `System ${newStatus ? "Armed" : "Disarmed"} successfully`,
        );
      } else {
        toast.error("Failed to toggle protect status");
      }
    } catch (error) {
      console.error("Error toggling protect status:", error);
      toast.error("An error occurred while toggling protect status");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Power Line Monitor</h1>
        <p className="text-gray-500 text-sm mt-1">
          Real-time anti-theft detection for your power line
        </p>
      </div>

      {/* Control Panel */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  safeHardwareData.systemStatus
                    ? "bg-green-500"
                    : "bg-gray-400",
                )}
              />
              <span className="font-medium text-gray-700">
                System Status:{" "}
                <span
                  className={
                    safeHardwareData.systemStatus
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  {safeHardwareData.systemStatus ? "Online" : "Offline"}
                </span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-700">
                Security:{" "}
                <span
                  className={
                    safeHardwareData.armed ? "text-blue-600" : "text-gray-500"
                  }
                >
                  {safeHardwareData.armed ? "Armed" : "Disarmed"}
                </span>
              </span>
            </div>
            <p className="mt-2 ml-6 text-gray-600">
              Power Threshold:{" "}
              {safeHardwareData.thresholdPower ? (
                <span>
                  <span className="text-black font-bold mr-1">
                    {safeHardwareData.thresholdPower}
                  </span>
                  w
                </span>
              ) : (
                "0 W"
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ControlButton
              active={safeHardwareData.systemStatus}
              onClick={() => handleToggleSystem()}
              icon={safeHardwareData.systemStatus ? Power : Play}
              label={safeHardwareData.systemStatus ? "ON" : "OFF"}
              activeColor="bg-green-500 hover:bg-green-600"
              inactiveColor="bg-gray-200"
            />
            <ControlButton
              active={safeHardwareData.armed}
              onClick={() => handleToggleProtect()}
              icon={safeHardwareData.armed ? Shield : ShieldOff}
              label={safeHardwareData.armed ? "Armed" : "Disarmed"}
              activeColor="bg-blue-500 hover:bg-blue-600"
              inactiveColor="bg-gray-200"
            />
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Voltage"
          value={
            safeHardwareData.voltage ? `${safeHardwareData.voltage} V` : "0 V"
          }
          subtitle="Normal"
          icon={Zap}
          color="bg-blue-500"
        />
        <MetricCard
          title="Current"
          value={
            safeHardwareData.current ? `${safeHardwareData.current} A` : "0 A"
          }
          subtitle="Stable"
          icon={Activity}
          color="bg-green-500"
        />
        <MetricCard
          title="Power"
          value={safeHardwareData.power ? `${safeHardwareData.power} W` : "0 W"}
          subtitle="Active load"
          icon={Power}
          color="bg-purple-500"
        />
      </div>

      {/* Chart Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Power Line History</h3>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Voltage
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Current
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <AreaChart data={transformedChartData}>
              <defs>
                <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="voltage"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorVoltage)"
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorCurrent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardContent;
