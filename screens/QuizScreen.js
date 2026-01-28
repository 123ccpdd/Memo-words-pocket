import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuizScreen = ({ words }) => {
  const [quizMode, setQuizMode] = useState('chinese-to-english');
  const [quizScope, setQuizScope] = useState('all');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizWords, setQuizWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState([]);
  const [showAnswerForCurrent, setShowAnswerForCurrent] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  // 开始默写
  const startQuiz = () => {
    if (words.length === 0) {
      Alert.alert('提示', '请先添加单词');
      return;
    }

    // 根据选择的范围准备单词
    let selectedWords;
    if (quizScope === 'all') {
      selectedWords = [...words];
    } else {
      // 随机选择10个单词（如果不足10个则取全部）
      selectedWords = [...words]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(10, words.length));
    }

    // 打乱顺序
    selectedWords = selectedWords.sort(() => 0.5 - Math.random());

    setQuizWords(selectedWords);
    setUserAnswers(new Array(selectedWords.length).fill(''));
    setCurrentIndex(0);
    setUserAnswer('');
    setShowAnswerForCurrent(false);
    setShowAllAnswers(false);
    setQuizStarted(true);
  };

  // 前往上一个单词
  const goToPrev = () => {
    if (currentIndex > 0) {
      // 保存当前答案
      const updatedAnswers = [...userAnswers];
      updatedAnswers[currentIndex] = userAnswer;
      setUserAnswers(updatedAnswers);
      
      setCurrentIndex(currentIndex - 1);
      setUserAnswer(userAnswers[currentIndex - 1] || '');
      setShowAnswerForCurrent(false); // 切换单词时隐藏答案
    }
  };

  // 前往下一个单词
  const goToNext = () => {
    if (currentIndex < quizWords.length - 1) {
      // 保存当前答案
      const updatedAnswers = [...userAnswers];
      updatedAnswers[currentIndex] = userAnswer;
      setUserAnswers(updatedAnswers);
      
      setCurrentIndex(currentIndex + 1);
      setUserAnswer(userAnswers[currentIndex + 1] || '');
      setShowAnswerForCurrent(false); // 切换单词时隐藏答案
    }
  };

  // 显示当前单词答案
  const handleShowCurrentAnswer = () => {
    // 保存当前答案
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = userAnswer;
    setUserAnswers(updatedAnswers);
    
    setShowAnswerForCurrent(true);
  };

  // 显示全部答案
  const handleShowAllAnswers = () => {
    // 保存当前答案
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = userAnswer;
    setUserAnswers(updatedAnswers);
    
    setShowAllAnswers(true);
  };

  // 重新开始默写
  const restartQuiz = () => {
    startQuiz();
  };

  // 返回默写界面
  const backToQuiz = () => {
    setShowAllAnswers(false);
  };

  // 渲染默写设置界面
  const renderQuizSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.title}>单词默写</Text>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>默写模式</Text>
        
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioButton, quizMode === 'chinese-to-english' && styles.radioSelected]}
            onPress={() => setQuizMode('chinese-to-english')}
          >
            <View style={styles.radioCircle}>
              {quizMode === 'chinese-to-english' && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioText}>看中文写英文</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.radioButton, quizMode === 'english-to-chinese' && styles.radioSelected]}
            onPress={() => setQuizMode('english-to-chinese')}
          >
            <View style={styles.radioCircle}>
              {quizMode === 'english-to-chinese' && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioText}>看英文写中文</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>单词范围</Text>
        
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioButton, quizScope === 'all' && styles.radioSelected]}
            onPress={() => setQuizScope('all')}
          >
            <View style={styles.radioCircle}>
              {quizScope === 'all' && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioText}>全部单词</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.radioButton, quizScope === 'random' && styles.radioSelected]}
            onPress={() => setQuizScope('random')}
          >
            <View style={styles.radioCircle}>
              {quizScope === 'random' && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioText}>随机10个</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
        <Ionicons name="play-outline" size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>开始默写</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染默写界面
  const renderQuizInterface = () => {
    if (quizWords.length === 0) return null;

    const currentWord = quizWords[currentIndex];
    const promptText = quizMode === 'chinese-to-english' 
      ? currentWord.chinese 
      : currentWord.english;

    return (
      <View style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>正在默写</Text>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{quizWords.length}
          </Text>
        </View>

        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>{promptText}</Text>
          
          <TextInput
            style={styles.answerInput}
            placeholder={quizMode === 'chinese-to-english' ? '请输入英文单词...' : '请输入中文释义...'}
            placeholderTextColor="#999"
            value={userAnswer}
            onChangeText={setUserAnswer}
            autoCapitalize={quizMode === 'chinese-to-english' ? 'none' : 'sentences'}
            autoFocus={true}
          />

          {/* 显示当前单词的答案 */}
          {showAnswerForCurrent && (
            <View style={styles.currentAnswerContainer}>
              <Text style={styles.answerLabel}>正确答案：</Text>
              <Text style={styles.correctAnswerText}>
                {quizMode === 'chinese-to-english' ? currentWord.english : currentWord.chinese}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrev}
            disabled={currentIndex === 0}
          >
            <Ionicons name="arrow-back-outline" size={18} color={currentIndex === 0 ? '#999' : '#666'} />
            <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>上一个</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, currentIndex === quizWords.length - 1 && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={currentIndex === quizWords.length - 1}
          >
            <Text style={[styles.navButtonText, currentIndex === quizWords.length - 1 && styles.navButtonTextDisabled]}>下一个</Text>
            <Ionicons name="arrow-forward-outline" size={18} color={currentIndex === quizWords.length - 1 ? '#999' : '#666'} />
          </TouchableOpacity>
        </View>

        <View style={styles.quizActions}>
          <TouchableOpacity style={styles.showAnswerButton} onPress={handleShowCurrentAnswer}>
            <Ionicons name="eye-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>查看答案</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.showAllButton} onPress={handleShowAllAnswers}>
            <Ionicons name="list-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>查看全部</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 渲染全部答案界面
  const renderAllAnswers = () => {
    return (
      <View style={styles.answersContainer}>
        <Text style={styles.title}>答案对照</Text>
        
        <ScrollView style={styles.answersList} showsVerticalScrollIndicator={true}>
          {quizWords.map((word, index) => (
            <View key={word.id} style={styles.answerItem}>
              <Text style={styles.answerNumber}>{index + 1}.</Text>
              
              <View style={[styles.answerContent, currentIndex === index && styles.currentAnswerHighlight]}>
                <Text style={styles.questionText}>
                  {quizMode === 'chinese-to-english' ? word.chinese : word.english}
                </Text>
                
                <View style={styles.answersCompare}>
                  <View>
                    <Text style={styles.answerLabel}>你的答案：</Text>
                    <Text style={styles.userAnswerText}>
                      {userAnswers[index] || <Text style={styles.emptyAnswer}>未填写</Text>}
                    </Text>
                  </View>
                  
                  <View>
                    <Text style={styles.answerLabel}>正确答案：</Text>
                    <Text style={styles.correctAnswerText}>
                      {quizMode === 'chinese-to-english' ? word.english : word.chinese}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.answerActions}>
          <TouchableOpacity style={styles.backButton} onPress={backToQuiz}>
            <Ionicons name="arrow-back-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>返回默写</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.restartButton} onPress={restartQuiz}>
            <Ionicons name="refresh-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>重新默写</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!quizStarted ? (
        renderQuizSettings()
      ) : showAllAnswers ? (
        renderAllAnswers()
      ) : (
        renderQuizInterface()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 24,
  },
  settingsContainer: {
    flex: 1,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  radioGroup: {
    gap: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  radioSelected: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  radioText: {
    fontSize: 16,
    color: '#1E293B',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  promptContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  promptText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  answerInput: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  currentAnswerContainer: {
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  navButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  navButtonText: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  quizActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  answersContainer: {
    flex: 1,
  },
  answersList: {
    flex: 1,
    gap: 16,
  },
  answerItem: {
    flexDirection: 'row',
    gap: 12,
  },
  answerNumber: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
  answerContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentAnswerHighlight: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  answersCompare: {
    gap: 12,
  },
  userAnswerText: {
    fontSize: 16,
    color: '#1E293B',
  },
  emptyAnswer: {
    color: '#999',
    fontStyle: 'italic',
  },
  answerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});

export default QuizScreen;