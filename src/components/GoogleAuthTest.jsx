import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';

const GoogleAuthTest = () => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Collect debug information
    setDebugInfo({
      currentUrl: window.location.href,
      projectId: auth.app.options.projectId,
      authDomain: auth.app.options.authDomain,
      apiKey: auth.app.options.apiKey?.substring(0, 10) + '...',
      userAgent: navigator.userAgent,
      isLocalhost: window.location.hostname === 'localhost',
      protocol: window.location.protocol,
      port: window.location.port
    });
  }, []);

  const testPopupAuth = async () => {
    setStatus('Testing popup authentication...');
    setError('');

    try {
      console.log('🔍 Starting popup auth test...');
      console.log('🔍 Auth object:', auth);
      console.log('🔍 Google provider:', googleProvider);
      console.log('🔍 Current user:', auth.currentUser);

      // Try with additional settings to bypass OAuth client issues
      const tempProvider = new GoogleAuthProvider();
      tempProvider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online'
      });

      const result = await signInWithPopup(auth, tempProvider);
      setStatus(`✅ Popup Success! User: ${result.user.email}`);
      console.log('✅ Popup auth successful:', result);
    } catch (error) {
      setError(`❌ Popup Failed: ${error.code} - ${error.message}. Try redirect auth instead.`);
      console.error('❌ Popup error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        customData: error.customData
      });

      // Suggest using redirect as fallback
      setStatus('💡 Popup failed. OAuth client needs localhost authorization. Try redirect auth.');
    }
  };

  const testRedirectAuth = async () => {
    setStatus('Testing redirect authentication...');
    setError('');
    
    try {
      await signInWithRedirect(auth, googleProvider);
      setStatus('🔄 Redirecting...');
    } catch (error) {
      setError(`❌ Redirect Failed: ${error.message}`);
      console.error('Redirect error:', error);
    }
  };

  const checkRedirectResult = async () => {
    setStatus('Checking redirect result...');
    setError('');
    
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        setStatus(`✅ Redirect Success! User: ${result.user.email}`);
      } else {
        setStatus('No redirect result found');
      }
    } catch (error) {
      setError(`❌ Redirect Result Failed: ${error.message}`);
      console.error('Redirect result error:', error);
    }
  };

  const testBasicConfig = async () => {
    setStatus('Testing basic Firebase configuration...');
    setError('');

    try {
      console.log('🔍 Testing basic config...');
      console.log('🔍 Auth state:', auth.currentUser);
      console.log('🔍 App config:', auth.app.options);

      // Test if we can at least initialize the provider
      const testProvider = new GoogleAuthProvider();
      testProvider.setCustomParameters({
        prompt: 'select_account'
      });

      setStatus('✅ Basic configuration test passed');
      console.log('✅ Provider created successfully:', testProvider);
    } catch (error) {
      setError(`❌ Basic config failed: ${error.code} - ${error.message}`);
      console.error('❌ Basic config error:', error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setStatus('✅ Signed out successfully');
    } catch (error) {
      setError(`❌ Sign out failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Google Auth Test</h2>
      
      <div className="space-y-3">
        <button
          onClick={testPopupAuth}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Popup Auth
        </button>

        <button
          onClick={testBasicConfig}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Test Basic Config
        </button>
        
        <button
          onClick={testRedirectAuth}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Test Redirect Auth
        </button>
        
        <button
          onClick={checkRedirectResult}
          className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Check Redirect Result
        </button>
        
        <button
          onClick={signOut}
          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      
      {status && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-blue-800">{status}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <div className="space-y-1">
          <p><strong>Current URL:</strong> {debugInfo.currentUrl}</p>
          <p><strong>Project ID:</strong> {debugInfo.projectId}</p>
          <p><strong>Auth Domain:</strong> {debugInfo.authDomain}</p>
          <p><strong>API Key:</strong> {debugInfo.apiKey}</p>
          <p><strong>Is Localhost:</strong> {debugInfo.isLocalhost ? 'Yes' : 'No'}</p>
          <p><strong>Protocol:</strong> {debugInfo.protocol}</p>
          <p><strong>Port:</strong> {debugInfo.port}</p>
          <p><strong>Browser:</strong> {debugInfo.userAgent?.includes('Chrome') ? 'Chrome' :
                                        debugInfo.userAgent?.includes('Firefox') ? 'Firefox' :
                                        debugInfo.userAgent?.includes('Safari') ? 'Safari' : 'Other'}</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthTest;
