
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
      const response = await API.post("/auth/register", formData);

      if (response.data.success) {
        alert("Account created successfully! Please login.");
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-auth-page">

      <div className="luxury-auth-image register-image">
        <div className="auth-image-overlay">
          <span className="auth-eyebrow">WELCOME TO VESTORA</span>

          <h1>
            Define Your
            <br />
            Own Elegance.
          </h1>

          <p>
            Discover timeless fashion, refined essentials
            and a style that is uniquely yours.
          </p>

          <div className="auth-image-line"></div>

          <span className="auth-image-caption">
            STYLE THAT DEFINES YOU
          </span>
        </div>
      </div>

      <div className="luxury-auth-content">

        <div className="luxury-auth-box">

          <span className="auth-eyebrow">CREATE YOUR ACCOUNT</span>

          <h2>Join VESTORA</h2>

          <p className="auth-description">
            Become a part of our world of timeless style.
          </p>

          {error && (
            <div className="luxury-auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="luxury-input-group">
              <label>FULL NAME</label>

              <div className="luxury-input-wrapper">
                <UserRound size={18} />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="luxury-input-group">
              <label>EMAIL ADDRESS</label>

              <div className="luxury-input-wrapper">
                <Mail size={18} />

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

            <div className="luxury-input-group">
              <label>PHONE NUMBER</label>

              <div className="luxury-input-wrapper">
                <Phone size={18} />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="luxury-input-group">
              <label>PASSWORD</label>

              <div className="luxury-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>

              <small>Use at least 8 characters.</small>
            </div>

            <button
              type="submit"
              className="luxury-auth-button"
              disabled={loading}
            >
              {loading ? (
                "CREATING ACCOUNT..."
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="auth-secure-note">
            <ShieldCheck size={16} />
            Your information is protected.
          </div>

          <div className="luxury-auth-divider">
            <span>ALREADY A MEMBER?</span>
          </div>

          <Link to="/login" className="luxury-auth-secondary-button">
            SIGN IN TO YOUR ACCOUNT
          </Link>

        </div>
      </div>

    </div>
  );
}

export default Register;
