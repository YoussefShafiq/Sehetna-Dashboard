import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('en');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') || 'en';
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);

        // Set document direction based on language
        document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLanguage;
    }, [i18n]);

    const changeLanguage = (language) => {
        setCurrentLanguage(language);
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);

        // Set document direction based on language
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    };

    const value = {
        currentLanguage,
        changeLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}; 