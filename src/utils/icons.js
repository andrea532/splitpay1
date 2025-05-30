import React from 'react';
import { Text } from 'react-native';

// Fallback per icone se @expo/vector-icons non disponibile
export const IconComponent = ({ name, size = 24, color = "#000", style = {} }) => {
  const iconMap = {
    'add': '+',
    'arrow-back': '←',
    'people': '👥',
    'chevron-forward': '→',
    'people-outline': '👥',
    'close': '✕',
    'remove': '−',
    'trash': '🗑️',
    'calendar': '📅',
    'location': '📍',
    'receipt-outline': '🧾',
    'card': '💳',
    'checkmark': '✓',
    'alert': '⚠️',
    'information': 'ℹ️',
    'star': '⭐',
    'settings': '⚙️',
    'download': '⬇️',
    'upload': '⬆️',
    'share': '📤',
    'copy': '📋',
    'edit': '✏️',
    'save': '💾',
    'help': '❓',
    'heart': '❤️',
    'home': '🏠',
    'search': '🔍',
    'filter': '🔽',
    'sort': '↕️',
    'refresh': '🔄',
    'menu': '☰',
    'more': '⋯',
    'eye': '👁️',
    'eye-off': '🙈',
    'lock': '🔒',
    'unlock': '🔓',
    'warning': '⚠️',
    'error': '❌',
    'success': '✅',
    'info': 'ℹ️'
  };
  
  const iconText = iconMap[name] || '●';
  
  return (
    <Text 
      style={[
        { 
          fontSize: size, 
          color, 
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: size * 1.2
        }, 
        style
      ]}
    >
      {iconText}
    </Text>
  );
};

// Hook per controllare se le icone vettoriali sono disponibili
export const useVectorIcons = () => {
  try {
    require('@expo/vector-icons');
    return true;
  } catch (e) {
    return false;
  }
};

// Componente condizionale che usa icone vettoriali se disponibili
export const SmartIcon = ({ name, size = 24, color = "#000", style = {} }) => {
  const hasVectorIcons = useVectorIcons();
  
  if (hasVectorIcons) {
    try {
      const { Ionicons } = require('@expo/vector-icons');
      return <Ionicons name={name} size={size} color={color} style={style} />;
    } catch (e) {
      return <IconComponent name={name} size={size} color={color} style={style} />;
    }
  }
  
  return <IconComponent name={name} size={size} color={color} style={style} />;
};