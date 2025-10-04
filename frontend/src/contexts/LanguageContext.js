import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translationData = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Settings
    settings: 'Settings',
    profile: 'Profile',
    security: 'Security',
    preferences: 'Preferences',
    notifications: 'Notifications',
    privacy: 'Privacy',
    
    // Profile
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    accountType: 'Account Type',
    memberSince: 'Member Since',
    lastLogin: 'Last Login',
    accountStatus: 'Account Status',
    
    // Security
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    exportData: 'Export Data',
    deleteAccount: 'Delete Account',
    
    // Preferences
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
  },
  es: {
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    
    // Settings
    settings: 'Configuración',
    profile: 'Perfil',
    security: 'Seguridad',
    preferences: 'Preferencias',
    notifications: 'Notificaciones',
    privacy: 'Privacidad',
    
    // Profile
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',
    accountType: 'Tipo de Cuenta',
    memberSince: 'Miembro Desde',
    lastLogin: 'Último Acceso',
    accountStatus: 'Estado de Cuenta',
    
    // Security
    changePassword: 'Cambiar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Nueva Contraseña',
    exportData: 'Exportar Datos',
    deleteAccount: 'Eliminar Cuenta',
    
    // Preferences
    theme: 'Tema',
    language: 'Idioma',
    light: 'Claro',
    dark: 'Oscuro',
    auto: 'Automático',
    english: 'Inglés',
    spanish: 'Español',
    french: 'Francés',
  },
  fr: {
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    
    // Settings
    settings: 'Paramètres',
    profile: 'Profil',
    security: 'Sécurité',
    preferences: 'Préférences',
    notifications: 'Notifications',
    privacy: 'Confidentialité',
    
    // Profile
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    email: 'Adresse e-mail',
    accountType: 'Type de compte',
    memberSince: 'Membre depuis',
    lastLogin: 'Dernière connexion',
    accountStatus: 'Statut du compte',
    
    // Security
    changePassword: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    exportData: 'Exporter les données',
    deleteAccount: 'Supprimer le compte',
    
    // Preferences
    theme: 'Thème',
    language: 'Langue',
    light: 'Clair',
    dark: 'Sombre',
    auto: 'Automatique',
    english: 'Anglais',
    spanish: 'Espagnol',
    french: 'Français',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('userLanguage');
    return saved || 'en';
  });

  const [translations, setTranslations] = useState(translationData[language]);

  useEffect(() => {
    setTranslations(translationData[language]);
    localStorage.setItem('userLanguage', language);
  }, [language]);

  const t = (key) => {
    return translations[key] || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
