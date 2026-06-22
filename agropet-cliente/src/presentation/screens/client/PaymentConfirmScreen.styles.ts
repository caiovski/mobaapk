import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingBottom: 120,
  },
  checkIcon: {
    marginBottom: 40,
  },
  successTitle: {
    marginBottom: 50,
  },
  btnAcompanhar: {
    width: 211,
    height: 75,
    backgroundColor: '#1C2434',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarOuter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 16,
    right: 16,
  },
  tabBarInner: {
    flexDirection: 'row',
    backgroundColor: '#E3E4EB',
    borderRadius: 30,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabSeparator: {
    width: 1,
    height: 49,
    backgroundColor: '#8A7268',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 51,
    height: 41,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartSelectedLight: {
    width: 51,
    height: 41,
    borderRadius: 20,
    backgroundColor: '#E3DAD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartSelectedDark: {
    backgroundColor: '#1E1E24',
    width: 51,
    height: 41,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
