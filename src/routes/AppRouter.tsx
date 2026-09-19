import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomeScreen } from '@/screens/HomeScreen'
import { ChildInfoScreen } from '@/screens/ChildInfoScreen'
import { SafePlaceSetupScreen } from '@/screens/SafePlaceSetupScreen'
import { SafePlaceSearchScreen } from '@/screens/SafePlaceSearchScreen'
import { SafeZoneSetupScreen } from '@/screens/SafeZoneSetupScreen'
import { SafetyAreaScreen } from '@/screens/SafetyAreaScreen'
import { SplashScreen } from '@/screens/SplashScreen'
import { UserSelectScreen } from '@/screens/UserSelectScreen'
import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { ParentSignupScreen } from '@/screens/ParentSignupScreen'
import { FamilyCodeScreen } from '@/screens/FamilyCodeScreen'
import { LoginScreen } from '@/screens/LoginScreen'
import { FamilyCodeInputScreen } from '@/screens/FamilyCodeInputScreen'
import { RequireAuth } from '@/components/RequireAuth'
import { AiModeScreen } from '@/screens/AiModeScreen'
import { FamilyConnectedScreen } from '@/screens/FamilyConnectedScreen'
import { SafePlacesScreen } from '@/screens/SafePlacesScreen'
import { UserFeedbackScreen } from '@/screens/UserFeedbackScreen'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/user-select" element={<UserSelectScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/parent-signup" element={<ParentSignupScreen />} />
        <Route path="/child-info" element={<ChildInfoScreen />} />
        <Route
          path="/family-code"
          element={
            <RequireAuth role="CHILD">
              <FamilyCodeScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/family-code-input"
          element={
            <RequireAuth role="PARENT">
              <FamilyCodeInputScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/family-connected"
          element={
            <RequireAuth role="PARENT">
              <FamilyConnectedScreen />
            </RequireAuth>
          }
        />
        <Route path="/safe-place-setup" element={<SafePlaceSetupScreen />} />
        <Route path="/safe-place-search" element={<SafePlaceSearchScreen />} />
        <Route path="/safe-zone-setup" element={<SafeZoneSetupScreen />} />
        <Route path="/safe-places" element={<SafePlacesScreen />} />
        <Route path="/safety-area" element={<SafetyAreaScreen />} />
        <Route path="/ai-mode" element={<AiModeScreen />} />
        <Route
          path="/user-feedback"
          element={
            <RequireAuth role="PARENT">
              <UserFeedbackScreen />
            </RequireAuth>
          }
        />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
