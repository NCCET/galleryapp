// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import gallery from './components/gallery';
import camere from './components/Camere';


const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Camere" component={camere} /> {/* Corrected component name */}
        <Stack.Screen name="Gallery" component={gallery} /> {/* Corrected component name */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;