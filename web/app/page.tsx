// Landing page — served at "/"
// The (marketing) route group is for sub-pages like /about, /pricing (future).
//
// ⚠️  IMPORTANT: delete app/(marketing)/page.tsx — both files map to "/" and
//    cause a Next.js build conflict. Keep only this file.
//
//    Unix/Mac:    rm 'app/(marketing)/page.tsx'
//    Windows:     del "app\(marketing)\page.tsx"

import LandingPage from "@/components/landing/LandingPage";

export default function HomePage() {
  return <LandingPage />;
}
