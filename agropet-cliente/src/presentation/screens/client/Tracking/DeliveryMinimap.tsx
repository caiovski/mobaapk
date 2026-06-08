import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import Svg, { Circle, Line as SvgLine } from 'react-native-svg';
import MapView, { Marker } from 'react-native-maps';
import { useDeliveryMinimap } from './useDeliveryMinimap';
import { darkMapStyle, DEFAULT_STORE_LOCATION } from '../Map/constants';
import { CustomDot } from '../Map/components';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_SIZE = 150;
const PADDING = 16;
const ICON_SIZE = 48;

function MapIcon({ isDarkMode }: { isDarkMode: boolean }) {
  const color = isDarkMode ? '#FFFFFF' : '#1C2434';
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="7" />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <SvgLine x1="12" y1="1" x2="12" y2="5" />
      <SvgLine x1="12" y1="19" x2="12" y2="23" />
      <SvgLine x1="1" y1="12" x2="5" y2="12" />
      <SvgLine x1="19" y1="12" x2="23" y2="12" />
    </Svg>
  );
}

export default function DeliveryMinimap({
  orderId,
  status,
  hasDeliveryDeparted,
  isDarkMode,
  onExpand,
}: {
  orderId: string | null;
  status: string;
  hasDeliveryDeparted: boolean;
  isDarkMode: boolean;
  onExpand?: () => void;
}) {
  const { storeLocation, clientLocation, carPosition, hasGpsData, speechBubble } = useDeliveryMinimap(orderId, status, hasDeliveryDeparted);
  const [minimized, setMinimized] = useState(false);

  const posRef = useRef({ x: SCREEN_WIDTH - MAP_SIZE - PADDING, y: 220 });
  const pan = useRef(new Animated.ValueXY(posRef.current)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        posRef.current = {
          x: posRef.current.x + g.dx,
          y: posRef.current.y + g.dy,
        };
      },
    })
  ).current;

  const isNight = () => {
    const h = new Date().getHours();
    return h >= 18 || h < 6;
  };

  if (!orderId) return null;

  const mapStyle = isNight() ? darkMapStyle : undefined;

  const handleToggleMinimize = () => setMinimized((p) => !p);

  if (minimized) {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            zIndex: 50,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleMinimize}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: ICON_SIZE / 2,
            backgroundColor: isDarkMode ? 'rgba(30,30,36,0.7)' : 'rgba(255,255,255,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 6,
          }}
        >
          <MapIcon isDarkMode={isDarkMode} />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 50,
          width: MAP_SIZE,
          height: MAP_SIZE,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onExpand}
        style={{
          width: MAP_SIZE,
          height: MAP_SIZE,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: isDarkMode ? '#3E3E4A' : '#CCC',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        <MapView
          style={{ flex: 1 }}
          initialRegion={DEFAULT_STORE_LOCATION}
          customMapStyle={mapStyle}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: storeLocation.latitude,
              longitude: storeLocation.longitude,
            }}
          >
            <CustomDot color="#E53935" borderColor="#FFFFFF" size={14} />
          </Marker>

          {clientLocation && (
            <Marker coordinate={clientLocation}>
              <CustomDot color="#2196F3" borderColor="#FFFFFF" size={14} />
            </Marker>
          )}

          {carPosition && (
            <Marker
              coordinate={carPosition}
              anchor={{ x: 0.5, y: 1 }}
              flat
            >
              <View style={{ alignItems: 'center' }}>
                {speechBubble && (
                  <View style={{
                    backgroundColor: isDarkMode ? 'rgba(46,46,56,0.95)' : 'rgba(255,255,255,0.95)',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginBottom: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 4,
                    borderLeftWidth: 3,
                    borderLeftColor: '#339914',
                    maxWidth: 130,
                  }}>
                    <Text style={{
                      fontSize: 9,
                      color: isDarkMode ? '#FFFFFF' : '#333',
                      fontWeight: '600',
                      textAlign: 'center',
                    }} numberOfLines={2}>
                      {speechBubble}
                    </Text>
                  </View>
                )}
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#4CAF50',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.4,
                  shadowRadius: 2,
                  elevation: 4,
                }} />
              </View>
            </Marker>
          )}
        </MapView>

        <View style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)',
          borderRadius: 4,
          paddingHorizontal: 6,
          paddingVertical: 2,
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' }}>
            {hasGpsData ? 'AO VIVO' : 'PARADO'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleToggleMinimize}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
            borderRadius: 10,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{
            fontSize: 12,
            color: isDarkMode ? '#FFFFFF' : '#333',
            fontWeight: 'bold',
            lineHeight: 14,
          }}>
            _
          </Text>
        </TouchableOpacity>

        <View style={{
          position: 'absolute',
          top: 4,
          right: 4,
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
          borderRadius: 10,
          width: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 12,
            color: isDarkMode ? '#FFFFFF' : '#333',
            fontWeight: 'bold',
          }}>⛶</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
