import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../api/apiClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    // Validate token by attempting to reset (or you could have a separate verify endpoint)
    // For now, we'll just check if token exists
    setValidating(false);
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(resetToken, { newPassword: password });
      setSuccess("Password has been reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">PM</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} dismissible onClose={() => setError("")} />}
          {success && <Alert type="success" message={success} />}

          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            helperText="At least 6 characters"
          />

          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;