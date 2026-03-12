import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Camera, 
  Lock, 
  Phone, 
  Save, 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Building2, 
  Fingerprint,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { useUserStore } from "../store/UserStore";

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
  const [profileImage, setProfileImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user && !submitting) {
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
  }, [user, submitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // ... (Your existing logic for phone/email/password stays the same)
    if (name === 'phone') {
      let numericValue = value.replace(/\D/g, '').substring(0, 10);
      let formattedValue = numericValue ? `+91 ${numericValue.substring(0, 5)}${numericValue.length > 5 ? ' ' + numericValue.substring(5, 10) : ''}` : "";
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUser(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Update failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 1. Header Section */}
      <div className="bg-[#1A233A] px-6 py-10 md:px-12 md:py-16 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-white">Account Settings</h1>
          <p className="text-slate-400 font-medium">Manage your digital identity and preferences</p>
        </div>
      </div>

      {/* 2. Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        
        {/* Profile Picture Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-[2rem] object-cover ring-4 ring-slate-50 shadow-lg" />
              ) : (
                <div className="w-32 h-32 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-4xl">{formData.firstName.charAt(0)}</span>
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 p-3 bg-white shadow-xl rounded-2xl cursor-pointer hover:scale-110 transition-transform border border-slate-100">
                <Camera className="w-5 h-5 text-indigo-600" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black text-slate-900 mb-1">Upload Photo</h3>
              <p className="text-sm text-slate-400 font-medium mb-4">Recommended: Square JPG or PNG, max 2MB.</p>
              {profileImage && (
                <button onClick={() => setProfileImage('')} className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors">
                  <Trash2 size={14} /> Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Personal Info */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
               </div>
               <h2 className="text-lg font-black text-slate-900 tracking-tight">Personal Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'First Name', name: 'firstName', icon: UserIcon, disabled: true },
                { label: 'Last Name', name: 'lastName', icon: UserIcon, disabled: true },
                { label: 'Email Address', name: 'email', icon: Mail, type: 'email' },
                { label: 'Phone Number', name: 'phone', icon: Phone, type: 'tel' }
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{field.label}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 rounded-lg group-focus-within:bg-indigo-600 group-focus-within:text-white transition-all">
                      <field.icon size={16} className={field.disabled ? "text-slate-400" : ""} />
                    </div>
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      disabled={field.disabled}
                      className={`w-full pl-14 pr-6 py-4 rounded-2xl font-bold transition-all border-none ${
                        field.disabled 
                        ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-70" 
                        : "bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Organization */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-600" />
               </div>
               <h2 className="text-lg font-black text-slate-900 tracking-tight">Workspace Info</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'User ID', value: formData.id, icon: Fingerprint },
                 { label: 'Organization', value: formData.orgName, icon: Building2 },
                 { label: 'Assigned Role', value: formData.role, icon: Briefcase }
               ].map((item, i) => (
                 <div key={i} className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                    <div className="flex items-center gap-2">
                       <item.icon size={14} className="text-slate-400" />
                       <span className="text-sm font-black text-slate-500">{item.value || 'N/A'}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Section: Password */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-emerald-600" />
               </div>
               <h2 className="text-lg font-black text-slate-900 tracking-tight">Security</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['password', 'confirmPassword'].map((name) => (
                <div key={name} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {name === 'password' ? 'New Password' : 'Confirm Password'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 rounded-lg group-focus-within:bg-emerald-600 group-focus-within:text-white transition-all text-slate-500">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      name={name}
                      value={formData[name as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center md:justify-end pb-10">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {submitting ? "Processing..." : (
                <><Save size={18} /> Update Profile</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} />}
          <span className="text-sm font-black tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}