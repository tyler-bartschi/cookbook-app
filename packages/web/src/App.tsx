import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./mainLayout/MainLayout";

const App = () => {
  return (
    <div>
      {/* add a Toaster here probably */}
      <BrowserRouter>
        {/* figure out authentication, does authenticated routes matter? probably yes */}
        <TempRoutes />
      </BrowserRouter>
    </div>
  );
};

const TempRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<TempRoute />} />
      </Route>
    </Routes>
  );
};

const TempRoute = () => {
  return <div>hello</div>;
};

export default App;
