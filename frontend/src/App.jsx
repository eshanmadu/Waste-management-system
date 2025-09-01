import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import LoginPage from "./pages/Login"; 
import Footer from "./components/Footer";
import WasteReporting from "./pages/WasteReporting";
import SignupPage from "./pages/Signup";
import Leaderboard from "./pages/Leaderboard";
import UserProfile from "./pages/UserProfile";
import Volunteer from "./pages/Volunteer";
import ArticlesPage from "./pages/Articles";
import AddArticlePage from "./pages/AddArticle";
import ArticleDetail from "./pages/ArticleDetail";
import Rewards from "./pages/Reward";
import AdminDashboard1 from "./admin/AdminDash1";
import AdRecycles from "./admin/AdRecycles";
import OtpRecycleDetails from "./pages/OtpRecycleDetails";
import WasteTracking from "./pages/WasteTracking";
import SubmittedReports from "./admin/Submittedreports";
import AdRewards from "./admin/AdRewards";
import AdRedeems from "./admin/AdRedeems";
import StaffForm from "./pages/Staff";
import AdArticles from "./admin/AdArticles";
import EventPage from "./pages/EventPage";
import AdStaff from "./admin/AdStaff";
import AdEvents from "./admin/AdEvents";
import AdUsers from "./admin/AdUsers";
import AdReports from "./admin/AdReports";
import Quiz from "./pages/Quiz";
import Help from "./pages/Help";
import Game from "./pages/Game";
import EcoHero from "./games/EcoHero";
import EcoPuzzle from "./games/EcoPuzzle";
import GreenRunner from "./games/GreenRunner";
import MemoryMatch from "./games/MemoryMatch";
import PlasticHunter from "./pages/PlasticHunter";
import RecycleCenter from "./recyclecenter/recycleCenter";
import WasteDistribution from "./pages/WasteDistribution";
import PaymentPage from "./pages/PaymentPage";
export default function App() {
  return (
    <Router>
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen w-full overflow-hidden">
        <div className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} /> 
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/waste/reporting" element={<WasteReporting/>}/>
            <Route path="/waste/tracking" element={<WasteTracking/>}/>
            <Route path="/recycling-otp" element={<OtpRecycleDetails/>}/>
            <Route path="/leaderboard" element={<Leaderboard/>}/>
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/volunteer" element={<Volunteer/>}/>
            <Route path="/articles" element={<ArticlesPage/>}/>
            <Route path="/articles/add" element={<AddArticlePage/>}/>
            <Route path="/articles/:id" element={<ArticleDetail/>}/>
            <Route path="/rewards" element={<Rewards/>}/>
            <Route path="/admin/admin1" element={<AdminDashboard1/>}/>
            <Route path="/admin/adrecycles" element={<AdRecycles/>}/>
            <Route path="/admin/waste-reports" element={<SubmittedReports/>} />
            <Route path="/admin/add-rewards" element={<AdRewards/>} />
            <Route path="/admin/redeems" element={<AdRedeems/>}/>
            <Route path="/staff" element={<StaffForm/>}/>
            <Route path="/admin/articles" element={<AdArticles/>}/>
            <Route path="/events" element={<EventPage />} />
            <Route path="/admin/staff" element={<AdStaff/>}/>
            <Route path="/admin/events" element={<AdEvents/>}/>
            <Route path="/admin/users" element={<AdUsers/>}/>
            <Route path="/admin/reports" element={<AdReports/>}/>
            <Route path="/quiz" element={<Quiz/>}/>
            <Route path="/help" element={<Help/>}/>
            <Route path="/game" element={<Game/>}/>
            <Route path="/ecohero" element={<EcoHero />} />
            <Route path="/ecopuzzle" element={<EcoPuzzle />} />
            <Route path="/greenrunner" element={<GreenRunner />} />
            <Route path="/memorymatch" element={<MemoryMatch />} />
            <Route path="/plastichunter" element={<PlasticHunter />} />
            <Route path="/recyclecenter" element={<RecycleCenter/>}/>
            <Route path="/waste-distribution" element={<WasteDistribution/>}/>
            <Route path="/payment" element={<PaymentPage/>}/>
            {/* Add more routes as needed */}
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}
