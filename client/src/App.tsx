import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const testBackend = async () => {
            try {
                const response = await api.get("/health");
                setMessage(response.data.message);
            } catch (error) {
                console.error("Backend connection failed:", error);
            }
        };
        testBackend();
    }, []);
    return (
        <div>
            <h1>Vroom Style(s)</h1>
            <p>{message}</p>
        </div>
    );
}

export default App;