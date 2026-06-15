import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { register } from '@public-ui/components'
import { defineCustomElements } from '@public-ui/components/loader'
import { DEFAULT } from '@public-ui/theme-default'

register([DEFAULT], defineCustomElements).then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>
    )
})