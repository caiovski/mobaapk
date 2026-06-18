import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useLoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    handleLogin
  };
}
