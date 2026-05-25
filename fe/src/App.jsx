import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientReport from './pages/ClientReport';
import TaskMaster from './pages/TaskMaster';
import TaskReport from './pages/TaskReport';
import StateMaster from './pages/StateMaster';
import CityMaster from './pages/CityMaster';
import ProjectMaster from './pages/ProjectMaster';
import ClientMaster from './pages/ClientMaster';
import EmployeeMaster from './pages/EmployeeMaster';
import AddUser from './pages/AddUser';
import AddProject from './pages/AddProject';
import AddTask from './pages/AddTask';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/client-report" element={<ClientReport />} />
          <Route path="/task-master" element={<TaskMaster />} />
          <Route path="/task-report" element={<TaskReport />} />
          <Route path="/state-master" element={<StateMaster />} />
          <Route path="/city-master" element={<CityMaster />} />
          <Route path="/project-master" element={<ProjectMaster />} />
          <Route path="/client-master" element={<ClientMaster />} />
          <Route path="/employee-master" element={<EmployeeMaster />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/edit-user/:id" element={<AddUser />} />
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/edit-project/:id" element={<AddProject />} />
          <Route path="/add-task" element={<AddTask />} />
          <Route path="/edit-task/:id" element={<AddTask />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
