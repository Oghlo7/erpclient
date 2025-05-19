import { useState } from 'react'; 
import { Eye, EyeOff, CheckCircle } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPage() { 
  const navigate = useNavigate();
  const { login, error: loginStoreError, isLoading, clearError } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false); 
  const [rememberMe, setRememberMe] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Veuillez entrer une adresse email valide');
    } else {
      setEmailError('');
    }
    
    // Clear any store errors when user starts typing
    if (loginStoreError) clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear any store errors when user starts typing
    if (loginStoreError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      setEmailError('Veuillez entrer une adresse email valide');
      return;
    }
    
    setLoginError(''); // Clear any previous errors
    
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } else {
      setLoginError(result.error);
    }
  };

  return ( 
    <div className="flex h-screen bg-white"> 
      {/* Left panel with logo and features */} 
      <div className="w-1/2 bg-gray-50 p-12 flex flex-col"> 
        <div className="mb-16"> 
          <div className="w-16 h-16 rounded-full bg-teal-400 flex items-center justify-center"> 
            <div className="text-white text-2xl">★</div> 
          </div> 
        </div> 
        
        <h2 className="text-gray-600 text-xl mb-8">Gérez votre entreprise avec :</h2> 
        
        <div className="space-y-8"> 
          <div className="flex items-start"> 
            <CheckCircle className="text-gray-500 mr-3 mt-1" size={20} /> 
            <div> 
              <p className="font-medium text-gray-700">Outil tout-en-un</p> 
              <p className="text-gray-500">Exécutez et mettez à l'échelle votre application ERP</p> 
            </div> 
          </div> 
          
          <div className="flex items-start"> 
            <CheckCircle className="text-gray-500 mr-3 mt-1" size={20} /> 
            <div> 
              <p className="font-medium text-gray-700">Ajoutez et gérez facilement vos services</p> 
              <p className="text-gray-500">Il rassemble vos clients de facturation et vos leads</p> 
            </div> 
          </div> 
        </div> 
      </div> 
      
      {/* Right panel with login form */} 
      <div className="w-1/2 flex items-center justify-center"> 
        <div className="w-96"> 
          <h1 className="text-2xl font-semibold mb-8 text-center">Se connecter</h1> 
          
          <form className="space-y-6" onSubmit={handleSubmit}> 
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email"> 
                * Email 
              </label> 
              <div className="relative"> 
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md px-10 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                /> 
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> 
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> 
                  </svg> 
                </div> 
              </div>
              {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
            </div> 
            
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password"> 
                * Mot de passe 
              </label> 
              <div className="relative"> 
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-md px-10 py-2 focus:ring-blue-500 focus:border-blue-500" 
                  required
                /> 
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> 
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> 
                  </svg> 
                </div> 
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowPassword(!showPassword)} 
                > 
                  {showPassword ? ( 
                    <EyeOff className="h-5 w-5 text-gray-400" /> 
                  ) : ( 
                    <Eye className="h-5 w-5 text-gray-400" /> 
                  )} 
                </button> 
              </div> 
            </div> 
            
            <div className="flex items-center justify-between"> 
              <div className="flex items-center"> 
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  checked={rememberMe} 
                  onChange={() => setRememberMe(!rememberMe)} 
                /> 
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700"> 
                  Se souvenir de moi 
                </label> 
              </div> 
              <div className="text-sm"> 
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500"> 
                  Mot de passe oublié 
                </a> 
              </div> 
            </div> 
            
            <div className="flex items-center justify-between"> 
              <div className="text-sm"> 
                <span className="text-gray-600">Ou </span> 
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500"> 
                  S'inscrire Maintenant 
                </Link> 
              </div> 
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              > 
                Se connecter 
              </button> 
              {loginError && (
                <div className="mt-3 text-sm text-red-500">
                  {loginError}
                </div>
              )}
            </div> 
          </form> 
        </div> 
      </div> 
    </div> 
  ); 
}