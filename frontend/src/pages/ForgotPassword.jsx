import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/apiClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setSuccess("If an account exists with this email, you will receive a password reset link shortly.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">PM</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} dismissible onClose={() => setError("")} />}
          {success && <Alert type="success" message={success} />}

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;