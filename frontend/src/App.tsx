import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadCenter from './pages/LeadCenter';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import AIAdvisor from './pages/AIAdvisor';
import BudgetPlanner from './pages/BudgetPlanner';
import InvestmentSimulator from './pages/InvestmentSimulator';
import DebtCalculator from './pages/DebtCalculator';
import StudentLoanAnalyzer from './pages/StudentLoanAnalyzer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadCenter />} />
          <Route path="modules" element={<Modules />} />
          <Route path="modules/:id" element={<ModuleDetail />} />
          <Route path="ai-advisor" element={<AIAdvisor />} />
          <Route path="budget-planner" element={<BudgetPlanner />} />
          <Route path="investment-simulator" element={<InvestmentSimulator />} />
          <Route path="debt-calculator" element={<DebtCalculator />} />
          <Route path="loan-analyzer" element={<StudentLoanAnalyzer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
