import { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ListToDoLists from "./ListTodoLists";
import ToDoList from "./ToDoList";
import WelcomeScreen from "./WelcomeScreen";
import { FileProvider } from "./FileContext";
import AnalyzeScreen from "./AnalyzeScreen";

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
    <FileProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/lists" element={<ListToDoLists />} />
          <Route path="/analyze" element={<AnalyzeScreen />} />
        </Routes>
      </Router>
    </FileProvider>
  );
}

export default App;
