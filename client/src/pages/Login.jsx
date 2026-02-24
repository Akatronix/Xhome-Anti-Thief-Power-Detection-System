import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import logoImage from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/userStore";
import api from "@/services/api";
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);
      const { accessToken, user } = response.data;

      toast.success("Login successful!");

      setAuth(user, accessToken);

      navigate("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-start space-y-6">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="XHome Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">XHome</h1>
              <p className="text-sm text-gray-500">Power Protection</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Welcome Back to <span className="text-blue-600">Smart Power</span>{" "}
            Monitoring
          </h2>

          <p className="text-lg text-gray-600">
            Access your dashboard to monitor power usage, receive alerts, and
            keep your home safe from electrical incidents.
          </p>

          <div className="space-y-4 w-full">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Real-time Monitoring
                </p>
                <p className="text-sm text-gray-500">Track power usage 24/7</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Zap className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Instant Alerts</p>
                <p className="text-sm text-gray-500">
                  Get notified of anomalies
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="p-8 w-full max-w-md mx-auto lg:max-w-none">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <img src={logoImage} alt="XHome Logo" className="w-12 h-12" />
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">XHome</h1>
                <p className="text-xs text-gray-500">Power Protection</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-2">
              Sign in to access your dashboard
            </p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button className="w-full py-3" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
              <ArrowRight size={18} />
            </Button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create account
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
