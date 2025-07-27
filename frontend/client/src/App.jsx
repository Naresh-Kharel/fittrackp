import React, { useState, useEffect, useCallback } from 'react';

// --- Simulate React Router DOM components ---
// In a real React app, these would be imported from 'react-router-dom'
const BrowserRouter = ({ children }) => {
    const [currentPath, setCurrentPath] = useState(window.location.hash.substring(1) || '/');

    const handleHashChange = useCallback(() => {
        setCurrentPath(window.location.hash.substring(1) || '/');
    }, []);

    useEffect(() => {
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [handleHashChange]);

    return (
        <RouterContext.Provider value={{ currentPath, setCurrentPath: (path) => { window.location.hash = path; } }}>
            {children}
        </RouterContext.Provider>
    );
};

const RouterContext = React.createContext(null);

const Routes = ({ children }) => {
    const { currentPath } = React.useContext(RouterContext);
    let match = null;

    // Find the first matching route
    React.Children.forEach(children, (child) => {
        if (child && child.props && child.props.path === currentPath && !match) {
            match = child;
        }
    });

    return match ? match.props.element : null;
};

const Route = ({ path, element }) => {
    // This component primarily serves as a configuration for Routes
    return null;
};

const Link = ({ to, children, className, onClick }) => { // Added onClick prop for flexibility
    const { setCurrentPath } = React.useContext(RouterContext);
    return (
        <button
            onClick={() => {
                setCurrentPath(to);
                if (onClick) onClick(); // Call additional onClick if provided
            }}
            className={className}
        >
            {children}
        </button>
    );
};

// --- End of simulated React Router DOM components ---


// Main App Component
const App = () => {
    // Initialize userData from localStorage on app load
    const [userData, setUserData] = useState(() => {
        const token = localStorage.getItem('fittrack_jwt_token');
        if (token) {
            // In a real app, you'd decode the JWT to get user info.
            // Here, we'll just set a dummy user to indicate logged in.
            return { email: 'logged_in_user@example.com', id: 'mock_user_id' };
        }
        return null;
    });
    const [fitnessData, setFitnessData] = useState(null); // To store fitness input data
    const [bmiResult, setBmiResult] = useState(null); // To store BMI result
    const [fitnessPlan, setFitnessPlan] = useState(null); // To store AI-generated fitness plan
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [modalMessage, setModalMessage] = useState(''); // State for modal message
    const [isPlanLoading, setIsPlanLoading] = useState(false); // New state for loading progress

    // Function to show a custom modal message
    const showCustomModal = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    // Modal Component
    const Modal = ({ message, onClose }) => {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"> {/* Darkened modal background */}
                <div className="bg-[#2D2D2D] p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-[#AFFF00]"> {/* Dark modal with green border */}
                    <p className="text-lg font-semibold mb-4 text-white">{message}</p>
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    // Navigation Bar Component
    const NavigationBar = ({ userData, setUserData, setFitnessData, setBmiResult, setFitnessPlan, showCustomModal, bmiResult, fitnessPlan }) => {
        const { setCurrentPath, currentPath } = React.useContext(RouterContext);
        const [isOpen, setIsOpen] = useState(false); // For hamburger menu

        const navLinks = [
            { name: 'Home', path: '/' },
            { name: 'Fitness Input', path: '/fitnessInput' },
            { name: 'Dashboard', path: '/dashboard' },
        ];

        // Conditionally add BMI Result link if data exists
        if (bmiResult || fitnessPlan) {
            navLinks.push({ name: 'BMI & Plan', path: '/bmiResult' });
        }

        const handleLogout = () => {
            localStorage.removeItem('fittrack_jwt_token'); // Remove JWT token from localStorage
            setUserData(null);
            setFitnessData(null);
            setBmiResult(null);
            setFitnessPlan(null);
            setCurrentPath('/');
            showCustomModal("You have been logged out.");
            setIsOpen(false); // Close menu on logout
        };

        return (
            <nav className="fixed top-0 left-0 right-0 bg-[#2D2D2D] p-4 shadow-lg z-40 border-b border-[#AFFF00]">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="text-3xl font-extrabold text-[#AFFF00]">FitTrack</Link>

                    {/* Hamburger Icon for Mobile */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-[#AFFF00] focus:outline-none">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-6 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-lg font-semibold transition duration-300 ease-in-out ${
                                    currentPath === link.path ? 'text-[#AFFF00]' : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {userData ? (
                            <button
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out hover:scale-105"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out hover:scale-105"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#2D2D2D] border-t border-[#AFFF00] py-4 flex flex-col items-center space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-lg font-semibold transition duration-300 ease-in-out ${
                                    currentPath === link.path ? 'text-[#AFFF00]' : 'text-gray-300 hover:text-white'
                                }`}
                                onClick={() => setIsOpen(false)} // Close menu on click
                            >
                                {link.name}
                            </Link>
                        ))}
                        {userData ? (
                            <button
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out hover:scale-105 w-3/4"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out hover:scale-105 w-3/4"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </nav>
        );
    };

    // Home Page Component
    const HomePage = () => (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white p-4">
            {/* No NavigationBar on Home Page */}
            <div className="bg-[#2D2D2D] bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-2xl text-center max-w-2xl w-full border border-[#AFFF00]">
                <h1 className="text-5xl font-extrabold mb-6 animate-fade-in-down text-[#CCFF00]">Welcome to FitTrack!</h1>
                <p className="text-xl mb-8 leading-relaxed animate-fade-in-up text-gray-300">
                    Your ultimate fitness companion to track stats, calculate BMI, and get personalized 30-day fitness plans.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/login"
                        className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );

    // Login/Register Page Component
    const AuthPage = ({ type, setUserData }) => { // setUserData passed as prop
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [isRegister, setIsRegister] = useState(type === 'register');
        const { setCurrentPath } = React.useContext(RouterContext);

        useEffect(() => {
            setIsRegister(type === 'register');
        }, [type]);

        const handleSubmit = (e) => {
            e.preventDefault();
            if (isRegister && password !== confirmPassword) {
                showCustomModal("Passwords do not match!");
                return;
            }
            // Mock authentication logic
            const user = { email, id: Date.now().toString() };
            const mockToken = `mock_jwt_token_${Date.now()}`; // Generate a mock JWT token
            localStorage.setItem('fittrack_jwt_token', mockToken); // Save token to localStorage
            setUserData(user); // Update user data state
            showCustomModal(`${isRegister ? 'Registration' : 'Login'} successful! Welcome, ${email}.`);
            setCurrentPath('/dashboard');
        };

        return (
            <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-4">
                {/* Specific Header for Auth Page */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                    <div className="text-3xl font-extrabold text-[#AFFF00]">FitTrack</div>
                    <Link
                        to="/"
                        className="bg-[#AFFF00] bg-opacity-20 text-[#AFFF00] w-12 h-12 rounded-full flex items-center justify-center text-2xl rotate-90 transform transition duration-300 ease-in-out hover:bg-opacity-30"
                    >
                        &#10140; {/* Unicode for a right arrow, rotated */}
                    </Link>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center justify-center w-full max-w-sm mt-20 text-center"> {/* Added text-center here */}
                    <h2 className="text-5xl font-extrabold text-[#CCFF00] mb-8">{isRegister ? 'Sign up' : 'Login'}</h2>

                    {/* Dumbbell Icon - Simulated with divs (only for register, or could be conditional) */}
                    {isRegister && (
                        <div className="flex items-center justify-center mb-10">
                            <div className="w-10 h-16 bg-gradient-to-r from-[#AFFF00] to-[#66CC00] rounded-lg"></div> {/* Left weight */}
                            <div className="w-24 h-4 bg-gray-800 rounded-md mx-1"></div> {/* Bar */}
                            <div className="w-10 h-16 bg-gradient-to-r from-[#AFFF00] to-[#66CC00] rounded-lg"></div> {/* Right weight */}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        {/* User Email Input */}
                        <div className="relative w-full">
                            <div className="bg-[#2D2D2D] rounded-full p-4 flex items-center justify-between shadow-lg">
                                <span className="text-gray-400 mr-2">1.</span>
                                <input
                                    type="email"
                                    id="email"
                                    className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                                    placeholder="User Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <span className="text-[#AFFF00] text-xl transform translate-y-0.5">→</span>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative w-full">
                            <div className="bg-[#2D2D2D] rounded-full p-4 flex items-center justify-between shadow-lg">
                                <span className="text-gray-400 mr-2">2.</span>
                                <input
                                    type="password"
                                    id="password"
                                    className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span className="text-[#AFFF00] text-xl transform translate-y-0.5">→</span>
                            </div>
                        </div>

                        {/* Confirm Password (only for register) */}
                        {isRegister && (
                            <div className="relative w-full">
                                <div className="bg-[#2D2D2D] rounded-full p-4 flex items-center justify-between shadow-lg">
                                    <span className="text-gray-400 mr-2">3.</span>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <span className="text-[#AFFF00] text-xl transform translate-y-0.5">→</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-extrabold py-4 rounded-full shadow-lg mt-8 transition duration-300 ease-in-out transform hover:scale-105 text-lg"
                        >
                            {isRegister ? 'SIGN UP' : 'LOGIN'}
                        </button>
                    </form>

                    {/* Switch to Login / Register */}
                    <p className="mt-8 text-center text-gray-400">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <Link
                            to={isRegister ? '/login' : '/register'}
                            className="text-[#AFFF00] hover:text-[#CCFF00] font-semibold"
                        >
                            {isRegister ? 'Login here' : 'Register here'}
                        </Link>
                    </p>
                </div>
            </div>
        );
    };

    // Fitness Input Form Component
    const FitnessInputForm = ({ setIsPlanLoading, userData, setUserData, setFitnessData, setBmiResult, setFitnessPlan, showCustomModal, bmiResult, fitnessPlan }) => {
        const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'
        const [heightCm, setHeightCm] = useState('');
        const [heightFeet, setHeightFeet] = useState('');
        const [heightInches, setHeightInches] = useState('');
        const [weightKg, setWeightKg] = useState('');
        const [weightLbs, setWeightLbs] = useState('');
        const [workoutHabits, setWorkoutHabits] = useState('');
        const [gender, setGender] = useState('');
        const [age, setAge] = useState('');
        const { setCurrentPath } = React.useContext(RouterContext);


        const handleSubmit = async (e) => {
            e.preventDefault();

            let finalHeightCm;
            let finalWeightKg;
            let originalHeightDisplay; // To store for display in fitnessData
            let originalWeightDisplay; // To store for display in fitnessData

            if (unitSystem === 'metric') {
                if (!heightCm || !weightKg || !workoutHabits || !gender || !age) {
                    showCustomModal("Please fill in all fitness details.");
                    return;
                }
                finalHeightCm = parseFloat(heightCm);
                finalWeightKg = parseFloat(weightKg);
                originalHeightDisplay = `${heightCm} cm`;
                originalWeightDisplay = `${weightKg} kg`;
            } else { // imperial
                if (!heightFeet || !heightInches || !weightLbs || !workoutHabits || !gender || !age) {
                    showCustomModal("Please fill in all fitness details.");
                    return;
                }
                // Convert feet and inches to cm
                const totalInches = (parseFloat(heightFeet) * 12) + parseFloat(heightInches);
                finalHeightCm = totalInches * 2.54; // 1 inch = 2.54 cm
                // Convert pounds to kg
                finalWeightKg = parseFloat(weightLbs) * 0.453592; // 1 lb = 0.453592 kg
                originalHeightDisplay = `${heightFeet}' ${heightInches}"`;
                originalWeightDisplay = `${weightLbs} lbs`;
            }

            const parsedAge = parseInt(age);

            if (isNaN(finalHeightCm) || isNaN(finalWeightKg) || isNaN(parsedAge) || finalHeightCm <= 0 || finalWeightKg <= 0 || parsedAge <= 0) {
                showCustomModal("Please enter valid positive numbers for height, weight, and age.");
                return;
            }

            // Set loading state and navigate to dashboard immediately
            setIsPlanLoading(true);
            setCurrentPath('/dashboard'); // Navigate to dashboard

            // Calculate BMI: weight (kg) / (height (m))^2
            const heightInMeters = finalHeightCm / 100;
            const bmi = (finalWeightKg / (heightInMeters * heightInMeters)).toFixed(2);

            setBmiResult(bmi);
            setFitnessData({
                height: originalHeightDisplay, // Store original display value
                weight: originalWeightDisplay, // Store original display value
                workoutHabits,
                gender,
                age: parsedAge,
                heightCm: finalHeightCm, // Store converted metric for AI prompt
                weightKg: finalWeightKg // Store converted metric for AI prompt
            });

            // Call the LLM to generate the fitness plan
            try {
                let chatHistory = [];
                const prompt = `Generate a customized 30-day fitness plan for a ${parsedAge}-year-old ${gender} who weighs ${finalWeightKg.toFixed(2)} kg and is ${finalHeightCm.toFixed(2)} cm tall. Their current workout habits are: ${workoutHabits}. The BMI is ${bmi}. Provide a plan that includes daily activities, exercise types, and general dietary advice. Make it comprehensive and encouraging.`;
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                const payload = { contents: chatHistory };
                const apiKey = "" // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const generatedPlan = result.candidates[0].content.parts[0].text;
                    setFitnessPlan(generatedPlan);
                    showCustomModal("Fitness plan generated successfully!");
                } else {
                    setFitnessPlan("Could not generate a fitness plan at this time. Please try again.");
                    showCustomModal("Failed to generate fitness plan.");
                }
            } catch (error) {
                console.error("Error generating fitness plan:", error);
                setFitnessPlan("An error occurred while generating the fitness plan.");
                showCustomModal("An error occurred while generating the fitness plan.");
            } finally {
                setIsPlanLoading(false); // Always set loading to false when done
            }
        };

        return (
            <div className="flex flex-col items-center min-h-screen bg-[#1A1A1A] text-white p-4">
                 <NavigationBar
                    userData={userData}
                    setUserData={setUserData}
                    setFitnessData={setFitnessData}
                    setBmiResult={setBmiResult}
                    setFitnessPlan={setFitnessPlan}
                    showCustomModal={showCustomModal}
                    bmiResult={bmiResult}
                    fitnessPlan={fitnessPlan}
                />
                <div className="bg-[#2D2D2D] p-8 rounded-xl shadow-2xl max-w-2xl w-full border border-[#AFFF00] mt-24 text-center"> {/* Added text-center here */}
                    <h2 className="text-3xl font-bold text-center text-[#CCFF00] mb-6">
                        Enter Your Fitness Details
                    </h2>

                    {/* Unit System Toggle */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => setUnitSystem('metric')}
                            className={`px-6 py-2 rounded-l-full font-semibold transition-colors duration-300 ${
                                unitSystem === 'metric' ? 'bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            Metric (cm, kg)
                        </button>
                        <button
                            onClick={() => setUnitSystem('imperial')}
                            className={`px-6 py-2 rounded-r-full font-semibold transition-colors duration-300 ${
                                unitSystem === 'imperial' ? 'bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            Imperial (ft, lbs)
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {unitSystem === 'metric' ? (
                            <>
                                <div>
                                    <label htmlFor="heightCm" className="block text-gray-300 text-sm font-semibold mb-2">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        id="heightCm"
                                        className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white placeholder-gray-500"
                                        placeholder="e.g., 175"
                                        value={heightCm}
                                        onChange={(e) => setHeightCm(e.target.value)}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="weightKg" className="block text-gray-300 text-sm font-semibold mb-2">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        id="weightKg"
                                        className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white placeholder-gray-500"
                                        placeholder="e.g., 70"
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                        required
                                        min="1"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="heightFeet" className="block text-gray-300 text-sm font-semibold mb-2">
                                            Height (feet)
                                        </label>
                                        <input
                                            type="number"
                                            id="heightFeet"
                                            className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white placeholder-gray-500"
                                            placeholder="e.g., 5"
                                            value={heightFeet}
                                            onChange={(e) => setHeightFeet(e.target.value)}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="heightInches" className="block text-gray-300 text-sm font-semibold mb-2">
                                            Height (inches)
                                        </label>
                                        <input
                                            type="number"
                                            id="heightInches"
                                            className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white placeholder-gray-500"
                                            placeholder="e.g., 10"
                                            value={heightInches}
                                            onChange={(e) => setHeightInches(e.target.value)}
                                            required
                                            min="0"
                                            max="11"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="weightLbs" className="block text-gray-300 text-sm font-semibold mb-2">
                                        Weight (lbs)
                                    </label>
                                    <input
                                        type="number"
                                        id="weightLbs"
                                        className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white placeholder-gray-500"
                                        placeholder="e.g., 150"
                                        value={weightLbs}
                                        onChange={(e) => setWeightLbs(e.target.value)}
                                        required
                                        min="1"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label htmlFor="age" className="block text-gray-300 text-sm font-semibold mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                id="age"
                                className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white placeholder-gray-500"
                                placeholder="e.g., 30"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-gray-300 text-sm font-semibold mb-2">
                                Gender
                            </label>
                            <select
                                id="gender"
                                className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                            >
                                <option value="" className="bg-[#1A1A1A] text-gray-400">Select your gender</option>
                                <option value="male" className="bg-[#1A1A1A] text-white">Male</option>
                                <option value="female" className="bg-[#1A1A1A] text-white">Female</option>
                                <option value="other" className="bg-[#1A1A1A] text-white">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="workoutHabits" className="block text-gray-300 text-sm font-semibold mb-2">
                                Describe your current workout habits
                            </label>
                            <textarea
                                id="workoutHabits"
                                rows="4"
                                className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFFF00] text-white placeholder-gray-500"
                                placeholder="e.g., I go to the gym 3 times a week, focusing on strength training. I also enjoy walking."
                                value={workoutHabits}
                                onChange={(e) => setWorkoutHabits(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-3 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Calculate BMI & Get Plan
                        </button>
                    </form>
                    <Link
                        to="/dashboard"
                        className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    };

    // BMI Result Display Component
    const BmiResultDisplay = ({ userData, setUserData, setFitnessData, setBmiResult, setFitnessPlan, showCustomModal, bmiResult, fitnessPlan }) => {
        const getBmiCategory = (bmi) => {
            if (bmi < 18.5) return 'Underweight';
            if (bmi >= 18.5 && bmi < 24.9) return 'Normal weight';
            if (bmi >= 25 && bmi < 29.9) return 'Overweight';
            return 'Obesity';
        };

        return (
            <div className="flex flex-col items-center min-h-screen bg-[#1A1A1A] text-white p-4">
                 <NavigationBar
                    userData={userData}
                    setUserData={setUserData}
                    setFitnessData={setFitnessData}
                    setBmiResult={setBmiResult}
                    setFitnessPlan={setFitnessPlan}
                    showCustomModal={showCustomModal}
                    bmiResult={bmiResult}
                    fitnessPlan={fitnessPlan}
                />
                <div className="bg-[#2D2D2D] p-8 rounded-xl shadow-2xl max-w-4xl w-full mt-24 mb-6 text-center"> {/* Added text-center here */}
                    <h2 className="text-3xl font-bold text-center mb-6 text-[#CCFF00]">Your BMI Result & Fitness Plan</h2>

                    {bmiResult && (
                        <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-inner border border-[#AFFF00]">
                            <h3 className="text-2xl font-semibold mb-3 text-[#AFFF00]">Your BMI: {bmiResult}</h3>
                            <p className="text-lg text-gray-300">
                                Category: <span className="font-bold text-[#CCFF00]">{getBmiCategory(bmiResult)}</span>
                            </p>
                        </div>
                    )}

                    {fitnessPlan ? (
                        <div className="p-6 bg-gray-800 rounded-lg shadow-inner border border-[#AFFF00]">
                            <h3 className="text-2xl font-semibold mb-3 text-[#AFFF00]">Your Personalized 30-Day Fitness Plan:</h3>
                            <div className="prose max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: fitnessPlan.replace(/\n/g, '<br />') }}></div>
                        </div>
                    ) : (
                        <div className="p-6 bg-gray-800 rounded-lg shadow-inner text-center border border-red-500">
                            <p className="text-lg text-red-400 font-semibold">Fitness plan not available. Please generate it from the Fitness Input Form.</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <Link
                            to="/fitnessInput"
                            className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Recalculate BMI
                        </Link>
                        <Link
                            to="/dashboard"
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    // Dashboard Component
    const DashboardPage = ({ isPlanLoading, userData, setUserData, setFitnessData, setBmiResult, setFitnessPlan, showCustomModal, bmiResult, fitnessPlan }) => {
        const { setCurrentPath } = React.useContext(RouterContext);

        return (
            <div className="flex flex-col items-center min-h-screen bg-[#1A1A1A] text-white p-4">
                 <NavigationBar
                    userData={userData}
                    setUserData={setUserData}
                    setFitnessData={setFitnessData}
                    setBmiResult={setBmiResult}
                    setFitnessPlan={setFitnessPlan}
                    showCustomModal={showCustomModal}
                    bmiResult={bmiResult}
                    fitnessPlan={fitnessPlan}
                />
                <div className="bg-[#2D2D2D] p-8 rounded-xl shadow-2xl max-w-4xl w-full mt-24 mb-6 text-center"> {/* Added text-center here */}
                    <h2 className="text-3xl font-bold text-center mb-6 text-[#CCFF00]">Your FitTrack Dashboard</h2>

                    {userData ? (
                        <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-inner border border-[#AFFF00]">
                            <h3 className="text-2xl font-semibold mb-3 text-[#AFFF00]">Welcome, {userData.email}!</h3>
                            <p className="text-lg text-gray-300">Here you can manage your health data and track progress.</p>
                        </div>
                    ) : (
                        <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-inner border border-red-500">
                            <p className="text-lg text-red-400 font-semibold">Please log in or register to access your personalized dashboard features.</p>
                        </div>
                    )}

                    {fitnessData && (
                        <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-inner border border-[#AFFF00]">
                            <h3 className="text-2xl font-semibold mb-3 text-[#AFFF00]">Your Current Fitness Data:</h3>
                            <p className="text-lg text-gray-300"><strong>Height:</strong> {fitnessData.height}</p>
                            <p className="text-lg text-gray-300"><strong>Weight:</strong> {fitnessData.weight}</p>
                            <p className="text-lg text-gray-300"><strong>Age:</strong> {fitnessData.age}</p>
                            <p className="text-lg text-gray-300"><strong>Gender:</strong> {fitnessData.gender}</p>
                            <p className="text-lg text-gray-300"><strong>Workout Habits:</strong> {fitnessData.workoutHabits}</p>
                            {bmiResult && <p className="text-lg text-gray-300"><strong>Last Calculated BMI:</strong> {bmiResult}</p>}
                        </div>
                    )}

                    {/* Spinning Loader / Fitness Plan Display */}
                    {isPlanLoading && !fitnessPlan ? (
                        <div className="p-6 bg-gray-800 rounded-lg shadow-inner text-center border border-[#AFFF00] flex flex-col items-center justify-center">
                            <h3 className="text-2xl font-semibold mb-4 text-[#AFFF00]">Generating Your Fitness Plan...</h3>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#AFFF00] border-opacity-75"></div>
                            <p className="text-md text-gray-400 mt-4">This might take a moment.</p>
                        </div>
                    ) : fitnessPlan ? (
                        <div className="p-6 bg-gray-800 rounded-lg shadow-inner border border-[#AFFF00]">
                            <h3 className="text-2xl font-semibold mb-3 text-[#AFFF00]">Your Personalized 30-Day Fitness Plan:</h3>
                            <div className="prose max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: fitnessPlan.replace(/\n/g, '<br />') }}></div>
                            <div className="flex justify-center mt-6">
                                <Link
                                    to="/bmiResult"
                                    className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    View Detailed BMI & Plan
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-gray-800 rounded-lg shadow-inner text-center border border-gray-700">
                            <p className="text-lg text-gray-400 font-semibold">No fitness plan generated yet. Please enter your fitness data.</p>
                            <div className="flex justify-center mt-4">
                                <Link
                                    to="/fitnessInput"
                                    className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    Enter Fitness Data
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <Link
                            to="/fitnessInput"
                            className="bg-gradient-to-r from-[#AFFF00] to-[#66CC00] text-[#1A1A1A] font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {fitnessData ? 'Update Fitness Data' : 'Enter Fitness Data'}
                        </Link>
                        <button
                            onClick={() => { setUserData(null); setFitnessData(null); setBmiResult(null); setFitnessPlan(null); setCurrentPath('/'); showCustomModal("You have been logged out."); }}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="font-inter">
            {/* Tailwind CSS CDN - REMOVE THIS LINE IN YOUR ACTUAL PROJECT */}
            <script src="https://cdn.tailwindcss.com"></script>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<AuthPage type="login" setUserData={setUserData} />} />
                    <Route path="/register" element={<AuthPage type="register" setUserData={setUserData} />} />
                    <Route path="/fitnessInput" element={<FitnessInputForm
                        setIsPlanLoading={setIsPlanLoading}
                        userData={userData}
                        setUserData={setUserData}
                        setFitnessData={setFitnessData}
                        setBmiResult={setBmiResult}
                        setFitnessPlan={setFitnessPlan}
                        showCustomModal={showCustomModal}
                        bmiResult={bmiResult}
                        fitnessPlan={fitnessPlan}
                    />} />
                    <Route path="/bmiResult" element={<BmiResultDisplay
                        userData={userData}
                        setUserData={setUserData}
                        setFitnessData={setFitnessData}
                        setBmiResult={setBmiResult}
                        setFitnessPlan={setFitnessPlan}
                        showCustomModal={showCustomModal}
                        bmiResult={bmiResult}
                        fitnessPlan={fitnessPlan}
                    />} />
                    <Route path="/dashboard" element={<DashboardPage
                        isPlanLoading={isPlanLoading}
                        userData={userData}
                        setUserData={setUserData}
                        setFitnessData={setFitnessData}
                        setBmiResult={setBmiResult}
                        setFitnessPlan={setFitnessPlan}
                        showCustomModal={showCustomModal}
                        bmiResult={bmiResult}
                        fitnessPlan={fitnessPlan}
                    />} />
                </Routes>
            </BrowserRouter>
            {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default App;
