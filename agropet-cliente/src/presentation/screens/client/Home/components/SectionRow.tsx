import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import SectionSeparator from './SectionSeparator';
import SlideInWrapper from './SlideInWrapper';

interface SectionRowProps {
  title: string;
  products: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  onVerTudo: () => void;
  horizontalReady: boolean;
  separatorStyle?: object;
  scrollMarginVertical?: number;
}

export default function SectionRow({ title, products, renderItem, onVerTudo, horizontalReady, separatorStyle, scrollMarginVertical }: SectionRowProps) {
  const { isDarkMode } = useTheme();

  return (
    <>
      <SectionSeparator title={title} containerStyle={separatorStyle} onVerTudo={onVerTudo} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, marginVertical: scrollMarginVertical ?? 6 }}>
        {products.map((item, idx) => (
          <SlideInWrapper key={item.id} visible={horizontalReady} delay={idx * 80}>
            {renderItem(item, idx)}
          </SlideInWrapper>
        ))}
      </ScrollView>
      <View style={{ marginHorizontal: 16, marginTop: 8, height: 1.5, backgroundColor: isDarkMode ? '#3E3E4A' : '#D0D0D0' }} />
    </>
  );
}
