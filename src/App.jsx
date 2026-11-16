import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.scss'
import MainPage from './MainPage/MainPage.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Provider } from "./components/ui/provider"


function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Provider>
        <MainPage/>
      </Provider>

    </>
  )
}

export default App
