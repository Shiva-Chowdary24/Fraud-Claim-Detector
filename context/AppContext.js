import { createContext, useState } from "react";
export const AppContext = createContext();
const AppContextProvider = ({ children }) => {
 const backendUrl = "http://127.0.0.1:8000";
 const [userEmail, setUserEmail] = useState(null);
 const value = {
   backendUrl,
   userEmail,
   setUserEmail
 };
 return (
<AppContext.Provider value={value}>
     {children}
</AppContext.Provider>
 );
};
export default AppContextProvider;
