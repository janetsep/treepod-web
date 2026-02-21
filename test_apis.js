
const fetchAndLog = async () => {
    try {
        console.log("Testing Availability API...");
        const res1 = await fetch("http://localhost:3000/api/public/disponibilidad?from=2026-03-01&to=2026-03-31");
        console.log("Availability Status:", res1.status);
        const data1 = await res1.json();
        console.log("Availability Data:", data1);

        console.log("\nTesting Price Calculation API...");
        const res2 = await fetch("http://localhost:3000/api/calcular-precio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                entrada: "2026-03-10",
                salida: "2026-03-15",
                adultos: 2
            })
        });
        console.log("Price Status:", res2.status);
        const data2 = await res2.json();
        console.log("Price Data:", data2);
    } catch (err) {
        console.error("Test failed:", err);
    }
};

fetchAndLog();
