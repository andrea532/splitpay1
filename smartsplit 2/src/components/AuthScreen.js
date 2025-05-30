import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { authService } from '../services/authService';
import { isValidEmail, isValidPassword } from '../config/supabase';

// Icone semplici
const Icon = ({ name, size = 24, color = "#000" }) => {
  const icons = {
    'mail': '📧',
    'lock': '🔒',
    'user': '👤',
    'eye': '👁️',
    'eye-off': '🙈',
    'arrow-right': '→',
    'check': '✅'
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '●'}
    </Text>
  );
};

const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form validation
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email è richiesta';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (!password) {
      newErrors.password = 'Password è richiesta';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password deve essere di almeno 6 caratteri';
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        newErrors.fullName = 'Nome è richiesto';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Le password non corrispondono';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await authService.signIn(email, password);
      } else {
        result = await authService.signUp(email, password, fullName);
      }

      if (result.success) {
        Alert.alert(
          'Successo!',
          result.message || (isLogin ? 'Login effettuato con successo!' : 'Registrazione completata!'),
          [
            {
              text: 'OK',
              onPress: () => {
                if (onAuthSuccess) {
                  onAuthSuccess(result.user);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Errore', result.error);
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore imprevisto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Errore', 'Inserisci la tua email per reimpostare la password');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Errore', 'Inserisci un\'email valida');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        Alert.alert('Email Inviata', result.message);
      } else {
        Alert.alert('Errore', result.error);
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore imprevisto');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setErrors({});
    setShowPassword(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>💰 SmartSplit</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Bentornato!' : 'Crea il tuo account'}
            </Text>
            <Text style={styles.description}>
              {isLogin 
                ? 'Accedi per gestire le tue spese di gruppo' 
                : 'Registrati per iniziare a condividere le spese con i tuoi amici'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nome (solo registrazione) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon name="user" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    maxLength={50}
                  />
                </View>
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Icon name="mail" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={100}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  maxLength={50}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Conferma Password (solo registrazione) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon name="lock" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Conferma password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    maxLength={50}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}

            {/* Forgot Password (solo login) */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotText}>Password dimenticata?</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitText}>
                    {isLogin ? 'Accedi' : 'Registrati'}
                  </Text>
                  <Icon name="arrow-right" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Switch Mode */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
              </Text>
              <TouchableOpacity
                onPress={switchMode}
                disabled={isLoading}
              >
                <Text style={styles.switchButton}>
                  {isLogin ? 'Registrati' : 'Accedi'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Preview */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>✨ Cosa puoi fare con SmartSplit:</Text>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Crea gruppi e invita amici</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Ogni utente aggiunge le proprie spese</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Calcoli automatici e regolamenti</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Sincronizzazione in tempo reale</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    color: '#333',
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  switchText: {
    color: '#666',
    fontSize: 16,
  },
  switchButton: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  features: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
};

export default AuthScreen;