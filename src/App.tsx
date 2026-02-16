import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Error404 from "./screens/err/Error404";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
