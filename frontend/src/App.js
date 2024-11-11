import { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "./ListTodoLists";
import ListToDoLists from "./ListTodoLists";
import ToDoList from "./ToDoList";
import WelcomeScreen from "./WelcomeScreen";

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

  function handleNewToDoList(newName) {
    const updateData = async () => {
      const newListData = {
        name: newName,
      };
      await axios.post(`/api/lists`, newListData);
      reloadData().catch(console.error);
    };
    updateData();
  }

  function handleDeleteToDoList(id) {
    const updateData = async () => {
      await axios.delete(`/api/lists/${id}`);
      reloadData().catch(console.error);
    };
    updateData();
  }

  function handleSelectList(id) {
    console.log("Selecting item", id);
    setSelectedItem(id);
  }

  function backToList() {
    setSelectedItem(null);
    reloadData().catch(console.error);
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/lists" element={
          <ListToDoLists
            listSummaries={listSummaries}
            handleSelectList={handleSelectList}
            handleNewToDoList={handleNewToDoList}
            handleDeleteToDoList={handleDeleteToDoList}
          />
        } />
        <Route path="/list/:id" element={
          <ToDoList listId={selectedItem} handleBackButton={backToList} />
        } />
      </Routes>
    </Router>
  );
}

export default App;