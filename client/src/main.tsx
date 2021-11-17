import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {IndexRoute} from "./routes/index";
import {ConversationRoute} from "./routes/conversation";

function App() {
  return (
    <div className="h-screen w-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexRoute />} />
          <Route
            path="/conversations/:conversationId"
            element={<ConversationRoute />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
