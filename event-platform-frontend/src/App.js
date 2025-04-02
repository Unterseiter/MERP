import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/footer/footer';
import Home from './Page/Home.page/Home.page';
import Func from './Page/Func.page/Func.page';
import Registr from './Page/registration/Registr.page';
import ROUTER_PATH from './navigation/path';


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
          <Route path={ROUTER_PATH.func} element={<Func />} />
          <Route path={ROUTER_PATH.registration} element={<Registr />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
