import React, { use, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { saveAuthFromResponse } from '../utils/auth';
import { endpoints } from '../config/urls';
import {
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  Eye,
  EyeOff,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Toast } from "../components/Toast";
import { useUserStore } from "../store/UserStore";
import { apiRequest } from "../utils/apiClient";

export default function LoginRegister() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUserStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    company: "",
    phone: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  // 1. Pre-flight checks
  if (!validateForm()) return;

  setSubmitting(true);

  const loginInfo = {
    username: formData.email,
    password: formData.password,
  };

  try {
    // 2. Wait for the store to finish updating
    await login(loginInfo);
    
    console.log('Login successful, navigating...');
    
    // 3. Navigate BEFORE setting submitting to false 
    // (or just let the redirect unmount the component)
    navigate('/', { replace: true }); 
  } catch (error) {
    console.error('Login error', error);
    showToast('An error occurred while logging in. Please try again.', 'error');
    setSubmitting(false); // Only reset if there's an error
  }
};

  const rememberMe = (value: boolean) => {
    if (!value) localStorage.removeItem('rememberMe');
    else localStorage.setItem('rememberMe', 'true');
  };

  // send an email upon password reset window

  const handleResetPassword = () => {

    const doResetPassword = async () => {
      setSubmitting(true);

      if (!formData.email) {
        showToast("Please enter email", "error");
        return;
      }
      else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        showToast("Please enter valid email", "error");
        return;
      }


      try {
        console.info("Password reset in progress " + formData.email);
        // Use centralized endpoint builder      

        const res = await apiRequest(endpoints.resetPassword(undefined, formData.email), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          const msg = err?.message || 'Reset failed';
          showToast(msg, 'error');
          return;
        }
        showToast("Check your email for the Password", "success");

        navigate('/');
      } catch (error) {
        console.error('Reset error', error);
        showToast('An error occurred while resetting in. Please try again.', 'error');
      }
    };

    doResetPassword();
    setSubmitting(false);
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-white">HRMS</h1>
                <p className="text-sm text-blue-100">Portal</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Streamline Your HR Operations
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Manage employees, payroll, attendance, and more with our
                  comprehensive HRMS platform.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-white/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Employee Management
                    </h3>
                    <p className="text-sm text-blue-100">
                      Complete employee lifecycle management
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-white/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Attendance Tracking
                    </h3>
                    <p className="text-sm text-blue-100">
                      GPS-enabled attendance with real-time tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-white/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Payroll Processing
                    </h3>
                    <p className="text-sm text-blue-100">
                      Automated payroll with detailed breakdowns
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-white/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Analytics & Reports
                    </h3>
                    <p className="text-sm text-blue-100">
                      Comprehensive insights and data visualization
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-blue-100">
            © 2024 HRMS Portal. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">HRMS</h1>
                <p className="text-xs text-gray-500">Portal</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600">
                Sign in to access your HRMS dashboard

              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Register Fields */}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Remember Me / Forgot Password */}
              {(
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      onChange={(e) => rememberMe(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium" onClick={handleResetPassword}>
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
                {submitting ? "Logging in..." : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

