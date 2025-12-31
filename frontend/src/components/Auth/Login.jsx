import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Card from '../Common/Card';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(formData.username, formData.password);
      const { token, user } = response.data;

      // Sauvegarder le token et les infos utilisateur
      login(token, user);

      // Rediriger selon le rôle
      if (user.role === 'secretaire') {
        navigate('/secretaire/dashboard');
      } else if (user.role === 'chauffeur') {
        navigate('/chauffeur/dashboard');
      } else {
        setError('Rôle utilisateur non reconnu');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">🚕</div>
            <h1 className="text-3xl font-bold text-primary mb-2">Transport DanGE</h1>
            <p className="text-gray-600">Connexion à l'application</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Nom d'utilisateur"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Entrez votre nom d'utilisateur"
            />
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
            />
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            planning.transportdange.fr
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
