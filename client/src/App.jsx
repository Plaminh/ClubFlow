import { BrowserRouter } from 'react-router-dom';
import { DemoSessionProvider } from './contexts/DemoSessionContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <DemoSessionProvider>
        <AppRoutes />
      </DemoSessionProvider>
    </BrowserRouter>
  );
}
