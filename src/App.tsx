// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingFallback } from "@/components/LoadingFallback";

// Lazy load views for code splitting
const LandingPage = lazy(() => import("@/views/LandingPage"));
const Dashboard = lazy(() => import("@/views/Dashboard"));
const DataIngestion = lazy(() => import("@/views/DataIngestion"));
const Visualization = lazy(() => import("@/views/Visualization"));
const SQLConsole = lazy(() => import("@/views/SQLConsole"));
const AIInsights = lazy(() => import("@/views/AIInsights"));
const Settings = lazy(() => import("@/views/Settings"));


function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="pith-theme">
        <BrowserRouter>
          <Routes>
            {/* Landing Page - No Layout */}
            <Route
              path="/"
              element={
                <Suspense fallback={<PageLoadingFallback message="Loading..." />}>
                  <LandingPage />
                </Suspense>
              }
            />

            {/* Main App - With Layout */}
            <Route element={<MainLayout />}>
              <Route
                path="/app"
                element={
                  <Suspense fallback={<PageLoadingFallback message="Loading Dashboard..." />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="/data"
                element={
                  <Suspense fallback={<PageLoadingFallback message="Loading Data Ingestion..." />}>
                    <DataIngestion />
                  </Suspense>
                }
              />
              <Route
                path="/sql"
                element={
                  <Suspense fallback={<PageLoadingFallback message="Loading SQL Console..." />}>
                    <SQLConsole />
                  </Suspense>
                }
              />
              <Route
                path="/visualize"
                element={
                  <Suspense fallback={<PageLoadingFallback message="Loading Visualization..." />}>
                    <Visualization />
                  </Suspense>
                }
              />
              <Route
                path="/ai"
                element={
                  <Suspense fallback={<PageLoadingFallback message="Loading AI Insights..." />}>
                    <AIInsights />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageLoadingFallback message="Loading Settings..." />}>
                    <Settings />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;