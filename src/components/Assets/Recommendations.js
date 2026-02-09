import React from 'react';
import { ActionableNotification } from '@carbon/react';
import { Sprout } from '@carbon/icons-react';

const Recommendations = ({ recommendations }) => {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div style={{ marginBottom: "32px", animation: "fadeIn 0.5s ease" }}>
            <h4 style={{ marginBottom: "16px", fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sprout size={20} fill="#10b981" /> Smart Savings Recommendations
            </h4>
            <div style={{ display: "grid", gap: "16px" }}>
                {recommendations.map(rec => (
                    <div
                        key={rec.id}
                        style={{
                            background: "#fff1f2",
                            border: "1px solid #fecdd3",
                            borderRadius: "16px",
                            padding: "20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxShadow: "0 2px 4px rgba(251, 113, 133, 0.05)"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                            <div style={{
                                background: "#fecdd3",
                                borderRadius: "12px",
                                padding: "10px",
                                color: "#be123c",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Sprout size={20} />
                            </div>
                            <div>
                                <h5 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#881337" }}>{rec.title}</h5>
                                <p style={{ margin: 0, fontSize: "14px", color: "#9f1239", opacity: 0.9 }}>{rec.subtitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => alert(`Applying optimization for ${rec.title}...`)}
                            style={{
                                background: "#be123c",
                                color: "#fff",
                                border: "none",
                                borderRadius: "99px",
                                padding: "8px 20px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 4px rgba(190, 18, 60, 0.2)"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#9f1239"}
                            onMouseLeave={(e) => e.target.style.background = "#be123c"}
                        >
                            Apply Optimization
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
