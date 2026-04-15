import Route from "@/router"
import { LanguageProvider } from '@/lang/LanguageProvider';
import { Toaster } from 'sonner'

function App() {
  return (
    <LanguageProvider>
      <Toaster />
      <Route />
    </LanguageProvider>
  );
}

export default App
