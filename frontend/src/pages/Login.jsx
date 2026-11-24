
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail
} from "lucide-react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", formData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        // Keep existing session-key compatibility
        localStorage.removeItem("vestora_token");
        localStorage.removeItem("vestora_user");

        alert("Login successful! Welcome to VESTORA.");

        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(
          response.data.message || "Unable to log in."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-auth-page">

      {/* LEFT IMAGE SECTION */}

      <div className="luxury-auth-image">
        <div className="auth-image-overlay">
          <p>THE VESTORA EXPERIENCE</p>

          <h1>
            Style is a way
            <br />
            to express
            <br />
            yourself.
          </h1>

          <span>
            Discover timeless fashion. Define your own identity.
          </span>
        </div>
      </div>

      {/* RIGHT LOGIN SECTION */}

      <div className="luxury-auth-content">

        <div className="luxury-auth-box">

          <Link to="/" className="auth-brand">
            VESTORA
          </Link>

          <p className="auth-eyebrow">
            WELCOME BACK
          </p>

          <h2>Sign in to your account</h2>

          <p className="auth-description">
            Your style journey continues here.
            Sign in to explore your collection.
          </p>

          {error && (
            <div className="luxury-auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="luxury-auth-field">
              <label>EMAIL ADDRESS</label>

              <div className="auth-input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="luxury-auth-field">
              <label>PASSWORD</label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="luxury-auth-button"
              disabled={loading}
            >
              {loading ? (
                "SIGNING IN..."
              ) : (
                <>
                  SIGN IN
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </form>

          <div className="auth-register-link">
            <span>New to VESTORA?</span>

            <Link to="/register">
              CREATE AN ACCOUNT
            </Link>
          </div>

          <div className="auth-bottom-note">
            <span>TIMELESS STYLE.</span>
            <span>EFFORTLESS CONFIDENCE.</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
