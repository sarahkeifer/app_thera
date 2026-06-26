import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from 'react-router-dom'
import {register} from '@public-ui/components'
import {defineCustomElements} from '@public-ui/components/loader'
// import { DEFAULT } from '@public-ui/theme-default'
import {CustomTheme} from "./theme/CustomTheme.ts";
import * as KolComponents from '@public-ui/components';

console.log(Object.keys(KolComponents));


//hier haben wir CustomTheme, das ist unser eigenes Dokument mit unserem Style der Komponenten
//hier könnte man noch das DEFAULT dazuschreiben, für anderen style
register([CustomTheme], defineCustomElements).then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </StrictMode>
    )
})