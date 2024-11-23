// SummaryCard.js
import React from 'react';

const SummaryCard = ({ title, value, color, onClick }) => (
  <div className={`p-4 rounded shadow cursor-pointer ${color}`} onClick={onClick}>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="text-2xl">{value}</p>
  </div>
);

export default SummaryCard;
