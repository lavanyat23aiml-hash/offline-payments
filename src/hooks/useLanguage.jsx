import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    // Utility function to get translated text
    const t = (key) => {
        // Fallback sequentially: Current Language -> English -> original key string
        const langDict = translations[language];
        const enDict = translations['en'];
        
        if (langDict && langDict[key]) {
            return langDict[key];
        }
        if (enDict && enDict[key]) {
            return enDict[key];
        }
        return key; 
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
