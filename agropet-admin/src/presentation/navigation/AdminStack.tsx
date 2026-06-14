import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminTabs from './AdminTabs';
import ManageProductsScreen from '../screens/admin/ManageProducts';
import ProductCreateScreen from '../screens/admin/ProductCreate';
import OrdersScreen from '../screens/admin/OrdersScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrders';
import AdminSalesHistoryScreen from '../screens/admin/AdminSalesHistory';
import AdminOrderDetailScreen from '../screens/admin/AdminOrderDetail';
import AdminDashboardScreen from '../screens/admin/AdminDashboard';
import AdminConsultSalesScreen from '../screens/admin/AdminConsultSales';
import CashRegisterScreen from '../screens/admin/CashRegister/CashRegisterScreen';
import CashRegisterHistoryScreen from '../screens/admin/CashRegister/CashRegisterHistoryScreen';
import CashRegisterCompareScreen from '../screens/admin/CashRegister/CashRegisterCompareScreen';

const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminTabs">
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ManageProductsScreen" component={ManageProductsScreen} options={{ title: 'Gerenciar Produtos' }} />
      <Stack.Screen name="OrdersScreen" component={OrdersScreen} options={{ title: 'Pedidos dos Clientes' }} />
      <Stack.Screen name="AdminOrdersScreen" component={AdminOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSalesHistoryScreen" component={AdminSalesHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminOrderDetailScreen" component={AdminOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminConsultSalesScreen" component={AdminConsultSalesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CashRegisterScreen" component={CashRegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CashRegisterHistoryScreen" component={CashRegisterHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CashRegisterCompareScreen" component={CashRegisterCompareScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
