import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 导入屏幕组件
import WordListScreen from './screens/WordListScreen';
import AddWordScreen from './screens/AddWordScreen';
import QuizScreen from './screens/QuizScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [words, setWords] = useState([]);

  // 加载保存的单词
  useEffect(() => {
    const loadWords = async () => {
      try {
        const savedWords = await AsyncStorage.getItem('vocabularyWords');
        if (savedWords) {
          setWords(JSON.parse(savedWords));
        }
      } catch (error) {
        console.error('Failed to load words:', error);
      }
    };

    loadWords();
  }, []);

  // 保存单词到本地存储
  const saveWords = async (newWords) => {
    try {
      await AsyncStorage.setItem('vocabularyWords', JSON.stringify(newWords));
      setWords(newWords);
    } catch (error) {
      console.error('Failed to save words:', error);
    }
  };

  // 添加新单词
  const addWord = (english, chinese) => {
    // 检查是否已存在相同单词
    const exists = words.some(word => 
      word.english.toLowerCase() === english.toLowerCase()
    );
    
    if (exists) {
      return false;
    }
    
    const newWord = {
      id: Date.now().toString(),
      english: english.trim(),
      chinese: chinese.trim(),
      createdAt: new Date().toISOString()
    };
    
    const updatedWords = [...words, newWord];
    saveWords(updatedWords);
    return true;
  };

  // 删除单词
  const deleteWord = (id) => {
    const updatedWords = words.filter(word => word.id !== id);
    saveWords(updatedWords);
  };

  // 批量导入单词
  const importWords = (newWords) => {
    // 过滤掉已存在的单词
    const filteredWords = newWords.filter(newWord => 
      !words.some(existingWord => 
        existingWord.english.toLowerCase() === newWord.english.toLowerCase()
      )
    );
    
    if (filteredWords.length > 0) {
      const updatedWords = [...words, ...filteredWords];
      saveWords(updatedWords);
    }
    
    return filteredWords.length;
  };

  // 清空所有单词
  const clearAllWords = () => {
    saveWords([]);
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === '单词列表') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === '添加单词') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === '单词默写') {
              iconName = focused ? 'school' : 'school-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="单词列表">
          {props => (
            <WordListScreen 
              {...props} 
              words={words} 
              deleteWord={deleteWord} 
              clearAllWords={clearAllWords}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="添加单词">
          {props => (
            <AddWordScreen 
              {...props} 
              addWord={addWord}
              importWords={importWords}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="单词默写">
          {props => (
            <QuizScreen 
              {...props} 
              words={words} 
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
