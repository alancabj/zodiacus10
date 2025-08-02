import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Screens
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import ZodiacRoomsScreen from './screens/ZodiacRoomsScreen';
import RoomScreen from './screens/RoomScreen';
import ProfileScreen from './screens/ProfileScreen';
import ZodiacRouletteRoom from './screens/ZodiacRouletteRoom';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />

          {/* RUTAS PROTEGIDAS */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <ZodiacRoomsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/:signo"
            element={
              <ProtectedRoute>
                <RoomScreen />
              </ProtectedRoute>
            }
          />
          <Route path="/zodiac-roulette" element={<ZodiacRouletteRoom />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;