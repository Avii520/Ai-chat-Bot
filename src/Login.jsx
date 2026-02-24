import React from "react";
import { handleFacebookLogin } from "./FirebaseFunction";

const Login = ({ user, onLogin }) => {
  if (user) return null;

  // Facebook logic handle kora (onLogin update korbe)
  const onFacebookClick = async () => {
    const userData = await handleFacebookLogin();
    if (userData) {
      onLogin(userData);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2
          style={{
            marginBottom: "10px",
            fontWeight: "bold",
            fontSize: "large",
          }}
        >
          Log in or sign up
        </h2>
        <p style={{ color: "#111111", fontSize: "14px", marginBottom: "20px" }}>
          Join Avi AI to save your conversation.
        </p>

        {/*Google Button */}
        <button onClick={onLogin} style={buttonStyle}>
          <div style={iconBoxStyle}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="G"
              style={{ width: "18px" }}
            />
          </div>
          <span style={{ flex: 1, textAlign: "center" }}>
            Continue with Google
          </span>
        </button>

        {/*Facebook Button */}
        <button
          onClick={onFacebookClick}
          style={{
            ...buttonStyle,
            marginTop: "10px",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            border: "none",
          }}
        >
          <div style={iconBoxStyle}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
              alt="F"
              style={{ width: "19px" }}
            />
          </div>
          <span style={{ flex: 1, textAlign: "center" }}>
            Continue with Facebook
          </span>
        </button>
      </div>
    </div>
  );
};

//tyles (Alignment thik korar jonno

const iconBoxStyle = {
  width: "24px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  padding: "12px 15px",
  width: "100%",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "white",
  border: "1px solid #444",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: "White",
  color: "black",
  padding: "40px",
  borderRadius: "16px",
  textAlign: "center",
  width: "350px",
  marginLeft: "10px",
  marginRight: "10px",
};

export default Login;
