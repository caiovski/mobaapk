import { useState, useEffect, useRef } from 'react';
import { Alert, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useTheme } from '../../../contexts/ThemeContext';

export function useProductCreateScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [showImagePickerOptions, setShowImagePickerOptions] = useState(false);
  const [photos, setPhotos] = useState<Array<{ uri: string; base64?: string | null }>>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [criticalStock, setCriticalStock] = useState('');
  const [moderateStock, setModerateStock] = useState('');
  const [productType, setProductType] = useState<'unit' | 'bulk' | 'per_meter'>('unit');
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'g'>('kg');
  const isBulk = productType === 'bulk';
  const isPerMeter = productType === 'per_meter';

  const criticalBlink = useRef(new Animated.Value(1)).current;
  const moderateBlink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const critAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(criticalBlink, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(criticalBlink, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    const modAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(moderateBlink, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(moderateBlink, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    critAnim.start();
    modAnim.start();
    return () => { critAnim.stop(); modAnim.stop(); };
  }, [criticalBlink, moderateBlink]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchText('');
      setPhotos([]);
      setCurrentPhotoIndex(0);
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setCriticalStock('');
      setModerateStock('');
      setProductType('unit');
      setSelectedUnit('kg');
    });
    return unsubscribe;
  }, [navigation]);

  const handleSelectPhoto = () => setShowImagePickerOptions(true);

  const openCamera = async () => {
    setShowImagePickerOptions(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'Você precisa permitir o acesso à câmera para tirar uma foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotos(prev => {
        const next = [...prev, { uri: asset.uri, base64: asset.base64 || null }];
        setCurrentPhotoIndex(next.length - 1);
        return next;
      });
    }
  };

  const openGallery = async () => {
    setShowImagePickerOptions(false);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'Você precisa permitir o acesso à galeria para selecionar uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotos(prev => {
        const next = [...prev, { uri: asset.uri, base64: asset.base64 || null }];
        setCurrentPhotoIndex(next.length - 1);
        return next;
      });
    }
  };

  const handleRegister = async () => {
    if (!name || !price || !quantity || !criticalStock || !moderateStock) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios, incluindo estoque crítico e estoque moderado.');
      return;
    }
    
    const mappedImages: string[] = [];
    for (const p of photos) {
      if (p.base64) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, decode(p.base64), { contentType: 'image/jpeg' });
        
        /* istanbul ignore next */ if (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          continue;
        }
        
        /* istanbul ignore next */ if (uploadData) {
          const { data } = supabase.storage.from('products').getPublicUrl(uploadData.path);
          mappedImages.push(data.publicUrl);
        }
      } else {
        mappedImages.push(p.uri);
      }
    }
    const parsedStock = isBulk
      ? (selectedUnit === 'kg' ? parseFloat(quantity.replace(',', '.')) * 1000 : parseInt(quantity, 10))
      : isPerMeter
        ? parseFloat(quantity.replace(',', '.'))
        : parseInt(quantity, 10);
    const payload: Record<string, any> = {
      name,
      description,
      price: parseFloat(price.replace(',', '.')),
      stock: parsedStock,
      active: parsedStock > 0,
      is_bulk: isBulk,
      is_per_meter: isPerMeter,
      image_url: mappedImages.length > 0 ? JSON.stringify(mappedImages) : null,
    };
    /* istanbul ignore next */ if (criticalStock) payload.critical_stock = parseInt(criticalStock, 10);
    /* istanbul ignore next */ if (moderateStock) payload.moderate_stock = parseInt(moderateStock, 10);
    const { error } = await supabase.from('products').insert([payload]);
    if (error) {
      Alert.alert('Erro', 'Não foi possível registrar o produto.');
      console.error(error);
    } else {
      Alert.alert('Sucesso', 'Produto registrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Gerenciar') }
      ]);
    }
  };

  const removePhoto = () => {
    const newPhotos = [...photos];
    newPhotos.splice(currentPhotoIndex, 1);
    setPhotos(newPhotos);
    setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
  };

  const labelColor = isDarkMode ? '#FFFFFF' : '#8A7268';
  const sepColor = isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268';

  return {
    colors,
    isDarkMode,
    navigation,
    searchText, setSearchText,
    showImagePickerOptions, setShowImagePickerOptions,
    photos, setPhotos,
    currentPhotoIndex, setCurrentPhotoIndex,
    name, setName,
    description, setDescription,
    price, setPrice,
    quantity, setQuantity,
    criticalStock, setCriticalStock,
    moderateStock, setModerateStock,
    productType, setProductType,
    isBulk, isPerMeter,
    selectedUnit, setSelectedUnit,
    criticalBlink, moderateBlink,
    handleSelectPhoto,
    openCamera,
    openGallery,
    handleRegister,
    removePhoto,
    labelColor, sepColor,
  };
}
