import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/apiClient";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    fullName: user?.fullName || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // In a real app, you'd call an update profile API
    // For now, just simulate success
    setTimeout(() => {
      setSuccess("Profile updated successfully!");
      setLoading(false);
    }, 1000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      {(error || success) && (
        <Alert
          type={error ? "error" : "success"}
          message={error || success}
          dismissible
          onClose={() => { setError(""); setSuccess(""); }}
        />
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Settings tabs">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "password"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Password
          </button>
        </nav>
      </div>

      {activeTab === "profile" && (
        <Card>
          <CardHeader title="Profile Information" />
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Username"
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
              <Input
                label="Full Name"
                name="fullName"
                value={profileForm.fullName}
                onChange={handleProfileChange}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "password" && (
        <Card>
          <CardHeader title="Change Password" subtitle="Your password must be at least 6 characters." />
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                name="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                required
                autoComplete="current-password"
              />
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
                helperText="At least 6 characters"
              />
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" loading={loading}>
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <Button variant="danger" onClick={handleLogout} className="w-full sm:w-auto">
          Log Out
        </Button>
      </div>
    </div>
  );
}

export default Profile;