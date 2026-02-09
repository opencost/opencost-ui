export const formatCurrency = (value, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const typeColors = {
    Node: {
        bg: "#c7d2fe", // Indigo-200 (was 100)
        border: "#a5b4fc", // Indigo-300
        text: "#312e81", // Indigo-900 (High contrast)
        tag: "purple" // Keeping tag mapping for fallback, but ideally we use custom style
    },
    Disk: {
        bg: "#bbf7d0", // Green-200
        border: "#86efac", // Green-300
        text: "#064e3b", // Green-900
        tag: "green"
    },
    LoadBalancer: {
        bg: "#fde68a", // Amber-200
        border: "#fcd34d", // Amber-300
        text: "#78350f", // Amber-900
        tag: "warm-gray"
    },
    Network: {
        bg: "#bfdbfe", // Blue-200
        border: "#93c5fd", // Blue-300
        text: "#1e3a8a", // Blue-900
        tag: "blue"
    },
    Total: {
        bg: "#e9d5ff", // Soft Violet (300)
        border: "#c084fc", // Violet (400)
        text: "#581c87", // Violet (900)
        tag: "magenta"
    },
    Carbon: {
        bg: "#99f6e4", // Teal-200
        border: "#5eead4", // Teal-300
        text: "#134e4a", // Teal-900
        tag: "teal"
    }
};

export const windowOptions = [
    { id: "today", text: "Today", multiplier: 0.14 },
    { id: "yesterday", text: "Yesterday", multiplier: 0.14 },
    { id: "7d", text: "Last 7 Days", multiplier: 1 },
    { id: "14d", text: "Last 14 Days", multiplier: 2 },
    { id: "30d", text: "Last 30 Days", multiplier: 4.2 },
];
