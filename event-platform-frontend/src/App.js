import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/footer/footer';
import Home from './Page/Home.page/Home.page';
import Func from './Page/Func.page/Func.page';
import EventsManagePage from './Page/Event.page/EventManagePage';
import Registr from './Page/registration/Registr.page';
import ProfileCabinet from './Page/Profile.page/ProfileCabinet';
import ROUTER_PATH from './navigation/path';
import PrivateRoute from './components/authorization/PrivateRoute';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Header />
        <Routes>
          <Route
            path="/"
            element={<Navigate to={ROUTER_PATH.main_page} replace />}
          />
          <Route path={ROUTER_PATH.main_page} element={<Home />} />
          <Route
            path={ROUTER_PATH.func}
            element={<PrivateRoute element={<Func />} />}
          />
          <Route path={ROUTER_PATH.registration} element={<Registr />} />
          <Route path={ROUTER_PATH.eventManage} element={<EventsManagePage />} />
          <Route path={ROUTER_PATH.ProfileCabinet} element={<ProfileCabinet />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
