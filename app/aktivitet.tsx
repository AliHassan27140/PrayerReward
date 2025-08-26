
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';

const Aktivitet: React.FC = () => {
  const [points, setPoints] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [step, setStep] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);



  const questions = [
    {
      text: "1. Hur många gånger ber du per dag?",
      options: [
        { label: "3 eller fler gånger", score: 10 },
        { label: "1–2 gånger", score: 7 },
        { label: "Några gånger i veckan", score: 4 },
        { label: "Sällan eller aldrig", score: 1 },
      ],
    },
    {
      text: "2. Hur ofta läser du Bibeln?",
      options: [
        { label: "Varje dag", score: 10 },
        { label: "Några gånger i veckan", score: 7 },
        { label: "Någon gång i månaden", score: 4 },
        { label: "Sällan eller aldrig", score: 1 },
      ],
    },
    {
      text: "3. Vad tycker du om din relation med Gud idag?",
      options: [
        { label: "Stark och levande", score: 10 },
        { label: "Okej men kan bli bättre", score: 7 },
        { label: "Svag eller osäker", score: 4 },
        { label: "Jag känner mig långt borta från Gud", score: 1 },
      ],
    },
    {
      text: "4. Hur ofta deltar du i kyrkans gemenskap eller evenemang?",
      options: [
        { label: "Varje vecka", score: 10 },
        { label: "Några gånger i månaden", score: 7 },
        { label: "Sällan", score: 4 },
        { label: "Aldrig", score: 1 },
      ],
    },
    {
      text: "5. Hur ofta känner du att din tro växer?",
      options: [
        { label: "Alltid", score: 10 },
        { label: "Ofta", score: 7 },
        { label: "Ibland", score: 4 },
        { label: "Sällan", score: 1 },
      ],
    },
    {
      text: "6. Hur ofta känner du att Gud är närvarande i ditt liv?",
      options: [
        { label: "Alltid", score: 10 },
        { label: "Ofta", score: 7 },
        { label: "Ibland", score: 4 },
        { label: "Sällan", score: 1 },
      ],
    },
    {
      text: "7. Hur ofta delar du din tro med andra?",
      options: [
        { label: "Regelbundet", score: 10 },
        { label: "Ibland", score: 7 },
        { label: "Sällan", score: 4 },
        { label: "Aldrig", score: 1 },
      ],
    },
  ];

  const calculateScore = (): void => {
    if (points.includes(0)) {
      Alert.alert("Varning", "Vänligen svara på alla frågor!");
      return;
    }

    const sum = points.reduce((acc, current) => acc + current, 0);
    const percentage = (sum / 70) * 100; // 70 is the max score now
    setTotalScore(sum);
    setPercentage(Math.round(percentage)); // Round the percentage to an integer
    setShowResults(true);
  };

  const handleAnswer = (answerScore: number, option: string): void => {
    const newPoints = [...points];
    newPoints[step] = answerScore;
    setPoints(newPoints);
    setSelectedOption(option);
  };

  const goToNextStep = (): void => {
    if (selectedOption) {
      setStep(step + 1);
      setSelectedOption(''); // Reset selected option for next question
    } else {
      Alert.alert("Varning", "Vänligen välj ett alternativ först!");
    }
  };

  const restartQuiz = (): void => {
    setPoints([0, 0, 0, 0, 0, 0, 0]);
    setStep(0);
    setTotalScore(0);
    setPercentage(0);
    setSelectedOption('');
    setShowResults(false);
  };

  const startQuiz = (): void => {
    setQuizStarted(true); // Start the quiz when the button is clicked
  };

  return (
    <View style={styles.container}>
   
      <Text style={styles.title}>Aktivitet</Text>

      {!quizStarted ? (
        <>
          <Text style={styles.subtitle}>Svara på frågorna och få din andliga procentnivå</Text>
          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Starta</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {!showResults ? (
            <>
              <Text style={styles.question}>{questions[step].text}</Text>

              <View style={styles.optionsContainer}>
                {questions[step].options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedOption === option.label && styles.selectedOption,
                    ]}
                    onPress={() => handleAnswer(option.score, option.label)}
                  >
                    <View style={styles.checkboxContainer}>
                      <Text style={styles.optionText}>{option.label}</Text>
                      {selectedOption === option.label && (
                        <Text style={styles.selectedText}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {step < 6 ? (
                <TouchableOpacity
                  style={[styles.nextButton, { opacity: selectedOption ? 1 : 0.3 }]}
                  onPress={goToNextStep}
                  disabled={!selectedOption}
                >
                  <Text style={styles.buttonText}>Nästa</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.calculateButton, { opacity: points.includes(0) ? 0.3 : 1 }]}
                  onPress={calculateScore}
                  disabled={points.includes(0)}
                >
                  <Text style={styles.buttonText}>Se ditt resultat här!</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.result}>
              <View style={styles.resultSummary}>
                <Text style={styles.resultHeader}>Ditt resultat:</Text>
                <Text style={styles.resultText}>Maxpoäng = 70</Text>
                <Text style={styles.resultText}>Din poäng = {totalScore}</Text>
                <Text style={styles.resultText}>Procent = {percentage}%</Text>
              </View>

              <View style={styles.reflectionContainer}>
                <Text style={styles.reflectionTitle}>Procentnivå Reflektion</Text>
                <Text style={[styles.resultText, styles.highScore]}>
                  <Text style={styles.scoreRange}>80–100%</Text> Du har en stark andlig rytm – fortsätt så!
                </Text>
                <Text style={[styles.resultText, styles.midHighScore]}>
                  <Text style={styles.scoreRange}>60–79%</Text> Du har en bra grund, men det finns utrymme för fördjupning.
                </Text>
                <Text style={[styles.resultText, styles.midLowScore]}>
                  <Text style={styles.scoreRange}>40–59%</Text> Du kanske är i en mellanzon – se vad du längtar efter.
                </Text>
                <Text style={[styles.resultText, styles.lowScore]}>
                  <Text style={styles.scoreRange}>Under 40%</Text> Dags att närma dig Gud igen – han väntar på dig med öppen famn.
                </Text>
              </View>

              <TouchableOpacity style={styles.restartButton} onPress={restartQuiz}>
                <Text style={styles.restartButtonText}>Börja om</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',  // Centers content vertically in the remaining space
    alignItems: 'center',  // Centers content horizontally
    backgroundColor: '#5B2C6F', // Background color
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#F5E6D9',
    textAlign: 'center',
    marginTop: 50,  // Adds space from the top of the screen
    position: 'absolute',  // Makes sure the title is fixed at the top
    top: 32, // Places the title at the very top of the screen
    left: 0,
    right: 0,
  },
  subtitle: {
    fontSize: 18,
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    marginVertical: 10,
    color: '#F5E6D9', // Updated to match the color of the question text
  },
  optionsContainer: {
    marginBottom: 20,
    width: '100%',
  },
  optionButton: {
    padding: 10,
    backgroundColor: '#522f60ff', // Updated to match the answer background
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  selectedOption: {
    backgroundColor: '#9B59B6', // Updated selected option color
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#BDC3C7', // Updated to match the answer text color
  },
  selectedText: {
    fontSize: 16,
    color: '#4CAF50', // Same as before
  },
  result: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#2a2a2aff', // Darker background to make the result stand out
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  resultSummary: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#9B59B6', // Updated to match the question background color
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9B59B6',
    width: '100%',
    alignItems: 'center',
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5E6D9', // Updated to match the result header text
    marginBottom: 15,
  },
  resultText: {
    fontSize: 16,
    color: '#F5E6D9', // Updated to match the text color in result
    marginVertical: 5,
    textAlign: 'center',
  },
  reflectionContainer: {
    marginTop: 20,
    width: '100%',
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5E6D9', // Updated to match the text color of reflection
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreRange: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  highScore: {
    color: '#4CAF50',
  },
  midHighScore: {
    color: '#FFEB3B',
  },
  midLowScore: {
    color: '#FF9800',
  },
  lowScore: {
    color: '#F44336',
  },
  restartButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#9B59B6', // Restart button updated to match other purple elements
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#F5E6D9', // Restart button text updated to light color
    fontSize: 18,
  },
  startButton: {
    backgroundColor: '#9B59B6', // Start button updated to match the other buttons
    padding: 12,
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#F5E6D9', // Start button text color updated
    fontSize: 18,
  },
  nextButton: {
    backgroundColor: '#9B59B6', // Next button color updated
    padding: 12,
    borderRadius: 5,
    marginVertical: 10,
    width: '50%',
    alignItems: 'center',
  },
  calculateButton: {
    backgroundColor: '#9B59B6', // Updated to match purple button theme
    padding: 12,
    borderRadius: 5,
    marginVertical: 10,
    width: '50%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5E6D9', // Text color of the buttons updated to light color
    fontSize: 16,
  },
});


export default Aktivitet;
