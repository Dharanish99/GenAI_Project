import React from "react";
export default function TypeIcon({type,name}){
  const ext = (name?.split(".").pop()||"").toLowerCase();
  const label = ext.toUpperCase() || "FILE";
  return <div className="file-icon" aria-hidden><strong>{label}</strong></div>;
}