import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    // 2 second por abar icon change hoye jabe
    setTimeout(() => setCopied(false), 1000);
  };

  const buttonStyle = {
    background: copied
      ? "rgba(74, 222, 128, 0.1)"
      : "rgba(255, 255, 255, 0.08)",

    border: `1px solid ${copied ? "#4ade80" : "rgba(255, 255, 255, 0.2)"}`,
    color: copied ? "#4ade80" : "#d1d1d1",
    fontSize: "10px",
    padding: "1px 4px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "5px",
    transition: "0.3s all ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  };

  return (
    <button
      style={buttonStyle}
      className="copy-btn"
      onClick={handleCopy}
      title="Copy reply"
    >
      {copied ? <CopyCheck size={17} /> : <Copy size={17} />}
    </button>
  );
};

export default CopyButton;
