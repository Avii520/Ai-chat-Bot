import React from "react";

const DeleteModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null; // Modal bondho thakle kichui dekhabe na

  return (
    <div style={modalOverlayStyle}>
      <div style={customModalStyle}>
        <h3 style={{ color: "#000", marginBottom: "10px" }}>Delete Chat?</h3>
        <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px" }}>
          Wanna delete this conversation?
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {/* Return section: Cancel logic */}
          <button onClick={onCancel} style={cancelBtnStyle}>
            Cancel
          </button>
          {/* Return section: Confirm logic */}
          <button onClick={onConfirm} style={confirmBtnStyle}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

//Styles (Component-er baire)
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};
const customModalStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "15px",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  width: "300px",
};
const cancelBtnStyle = {
  padding: "8px 15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "none",
  cursor: "pointer",
};
const confirmBtnStyle = {
  padding: "8px 15px",
  borderRadius: "8px",
  border: "none",
  background: "#b83131",
  color: "white",
  cursor: "pointer",
};

export default DeleteModal;
