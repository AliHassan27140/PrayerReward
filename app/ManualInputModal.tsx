import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard, ActivityIndicator, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';  // Updated import
import i18n from '../locales/i18n';
import AntDesign from '@expo/vector-icons/AntDesign'; // Import from Expo Vector Icons

interface ManualInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  manualDate: string;
  setManualDate: (date: string) => void;
  manualHours: string;
  setManualHours: (hours: string) => void;
  manualMinutes: string;
  setManualMinutes: (minutes: string) => void;
  manualSeconds: string;
  setManualSeconds: (seconds: string) => void;
  isSaving: boolean;
}

const ManualInputModal: React.FC<ManualInputModalProps> = ({
  visible,
  onClose,
  onSave,
  manualDate,
  setManualDate,
  manualHours,
  setManualHours,
  manualMinutes,
  setManualMinutes,
  manualSeconds,
  setManualSeconds,
  isSaving
}) => {
  const [manualHoursInput, setManualHoursInput] = useState<string>(manualHours);
  const [manualMinutesInput, setManualMinutesInput] = useState<string>(manualMinutes);
  const [manualSecondsInput, setManualSecondsInput] = useState<string>(manualSeconds);
  const [showTimeInput, setShowTimeInput] = useState<boolean>(false);
  const [showDuration, setShowDuration] = useState<boolean>(false);
  
  // Default time is "__ : __"
  const [selectedTime, setSelectedTime] = useState<string>("__ : __");
  const [selectedDuration, setSelectedDuration] = useState<string>("0 : 0 : 0");

  // Check if any time has been entered
  const hasTimeEntered = () => {
    return (manualHoursInput && manualHoursInput !== '') || 
           (manualMinutesInput && manualMinutesInput !== '') || 
           (manualSecondsInput && manualSecondsInput !== '') ||
           (manualHours && manualHours !== '') ||
           (manualMinutes && manualMinutes !== '') ||
           (manualSeconds && manualSeconds !== '');
  };

  // Function to get today's date in the format YYYY-MM-DD
  const getTodayDate = (): string => {
    const today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
  };

  useEffect(() => {
    if (visible) {
      setManualDate(getTodayDate());
    }
  }, [visible, setManualDate]);

  // Handle hours, minutes, and seconds input change
  const handleHoursChange = (hours: string) => {
    if (hours.length <= 2 && /^[0-9]*$/.test(hours)) {
      setManualHoursInput(hours);
      setManualHours(hours);
    }
  };

  const handleMinutesChange = (minutes: string) => {
    if (minutes.length <= 2 && /^[0-9]*$/.test(minutes)) {
      setManualMinutesInput(minutes);
      setManualMinutes(minutes);
    }
  };

  const handleSecondsChange = (seconds: string) => {
    if (seconds.length <= 2 && /^[0-9]*$/.test(seconds)) {
      setManualSecondsInput(seconds);
      setManualSeconds(seconds);
    }
  };

  // Function to dismiss the keyboard when "Klar" is pressed
  const handleDone = () => {
    const displayHours = manualHoursInput || "__";
    const displayMinutes = manualMinutesInput || "__";
    
    setSelectedTime(`${displayHours} : ${displayMinutes}`); // Update selected time only
    // Don't update selectedDuration here - it should only update from duration pickers
    Keyboard.dismiss(); // Dismiss the keyboard
    setShowTimeInput(false); // Hide the time input fields
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              style={styles.calendarContainer}
              markedDates={{
                [manualDate]: { selected: true, selectedColor: '#9B59B6', selectedTextColor: '#fff' },
              }}
              onDayPress={(day) => setManualDate(day.dateString)}
              firstDay={1}
              theme={{
                selectedDayBackgroundColor: '#9B59B6',
                selectedDayTextColor: '#FFF',
                dayTextColor: '#FF69B4',
                arrowColor: '#9B59B6',
                monthTextColor: '#9B59B6',
                textSectionTitleColor: '#9B59B6',
                backgroundColor: '#F4F4F4',
                todayTextColor: '#000',
                todayBackgroundColor: 'transparent',
                textDayFontFamily: 'Roboto',
                textMonthFontFamily: 'Roboto',
                textDayHeaderFontFamily: 'Roboto',
                textDayFontSize: 16,
                textMonthFontSize: 20,
                textDayHeaderFontSize: 14,
              }}
            />

            {/* Button to toggle visibility of the time input fields */}
            <TouchableOpacity onPress={() => {
              setShowTimeInput(!showTimeInput); // Toggle visibility of time input
              if (showDuration) setShowDuration(false); // Close duration if it's open
            }} style={styles.showTimeInputButton}>
              <View style={styles.buttonContent}>
                {/* Displaying "ange tid" and the selected time */}
                <Text style={styles.showTimeInputButtonText}>
                  {i18n.t('home.enterTime')}
                </Text>
                {/* Display the selected time */}
                <Text style={styles.selectedTimeText}>
                  {selectedTime}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <AntDesign 
                  name={showTimeInput ? 'up' : 'down'} 
                  size={18} 
                  color="#fff" 
                  style={styles.icon} 
                />
              </View>
            </TouchableOpacity>

            {/* Manual Time Input (_ _ : _ _) */}
            {showTimeInput && (
              <View style={styles.timeInputContainer}>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={styles.timeTextInput}
                    value={manualHoursInput}
                    onChangeText={handleHoursChange}
                    placeholder="__"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeTextInput}
                    value={manualMinutesInput}
                    onChangeText={handleMinutesChange}
                    placeholder="__"
                    keyboardType="numeric"
                    maxLength={2}
                  />
            
                  <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
                    <Text style={styles.doneButtonText}>{i18n.t('minaboner.done')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Button to toggle visibility of duration inputs */}
            <TouchableOpacity onPress={() => {
              setShowDuration(!showDuration); // Toggle visibility of duration input
              if (showTimeInput) setShowTimeInput(false); // Close time input if it's open
            }} style={styles.showDurationButton}>
              <View style={styles.buttonContent}>
                <Text style={styles.showDurationButtonText}>
                  {i18n.t('home.duration')}
                </Text>
                {/* Display the selected duration */}
                <Text style={styles.selectedTimeText}>
                  {selectedDuration}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <AntDesign 
                  name={showDuration ? 'up' : 'down'} 
                  size={18} 
                  color="#fff" 
                  style={styles.icon} 
                />
              </View>
            </TouchableOpacity>

            {/* Duration Inputs for Hours, Minutes, and Seconds (conditionally rendered) */}
            {showDuration && (
              <View style={styles.timePickerContainer}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>{i18n.t('home.hours')}</Text>
                  <Picker
                    selectedValue={manualHours}
                    onValueChange={(itemValue) => {
                      setManualHours(itemValue.toString());
                      setSelectedDuration(`${itemValue} : ${manualMinutes || '0'} : ${manualSeconds || '0'}`);
                    }}
                    style={styles.timePicker}
                    itemStyle={{ color: '#fff' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>{i18n.t('home.minutes')}</Text>
                  <Picker
                    selectedValue={manualMinutes}
                    onValueChange={(itemValue) => {
                      setManualMinutes(itemValue.toString());
                      setSelectedDuration(`${manualHours || '0'} : ${itemValue} : ${manualSeconds || '0'}`);
                    }}
                    style={styles.timePicker}
                    itemStyle={{ color: '#fff' }}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>{i18n.t('home.seconds')}</Text>
                  <Picker
                    selectedValue={manualSeconds}
                    onValueChange={(itemValue) => {
                      setManualSeconds(itemValue.toString());
                      setSelectedDuration(`${manualHours || '0'} : ${manualMinutes || '0'} : ${itemValue}`);
                    }}
                    style={styles.timePicker}
                    itemStyle={{ color: '#fff' }}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Buttons Container */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, (!hasTimeEntered() || isSaving) && styles.disabledButton]}
                onPress={onSave}
                disabled={isSaving || !hasTimeEntered()}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, !hasTimeEntered() && styles.disabledButtonText]}>{i18n.t('home.save')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>{i18n.t('minaboner.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: 350,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: '#522f60ff',
    borderRadius: 14,
    marginTop: -50,
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#9B59B6',
    borderRadius: 12,
    backgroundColor: '#E8F0F3',
    padding: 5,
    marginVertical: 10,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  timeInputContainer: {
    marginBottom: 30,
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeTextInput: {
    width: 50,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
  },
  timeSeparator: {
    fontSize: 24,
    color: '#fff',
    marginHorizontal: 5,
  },
  doneButton: {
    backgroundColor: '#8E44AD',
    padding: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  timePicker: {
    height: 190,
    width: '100%',
    color: '#fff',
    backgroundColor: '#522f60ff',
    borderRadius: 6,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  modalButton: {
    backgroundColor: '#8E44AD',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  showTimeInputButton: {
    backgroundColor: '#8E44AD',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start', // Aligning the button content to the left
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Aligning text to the left
    alignItems: 'center',
    flex: 1,
  },
  showTimeInputButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedTimeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  iconContainer: {
    marginLeft: 10,
  },
  icon: {
    marginLeft: 10,
  },
  showDurationButton: {
    backgroundColor: '#8E44AD',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  showDurationButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  timeLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: '#8E44AD',
    padding: 5,
    borderRadius: 6,
  },
  timeInput: {
    width: '30%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#ccc',
  },
});

export default ManualInputModal;
