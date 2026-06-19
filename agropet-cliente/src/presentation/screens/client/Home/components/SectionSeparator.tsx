import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';

interface SectionSeparatorProps {
  title: string;
  onVerTudo?: () => void;
  containerStyle?: object;
}

function formatTitle(title: string) {
  return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
}

export default function SectionSeparator({ title, onVerTudo, containerStyle }: SectionSeparatorProps) {
  const { colors, isDarkMode } = useTheme();
  return (
    <View style={[{ marginHorizontal: 16, marginTop: 36, marginBottom: 10 }, containerStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textDark }}>{formatTitle(title)}</Text>
        {onVerTudo && (
          <TouchableOpacity onPress={onVerTudo} activeOpacity={0.7}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#1C2434' }}>Ver tudo</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 1.5, backgroundColor: isDarkMode ? '#3E3E4A' : '#D0D0D0' }} />
    </View>
  );
}
