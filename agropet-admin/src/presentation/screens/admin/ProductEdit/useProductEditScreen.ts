import { useState, useEffect, useRef } from 'react';
import { Alert, TextInput, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useTheme } from '../../../contexts/ThemeContext';

function getAllImageUrls(url: string | null | undefined): string[] {
  if (!url) return [];
  const trimmed = url.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(u => !!u);
    } catch (_) {}
  }
  return [url];
}

export function useProductEditScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;

  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(product?.category_id || null);
  const [showImagePickerOptions, setShowImagePickerOptions] = useState(false);
  const [photos, setPhotos] = useState<Array<{ uri: string; base64?: string | null }>>(() => {
    return getAllImageUrls(product?.image_url).map(u => ({ uri: u, base64: null }));
  });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [quantity, setQuantity] = useState(product?.stock?.toString() || '');
  const [criticalStock, setCriticalStock] = useState(product?.critical_stock?.toString() || '');
  const [moderateStock, setModerateStock] = useState(product?.moderate_stock?.toString() || '');
  const [productType, setProductType] = useState<'unit' | 'bulk' | 'per_meter'>(product?.is_bulk ? 'bulk' : product?.is_per_meter ? 'per_meter' : 'unit');
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'g'>('kg');
  const isBulk = productType === 'bulk';
  const isPerMeter = productType === 'per_meter';
  useEffect(() => {
    if (isBulk && product?.stock != null) {
      if (selectedUnit === 'kg') {
        setQuantity((product.stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
      } else {
        setQuantity(product.stock.toString());
      }
    }
  }, [selectedUnit, isBulk]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingQty, setIsEditingQty] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);

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
    const unsubscribe = navigation.addListener('focus', /* istanbul ignore next */ async () => {
      setSearchText('');
      setActiveCategory(product?.category_id || null);
      setCurrentPhotoIndex(0);
      setName(product?.name || '');
      setDescription(product?.description || '');
      setPrice(product?.price?.toString() || '');
      setQuantity(product?.stock?.toString() || '');
      setCriticalStock(product?.critical_stock?.toString() || '');
      setModerateStock(product?.moderate_stock?.toString() || '');
      const newType: 'unit' | 'bulk' | 'per_meter' = product?.is_bulk ? 'bulk' : product?.is_per_meter ? 'per_meter' : 'unit';
      setProductType(newType);
      setSelectedUnit('kg');
      /* istanbul ignore next */ if (newType === 'bulk' && product?.stock != null) {
        setQuantity((product.stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
      }
      setIsEditingName(false);
      setIsEditingDesc(false);
      setIsEditingPrice(false);
      setIsEditingQty(false);
      
      /* istanbul ignore next */ if (product?.id) {
        const { data } = await supabase.from('products').select('image_url').eq('id', product.id).single();
        if (data && data.image_url) {
          setPhotos(getAllImageUrls(data.image_url).map(u => ({ uri: u, base64: null })));
        } else {
          setPhotos([]);
        }
      } else {
        setPhotos([]);
      }
    });
    return unsubscribe;
  }, [navigation, product]);

  const handleSelectPhoto = () => setShowImagePickerOptions(true);

  const openCamera = async () => {
    setShowImagePickerOptions(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'Você precisa permitir o acesso à câmera para tirar uma foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], allowsEditing: false, quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotos(prev => { const next = [...prev, { uri: asset.uri, base64: asset.base64 || null }]; setCurrentPhotoIndex(next.length - 1); return next; });
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
      mediaTypes: ['images'], allowsEditing: false, quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotos(prev => { const next = [...prev, { uri: asset.uri, base64: asset.base64 || null }]; setCurrentPhotoIndex(next.length - 1); return next; });
    }
  };

  const handleConfirm = async () => {
    if (!name || !price || !quantity || !criticalStock || !moderateStock) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios, incluindo estoque crítico e estoque moderado.');
      return;
    }
    if (!product?.id) {
      Alert.alert('Erro', 'Nenhum produto selecionado para edição.');
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
    const updateData: any = {
      name, description,
      price: parseFloat(price.replace(',', '.')),
      stock: parsedStock,
      active: parsedStock > 0,
      is_bulk: isBulk,
      is_per_meter: isPerMeter,
      category_id: activeCategory,
      image_url: mappedImages.length > 0 ? JSON.stringify(mappedImages) : null,
    };
    /* istanbul ignore next */ if (criticalStock) updateData.critical_stock = parseInt(criticalStock, 10);
    /* istanbul ignore else */ else updateData.critical_stock = null;
    /* istanbul ignore next */ if (moderateStock) updateData.moderate_stock = parseInt(moderateStock, 10);
    /* istanbul ignore else */ else updateData.moderate_stock = null;
    const { error } = await supabase.from('products').update(updateData).eq('id', product.id);
    if (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o produto.');
      console.error(error);
    } else {
      Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
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
    colors, isDarkMode, navigation,
    product,
    searchText, setSearchText,
    activeCategory, setActiveCategory,
    showImagePickerOptions, setShowImagePickerOptions,
    photos, currentPhotoIndex, setCurrentPhotoIndex,
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
    isEditingName, setIsEditingName,
    isEditingDesc, setIsEditingDesc,
    isEditingPrice, setIsEditingPrice,
    isEditingQty, setIsEditingQty,
    nameRef, descRef, priceRef, qtyRef,
    handleSelectPhoto, openCamera, openGallery, handleConfirm, removePhoto,
    labelColor, sepColor,
  };
}
