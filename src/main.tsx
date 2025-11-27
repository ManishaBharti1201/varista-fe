import {createRoot} from 'react-dom/client';
import App from './App'; // Import your main App component
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
} else {
  console.error("Root element with ID 'root' not found in the document.");
}