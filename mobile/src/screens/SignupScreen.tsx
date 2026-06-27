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
import { colors, fontFamily, fontSize, spacing } from '../theme';
import { fieldErrorsFromApiError, validateSignup } from '../utils/validation';

type FieldErrors = Partial<Record<'username' | 'email' | 'password', string>>;

export function SignupScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Signup'>) {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (formError) setFormError(null);
  };

  const onSubmit = async () => {
    const input = {
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
    };
    const errors = validateSignup(input);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      await signup(input);
      // Success → RootNavigator swaps to the App stack automatically.
      // TODO(P10): register FCM token here.
    } catch (e) {
      if (e instanceof ApiError) {
        const mapped = fieldErrorsFromApiError(e);
        if (Object.keys(mapped).length > 0) setFieldErrors(mapped);
        else setFormError(e.message);
      } else {
        setFormError('Sign up failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || !username.trim() || !email.trim() || !password;

  return (
    <AuthScreen title="Create account" subtitle="Join the ripple">
      <ErrorBanner message={formError} />

      <FormField
        label="Username"
        placeholder="jane_doe"
        value={username}
        onChangeText={(t) => {
          setUsername(t);
          clearError('username');
        }}
        error={fieldErrors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        textContentType="username"
        editable={!submitting}
        returnKeyType="next"
      />

      <FormField
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clearError('email');
        }}
        error={fieldErrors.email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!submitting}
        returnKeyType="next"
      />

      <FormField
        label="Password"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clearError('password');
        }}
        error={fieldErrors.password}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password-new"
        textContentType="newPassword"
        editable={!submitting}
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />

      <PrimaryButton
        label="Sign up"
        onPress={onSubmit}
        loading={submitting}
        disabled={disabled}
        style={styles.submit}
      />

      <Pressable
        style={styles.link}
        onPress={() => navigation.goBack()}
        disabled={submitting}
      >
        <Text style={styles.linkText}>Have an account? Log in</Text>
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
    marginTop: spacing.xs,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
  },
});
