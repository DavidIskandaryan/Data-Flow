import { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ListToDoLists from "./ListTodoLists";
import ToDoList from "./ToDoList";
import WelcomeScreen from "./WelcomeScreen";
import { FileProvider } from "./FileContext";
import { AuthProvider } from "./AuthContext";
import AnalyzeScreen from "./AnalyzeScreen";
import Header from "./Header";
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";

function App() {
  const [listSummaries, setListSummaries] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    reloadData().catch(console.error);
  }, []);

  async function reloadData() {
    const response = await axios.get("/api/lists");
    const data = await response.data;
    setListSummaries(data);
  }

  return (
    <AuthProvider>
      <FileProvider>
        <Router>
          <Header />
          <div className="mainContent">
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/lists" element={<ListToDoLists />} />
              <Route path="/analyze" element={<AnalyzeScreen />} />
            </Routes>
          </div>
        </Router>
      </FileProvider>
    </AuthProvider>
  );
}

export default App;