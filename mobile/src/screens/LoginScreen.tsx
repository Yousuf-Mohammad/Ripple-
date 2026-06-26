import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/useAuth';
import { ApiError } from '../api/types';
import { AuthScreen } from '../components/AuthScreen';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import type { AuthStackParamList } from '../navigation/types';
import { colors, fontSize, spacing } from '../theme';
import { fieldErrorsFromApiError, validateLogin } from '../utils/validation';

type FieldErrors = Partial<Record<'emailOrUsername' | 'password', string>>;

export function LoginScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (formError) setFormError(null);
  };

  const onSubmit = async () => {
    const input = { emailOrUsername: emailOrUsername.trim(), password };
    const errors = validateLogin(input);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      await login(input);
      // Success → RootNavigator swaps to the App stack automatically.
      // TODO(P10): register FCM token here.
    } catch (e) {
      if (e instanceof ApiError) {
        const mapped = fieldErrorsFromApiError(e);
        if (Object.keys(mapped).length > 0) setFieldErrors(mapped);
        else setFormError(e.message);
      } else {
        setFormError('Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || !emailOrUsername.trim() || !password;

  return (
    <AuthScreen title="Ripple" subtitle="Sign in to your account">
      <ErrorBanner message={formError} />

      <FormField
        label="Email or username"
        placeholder="you@example.com"
        value={emailOrUsername}
        onChangeText={(t) => {
          setEmailOrUsername(t);
          clearError('emailOrUsername');
        }}
        error={fieldErrors.emailOrUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        editable={!submitting}
        returnKeyType="next"
      />

      <FormField
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clearError('password');
        }}
        error={fieldErrors.password}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        editable={!submitting}
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />

      <PrimaryButton
        label="Log in"
        onPress={onSubmit}
        loading={submitting}
        disabled={disabled}
        style={styles.submit}
      />

      <Pressable
        style={styles.link}
        onPress={() => navigation.navigate('Signup')}
        disabled={submitting}
      >
        <Text style={styles.linkText}>No account? Sign up</Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: spacing.xs,
  },
  link: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
});
