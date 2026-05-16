import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Apartments from "./pages/Apartments.tsx";
import ExplorerV2 from "./pages/ExplorerV2.tsx";
import NotFound from "./pages/NotFound.tsx";
import PromoTopBanner from "@/components/PromoTopBanner";
import PromoPopup from "@/components/PromoPopup";
import { usePromotions } from "@/hooks/usePromotions";
import "./i18n";

const queryClient = new QueryClient();

const PromoLayer = () => {
  const banners = usePromotions({ location: "global" }).filter(p => p.topBanner?.enabled);
  const popups = usePromotions({ location: "global" }).filter(p => p.popup?.enabled);
  return (
    <>
      {banners.slice(0, 1).map(p => <PromoTopBanner key={p.id} promotion={p} />)}
      {popups.slice(0, 1).map(p => <PromoPopup key={p.id} promotion={p} />)}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <PromoLayer />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/explorer/v2" element={<ExplorerV2 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
