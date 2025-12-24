// components/SignupForm.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Input from './ui/Input';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { COUNTRIES, DEFAULT_COUNTRY } from '../constants'; // Import countries and default

const SignupForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY); // New state for country
  const [formError, setFormError] = useState<string | null>(null);
  const { signup, loading, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (!country) {
      setFormError('Please select your country.');
      return;
    }

    await signup(name, email, password, country);
  };

  return (
    <AuthLayout title="Create Your Account">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <Input
            id="full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
          />
          <Input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <div className="relative w-full mb-4">
            <label htmlFor="country" className="block text-sm font-medium text-darkText dark:text-lightText mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full p-3 bg-white bg-opacity-5 dark:bg-gray-800 dark:bg-opacity-20 backdrop-filter backdrop-blur-sm
                         border border-gray-700 dark:border-gray-500 rounded-xl
                         text-darkText dark:text-lightText focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent
                         transition-all duration-300"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {formError?.includes('country') && <p className="mt-1 text-sm text-red-500">{formError}</p>}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {(formError || authError) && <p className="text-red-500 text-sm text-center">{formError || authError}</p>}

        <div>
          <Button
            type="submit"
            className="w-full justify-center mt-6"
            loading={loading}
          >
            Sign Up
          </Button>
        </div>

        <div className="text-sm text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <NavLink to="/login" className="font-medium text-accent hover:underline">
              Sign In
            </NavLink>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupForm;