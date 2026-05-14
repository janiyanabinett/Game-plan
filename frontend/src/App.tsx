import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadCenter from './pages/LeadCenter';
import PropertySearch from './pages/PropertySearch';
import MediaStudio from './pages/MediaStudio';
import MarketingHub from './pages/MarketingHub';
import SalesPipeline from './pages/SalesPipeline';
import Communications from './pages/Communications';
import LetterWriter from './pages/LetterWriter';
import CRM from './pages/CRM';
import AgentLab from './pages/AgentLab';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agent-lab" element={<AgentLab />} />
          <Route path="leads" element={<LeadCenter />} />
          <Route path="sales" element={<SalesPipeline />} />
          <Route path="marketing" element={<MarketingHub />} />
          <Route path="properties" element={<PropertySearch />} />
          <Route path="media" element={<MediaStudio />} />
          <Route path="comms" element={<Communications />} />
          <Route path="letters" element={<LetterWriter />} />
          <Route path="crm" element={<CRM />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
