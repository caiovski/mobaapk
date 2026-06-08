import { useNavigation, useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';

export function useLegalPagesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const pageType: 'privacy' | 'terms' = route.params?.type || 'privacy';

  const handleClose = () => {
    navigation.goBack();
  };

  return { pageType, handleClose };
}
