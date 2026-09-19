import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TypeDrummer from "./components/TypeDrummer";
import { Toaster } from "./components/ui/toaster";
import InstallApp from "./components/InstallApp";

function App() {
  return (
    <div className="App">
      <InstallApp />
      <BrowserRouter basename={new URL(process.env.PUBLIC_URL || '/', window.location.origin).pathname}>
        <Routes>
          <Route path="/" element={<TypeDrummer />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
