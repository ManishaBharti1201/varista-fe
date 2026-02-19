import { use, useState, useEffect } from "react";
import { AlertCircle, Briefcase, Camera, Key, Lock, Mail, MapPin, Phone, Save, User as UserIcon } from "lucide-react";
import { endpoints } from "../config/urls";
import { User, useUserStore } from "../store/UserStore";

export default function HRMSSystemSettings() {
  const { user, updateUser } = useUserStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    orgId: '',
    id: '',
    role: '',
    orgName: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (user) {
      // Only update if we aren't currently submitting
      if (!submitting) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          id: user.id || "",
          role: user.role || "",
          orgName: user.company?.name || "",
          orgId: user.company?.id || "",
          password: user.password || "",
          confirmPassword: user.password || "",
          avatar: user.avatar || ""
        });
        if (user.avatar) setProfileImage(user.avatar);
      }
    }
  }, [user]); // Careful here: if updateUser changes the 'user' object, this triggers.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Keep only digits
      let numericValue = value.replace(/\D/g, '');

      // Remove leading 91 if user types it manually
      if (numericValue.startsWith("91")) {
        numericValue = numericValue.substring(2);
      }
      // Limit to 10 digits
      numericValue = numericValue.substring(0, 10);

      // Format as XXXXX YYYYY
      let formattedValue = "+91 ";

      if (numericValue.length > 0) {
        formattedValue += numericValue.substring(0, 5);
      }
      if (numericValue.length > 5) {
        formattedValue += " " + numericValue.substring(5, 10);
      }

      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
    else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value.toLocaleLowerCase() }));
      }
    }
    else if (name === 'confirmPassword' || name === 'password') {
      if (value !== formData.password) {
        setErrors((prevErrors: any) => ({ ...prevErrors, [name]: 'Passwords do not match' }));
      }
      else {
        setErrors((prevErrors: any) => ({ ...prevErrors, password: '' }));
        setErrors((prevErrors: any) => ({ ...prevErrors, confirmPassword: '' }));
      }

      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    else
      setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
        setFormData((prevData) => ({ ...prevData, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // The store's updateEmployee handles the API call and visual defaults
      await updateUser(formData);
      // Reset and close
      showToast('User updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update user', err);
      showToast('Failed to update user. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Settings</h1>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="p-1 bg-green-100 rounded-full">
            <Save className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {/* Profile Picture */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">{formData.firstName.charAt(0)}</span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Upload Profile Photo</h3>
              <p className="text-sm text-gray-500 mb-3">JPG, PNG or GIF. Max size 2MB.</p>
              {profileImage && (
                <button
                  onClick={() => setProfileImage('')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
              {errors.firstName && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.firstName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
              {errors.lastName && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.lastName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.phone && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.phone && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Id</label>
              <input
                type="text"
                name="employeeId"
                value={formData.id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Org Name</label>
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"

                />
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg shadow-blue-200 transition-all ${submitting ? "bg-blue-400" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}
          >
            {submitting ? "Updating..." : "Update User Details"}
          </button>
        </div>
      </div>
    </div>

  );
}

