import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/footer/footer';
import Home from './Page/Home.page/Home.page';
import EventList from './Page/Func.page/FuncEvent.page';
import EventsManagePage from './Page/Event.page/EventManagePage';
import Registr from './Page/registration/Registr.page';
import ProfileCabinet from './Page/Profile.page/ProfileCabinet';
import ROUTER_PATH from './navigation/path';
import PrivateRoute from './components/authorization/PrivateRoute';
import EventDetailsPage from './Page/EventDetal.page/EventDettal.page';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header className="sticky top-0 z-50" />
        
        <main className="flex-1 bg-[#fef6f1] ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route
                path="/"
                element={<Navigate to={ROUTER_PATH.main_page} replace />}
              />
              <Route path={ROUTER_PATH.main_page} element={<Home />} />
              <Route
                path={ROUTER_PATH.func}
                element={<PrivateRoute element={<EventList />} />}
              />
              <Route path={ROUTER_PATH.registration} element={<Registr />} />
              <Route path={ROUTER_PATH.eventManage} element={<EventsManagePage />} />
              <Route path={ROUTER_PATH.ProfileCabinet} element={<ProfileCabinet />} />
              <Route path={ROUTER_PATH.EventDetail} element={<EventDetailsPage />} />
            </Routes>
          </div>
        </main>

        <Footer className="mb-0" />
      </div>
    </BrowserRouter>
  );
}

export default App;