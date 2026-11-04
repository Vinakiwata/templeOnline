import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { HomePage } from "../../features/home/HomePage";
import { SutraLibraryPage } from "../../features/sutra/presentation/SutraLibraryPage";
import { SutraReaderPage } from "../../features/sutra/presentation/SutraReaderPage";
import { MeditationPage } from "../../features/meditation/presentation/MeditationPage";
import { JournalPage } from "../../features/journal/presentation/JournalPage";
import { DeveloperPage } from "../../features/about/presentation/DeveloperPage";

// Chùa 3D được tách bundle riêng: trang đọc kinh/thiền không phải tải Three.js.
const TemplePage = lazy(() => import("../../features/temple/presentation/TemplePage"));

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/chua"
        element={
          <Suspense
            fallback={
              <div className="loading">
                <div className="loading__mark" />
                <p>Đang mở cổng chùa…</p>
              </div>
            }
          >
            <TemplePage />
          </Suspense>
        }
      />
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="kinh" element={<SutraLibraryPage />} />
        <Route path="kinh/:id" element={<SutraReaderPage />} />
        <Route path="thien" element={<MeditationPage />} />
        <Route path="nhat-ky" element={<JournalPage />} />
        <Route path="nha-phat-trien" element={<DeveloperPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
