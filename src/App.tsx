import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import reactLogo from './assets/react.svg';
import './App.css';
import { SharedThemeProvider } from './hooks/useTheme.tsx';
import { Pages } from './pages/Pages.tsx';

function App() {
  const [count, setCount] = useState(0);
  return (
    <BrowserRouter>
      <SharedThemeProvider>
        <Pages />
        <div>
          <a href='https://vite.dev' target='_blank' rel='noreferrer'>
            <img src={'/vite.svg'} className='logo' alt='Vite logo' />
          </a>
          <a href='https://react.dev' target='_blank' rel='noreferrer'>
            <img src={reactLogo} className='logo react' alt='React logo' />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className='card'>
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
      </SharedThemeProvider>
    </BrowserRouter>
  );
}

export default App;
