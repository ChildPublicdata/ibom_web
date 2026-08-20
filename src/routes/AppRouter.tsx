import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomeScreen } from '@/screens/HomeScreen'
import { SafePlaceSetupScreen } from '@/screens/SafePlaceSetupScreen'
import { SafeZoneSetupScreen } from '@/screens/SafeZoneSetupScreen'
import { SplashScreen } from '@/screens/SplashScreen'
import { UserSelectScreen } from '@/screens/UserSelectScreen'
import { WelcomeScreen } from '@/screens/WelcomeScreen'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/user-select" element={<UserSelectScreen />} />
        <Route path="/safe-place-setup" element={<SafePlaceSetupScreen />} />
        <Route path="/safe-zone-setup" element={<SafeZoneSetupScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
