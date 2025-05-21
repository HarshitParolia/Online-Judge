import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import UseCustomContext from './useCustomContext';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <UseCustomContext>
    {/* <React.StrictMode> */}
      <App />
    {/* </React.StrictMode> */}
   </UseCustomContext>
)
