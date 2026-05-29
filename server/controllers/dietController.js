const DietPlan = require('../models/DietPlan');
const ChatHistory = require('../models/ChatHistory');
const { generateDietPlan } = require('../services/aiService');

const BOT_QUESTIONS = [
  "Welcome! I am your Personal AI Diet Coach. I will help you build a customized diet and workout plan. Let's start with a few details. First, **what is your age**? (Please reply with a number)",
  "Thank you. **What is your gender**? (Please reply with 'Male', 'Female', or 'Other')",
  "Understood. **What is your height in centimeters**? (e.g., 175)",
  "Got it. **What is your current weight in kilograms**? (e.g., 70)",
  "Thanks. **What is your target weight in kilograms**? (e.g., 65)",
  "Perfect. **What is your fitness goal**? (Weight Loss, Weight Gain, Muscle Building, Maintenance)",
  "How would you describe your **activity level**? (Sedentary, Lightly Active, Moderately Active, Very Active)",
  "What is your **dietary preference**? (Vegetarian, Vegan, Non-Vegetarian)",
  "Do you have any **food allergies**? (e.g., Peanuts, Dairy, Gluten, or 'None')",
  "Almost there! Do you have any **medical restrictions or health conditions**? (e.g., Diabetes, Hypertension, or 'None')"
];

// Helper to determine the active AI provider
const getProviderName = () => {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
    return 'Groq';
  } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    return 'Gemini';
  }
  return 'Offline';
};

const { loadData, saveData } = require('../utils/mockStorage');

// In-memory fallbacks
const mockSessions = loadData('sessions.json', {}); // userId -> session
const mockDietPlans = loadData('dietPlans.json', []); // array of plans

// Helper to format detailed plan message in chat
const formatPlanMessage = (generatedPlan) => {
  const { calories, protein, carbs, fat, waterIntake, meals, exerciseRecommendations } = generatedPlan;
  
  const exercisesText = Array.isArray(exerciseRecommendations)
    ? exerciseRecommendations.map(ex => `• ${ex}`).join('\n')
    : '• Consult the Dashboard or Diet Plans page for recommendations.';

  return `🎉 **Your Personalized Diet & Fitness Plan is Ready!**

Here is a summary of your targets:
- 🍽️ **Daily Calories:** **${calories} kcal**
- 💧 **Daily Water:** **${waterIntake} Liters**
- 🧬 **Macros:** Protein: **${protein}g** | Carbs: **${carbs}g** | Fat: **${fat}g**

---

### 🍳 Customized Meal Plan
* **Breakfast:** ${meals.breakfast || 'N/A'}
* **Lunch:** ${meals.lunch || 'N/A'}
* **Dinner:** ${meals.dinner || 'N/A'}
* **Snack:** ${meals.snack || 'N/A'}

---

### 🏋️ Exercise & Workout Recommendations
${exercisesText}

---

**Note:** This plan has been saved to your profile. You can also view it on the Dashboard or Diet Plans page.

Feel free to ask me any questions about this plan below (e.g. *"What are some alternatives to eggs?"* or *"Can I replace almonds with walnuts?"*). I am here as your virtual fitness coach!`;
};

// Helper to validate input and save to intakeData (with fuzzy smart regex matching)
const saveIntakeField = (step, text, intakeData) => {
  const cleanText = text.trim();
  switch (step) {
    case 0: { // Age
      const ageMatch = cleanText.match(/\d+/);
      if (!ageMatch) throw new Error('Please enter a valid age (e.g., 25).');
      const age = parseInt(ageMatch[0]);
      if (age < 1 || age > 120) throw new Error('Please enter a valid age (e.g., 25).');
      intakeData.age = age;
      break;
    }
    case 1: { // Gender
      const genderText = cleanText.toLowerCase();
      if (genderText.includes('female') || genderText.includes('woman') || genderText.includes('girl')) {
        intakeData.gender = 'Female';
      } else if (genderText.includes('male') || genderText.includes('man') || genderText.includes('boy')) {
        intakeData.gender = 'Male';
      } else if (genderText.includes('other') || genderText.includes('non-binary') || genderText.includes('trans')) {
        intakeData.gender = 'Other';
      } else {
        throw new Error("Please specify 'Male', 'Female', or 'Other'.");
      }
      break;
    }
    case 2: { // Height
      const heightMatch = cleanText.match(/\d+(\.\d+)?/);
      if (!heightMatch) throw new Error('Please enter a valid height in cm (e.g., 175).');
      const height = parseFloat(heightMatch[0]);
      if (height < 50 || height > 280) throw new Error('Please enter a valid height in cm (e.g., 175).');
      intakeData.height = height;
      break;
    }
    case 3: { // Weight
      const weightMatch = cleanText.match(/\d+(\.\d+)?/);
      if (!weightMatch) throw new Error('Please enter a valid weight in kg (e.g., 72).');
      const weight = parseFloat(weightMatch[0]);
      if (weight < 10 || weight > 500) throw new Error('Please enter a valid weight in kg (e.g., 72).');
      intakeData.weight = weight;
      break;
    }
    case 4: { // Target Weight
      const targetMatch = cleanText.match(/\d+(\.\d+)?/);
      if (!targetMatch) throw new Error('Please enter a valid target weight in kg (e.g., 65).');
      const targetWeight = parseFloat(targetMatch[0]);
      if (targetWeight < 10 || targetWeight > 500) throw new Error('Please enter a valid target weight in kg (e.g., 65).');
      intakeData.targetWeight = targetWeight;
      break;
    }
    case 5: { // Goal
      const goalText = cleanText.toLowerCase();
      if (goalText.includes('lose') || goalText.includes('loss') || goalText.includes('diet') || goalText.includes('cut') || goalText.includes('slim')) {
        intakeData.goal = 'Weight Loss';
      } else if (goalText.includes('gain') || goalText.includes('bulk')) {
        intakeData.goal = 'Weight Gain';
      } else if (goalText.includes('muscle') || goalText.includes('build') || goalText.includes('hypertrophy') || goalText.includes('strength')) {
        intakeData.goal = 'Muscle Building';
      } else if (goalText.includes('maintain') || goalText.includes('maintenance') || goalText.includes('keep') || goalText.includes('stay')) {
        intakeData.goal = 'Maintenance';
      } else {
        throw new Error("Please enter: 'Weight Loss', 'Weight Gain', 'Muscle Building', or 'Maintenance'.");
      }
      break;
    }
    case 6: { // Activity Level
      const actText = cleanText.toLowerCase();
      if (actText.includes('sedentary') || actText.includes('sit') || actText.includes('no exercise') || actText.includes('couch') || actText.includes('desk')) {
        intakeData.activityLevel = 'Sedentary';
      } else if (actText.includes('lightly') || actText.includes('light') || actText.includes('1-2') || actText.includes('1 to 2') || actText.includes('low')) {
        intakeData.activityLevel = 'Lightly Active';
      } else if (actText.includes('very active') || actText.includes('heavy') || actText.includes('athlete') || actText.includes('daily') || actText.includes('5-6') || actText.includes('5 to 6')) {
        intakeData.activityLevel = 'Very Active';
      } else if (actText.includes('moderately') || actText.includes('moderate') || actText.includes('3-4') || actText.includes('3 to 4') || actText.includes('active')) {
        intakeData.activityLevel = 'Moderately Active';
      } else if (actText.includes('very') || actText.includes('extreme')) {
        intakeData.activityLevel = 'Very Active';
      } else {
        throw new Error("Please enter: 'Sedentary', 'Lightly Active', 'Moderately Active', or 'Very Active'.");
      }
      break;
    }
    case 7: { // Dietary Preference
      const prefText = cleanText.toLowerCase();
      if (prefText.includes('vegan')) {
        intakeData.preference = 'Vegan';
      } else if (prefText.includes('vegetarian') || prefText.includes('veg')) {
        intakeData.preference = 'Vegetarian';
      } else if (prefText.includes('non') || prefText.includes('meat') || prefText.includes('chicken') || prefText.includes('fish') || prefText.includes('everything') || prefText.includes('omnivore')) {
        intakeData.preference = 'Non-Vegetarian';
      } else {
        throw new Error("Please enter: 'Vegetarian', 'Vegan', or 'Non-Vegetarian'.");
      }
      break;
    }
    case 8: // Allergies
      intakeData.allergies = cleanText;
      break;
    case 9: // Medical Restrictions
      intakeData.medicalRestrictions = cleanText;
      break;
  }
};

// @desc    Get or create active chat session
// @route   GET /api/diet/chat
// @access  Private
const getChatSession = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id.toString();
    const provider = getProviderName();
    const welcomeMsg = BOT_QUESTIONS[0].replace("Personal AI Diet Coach", `Personal ${provider} AI Diet Coach`);

    // Fetch user biometrics to see if they already exist
    let userBiometrics = null;
    const isMemory = process.env.USE_MEMORY_DB === 'true';
    if (isMemory) {
      const { mockUsers } = require('./authController');
      userBiometrics = mockUsers.find(u => u._id === userId);
    } else {
      const User = require('../models/User');
      userBiometrics = await User.findById(req.user._id);
    }

    const hasBiometrics = userBiometrics && 
      userBiometrics.age && 
      userBiometrics.gender && 
      userBiometrics.height && 
      userBiometrics.weight && 
      userBiometrics.goal && 
      userBiometrics.activityLevel && 
      userBiometrics.preference;

    // --- IN-MEMORY DB FALLBACK ---
    if (isMemory) {
      let session = mockSessions[userId];
      
      // Auto-complete and pre-generate plan if user has profile biometrics and no active session
      if (!session && hasBiometrics) {
        const intakeData = {
          age: userBiometrics.age,
          gender: userBiometrics.gender,
          height: userBiometrics.height,
          weight: userBiometrics.weight,
          targetWeight: userBiometrics.targetWeight,
          goal: userBiometrics.goal,
          activityLevel: userBiometrics.activityLevel,
          preference: userBiometrics.preference,
          allergies: userBiometrics.allergies || 'None',
          medicalRestrictions: userBiometrics.medicalRestrictions || 'None'
        };

        const generatedPlan = await generateDietPlan(intakeData);
        const dietPlan = {
          _id: 'mock_plan_' + Math.random().toString(36).substr(2, 9),
          userId,
          ...intakeData,
          generatedPlan,
          createdAt: new Date()
        };
        mockDietPlans.push(dietPlan);

        session = {
          userId,
          currentStep: BOT_QUESTIONS.length,
          messages: [
            { _id: 'msg_0', sender: 'bot', text: `Welcome! I've loaded your profile biometrics (Age: **${intakeData.age}**, Height: **${intakeData.height} cm**, Weight: **${intakeData.weight} kg**, Goal: **${intakeData.goal}**).`, createdAt: new Date() },
            { _id: 'msg_1', sender: 'bot', text: formatPlanMessage(generatedPlan), createdAt: new Date() }
          ],
          intakeData
        };
        mockSessions[userId] = session;
      } else if (!session) {
        session = {
          userId,
          currentStep: 0,
          messages: [
            { _id: 'msg_0', sender: 'bot', text: welcomeMsg, createdAt: new Date() }
          ],
          intakeData: {}
        };
        mockSessions[userId] = session;
      }
      saveData('sessions.json', mockSessions);
      saveData('dietPlans.json', mockDietPlans);
      return res.json({ success: true, session, provider });
    }

    // --- MONGOOSE / MONGODB PATH ---
    let session = await ChatHistory.findOne({ userId: req.user._id });
    
    if (!session && hasBiometrics) {
      const intakeData = {
        age: userBiometrics.age,
        gender: userBiometrics.gender,
        height: userBiometrics.height,
        weight: userBiometrics.weight,
        targetWeight: userBiometrics.targetWeight,
        goal: userBiometrics.goal,
        activityLevel: userBiometrics.activityLevel,
        preference: userBiometrics.preference,
        allergies: userBiometrics.allergies || 'None',
        medicalRestrictions: userBiometrics.medicalRestrictions || 'None'
      };

      const generatedPlan = await generateDietPlan(intakeData);
      const DietPlan = require('../models/DietPlan');
      const dietPlan = new DietPlan({
        userId: req.user._id,
        ...intakeData,
        generatedPlan
      });
      await dietPlan.save();

      session = new ChatHistory({
        userId: req.user._id,
        currentStep: BOT_QUESTIONS.length,
        messages: [
          { sender: 'bot', text: `Welcome! I've loaded your profile biometrics (Age: **${intakeData.age}**, Height: **${intakeData.height} cm**, Weight: **${intakeData.weight} kg**, Goal: **${intakeData.goal}**).` },
          { sender: 'bot', text: formatPlanMessage(generatedPlan) }
        ],
        intakeData
      });
      await session.save();
    } else if (!session) {
      session = new ChatHistory({
        userId: req.user._id,
        currentStep: 0,
        messages: [
          { sender: 'bot', text: welcomeMsg }
        ],
        intakeData: {}
      });
      await session.save();
    }
    return res.json({ success: true, session, provider });
  } catch (error) {
    console.error('Get Chat Session Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving chat session' });
  }
};

// @desc    Send message to chatbot and proceed intake
// @route   POST /api/diet/chat/message
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide message text' });
    }

    const userId = req.user.id || req.user._id.toString();
    const isMemory = process.env.USE_MEMORY_DB === 'true';
    const provider = getProviderName();

    // 1. Fetch current session
    let session;
    if (isMemory) {
      session = mockSessions[userId];
    } else {
      session = await ChatHistory.findOne({ userId: req.user._id });
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    const currentStep = session.currentStep;

    // --- CONVERSATIONAL CHAT MODE (Intake complete, step >= 10) ---
    if (currentStep >= BOT_QUESTIONS.length) {
      session.messages.push({
        _id: isMemory ? 'msg_user_' + Date.now() : undefined,
        sender: 'user',
        text,
        createdAt: new Date()
      });

      // Get latest diet plan
      let latestPlan;
      if (isMemory) {
        latestPlan = mockDietPlans
          .filter(p => p.userId === userId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      } else {
        latestPlan = await DietPlan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      }

      const chatHistory = session.messages.slice(0, -1).map(m => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        text: m.text
      }));

      const { askGeneralQuestion } = require('../services/aiService');
      const botResponse = await askGeneralQuestion(text, chatHistory, latestPlan);

      session.messages.push({
        _id: isMemory ? 'msg_bot_' + Date.now() : undefined,
        sender: 'bot',
        text: botResponse,
        createdAt: new Date()
      });

      if (isMemory) {
        mockSessions[userId] = session;
        saveData('sessions.json', mockSessions);
      } else {
        await session.save();
      }

      return res.json({ success: true, session, provider });
    }

    // --- INTAKE FLOW BRANCHES ---
    if (isMemory) {
      // In-Memory Intake Flow
      session.messages.push({
        _id: 'msg_user_' + Date.now(),
        sender: 'user',
        text,
        createdAt: new Date()
      });

      try {
        if (!session.intakeData) session.intakeData = {};
        saveIntakeField(currentStep, text, session.intakeData);
      } catch (validationError) {
        session.messages.push({
          _id: 'msg_bot_err_' + Date.now(),
          sender: 'bot',
          text: `⚠️ ${validationError.message}\n\nLet's try again: ${BOT_QUESTIONS[currentStep].replace("Welcome! I am your Personal AI Diet Coach. I will help you build a customized diet and workout plan. Let's start with a few details. First, ", "")}`,
          createdAt: new Date()
        });
        saveData('sessions.json', mockSessions);
        return res.json({ success: true, session, provider });
      }

      const nextStep = currentStep + 1;
      session.currentStep = nextStep;

      if (nextStep < BOT_QUESTIONS.length) {
        session.messages.push({
          _id: 'msg_bot_' + nextStep + '_' + Date.now(),
          sender: 'bot',
          text: BOT_QUESTIONS[nextStep],
          createdAt: new Date()
        });
        saveData('sessions.json', mockSessions);
        return res.json({ success: true, session, provider });
      } else {
        // Generate plan
        session.messages.push({
          _id: 'msg_bot_gen_' + Date.now(),
          sender: 'bot',
          text: 'Thank you! I have collected all the details. Generating your personalized plan now...',
          createdAt: new Date()
        });

        const generatedPlan = await generateDietPlan(session.intakeData);

        const dietPlan = {
          _id: 'mock_plan_' + Math.random().toString(36).substr(2, 9),
          userId,
          ...session.intakeData,
          generatedPlan,
          createdAt: new Date()
        };

        mockDietPlans.push(dietPlan);

        // Also save biometrics to User on the backend
        const { mockUsers } = require('./authController');
        const user = mockUsers.find(u => u._id === userId);
        if (user) {
          Object.assign(user, session.intakeData);
          saveData('users.json', mockUsers);
        }

        session.messages.push({
          _id: 'msg_bot_done_' + Date.now(),
          sender: 'bot',
          text: formatPlanMessage(generatedPlan),
          createdAt: new Date()
        });

        session.currentStep = BOT_QUESTIONS.length;
        saveData('sessions.json', mockSessions);
        saveData('dietPlans.json', mockDietPlans);
        return res.json({ success: true, session, dietPlan, provider });
      }
    } else {
      // MongoDB Intake Flow
      session.messages.push({ sender: 'user', text });

      try {
        if (!session.intakeData) session.intakeData = {};
        saveIntakeField(currentStep, text, session.intakeData);
      } catch (validationError) {
        session.messages.push({
          sender: 'bot',
          text: `⚠️ ${validationError.message}\n\nLet's try again: ${BOT_QUESTIONS[currentStep].replace("Welcome! I am your Personal AI Diet Coach. I will help you build a customized diet and workout plan. Let's start with a few details. First, ", "")}`
        });
        await session.save();
        return res.json({ success: true, session, provider });
      }

      const nextStep = currentStep + 1;
      session.currentStep = nextStep;

      if (nextStep < BOT_QUESTIONS.length) {
        session.messages.push({ sender: 'bot', text: BOT_QUESTIONS[nextStep] });
        await session.save();
        return res.json({ success: true, session, provider });
      } else {
        session.messages.push({ sender: 'bot', text: 'Thank you! I have collected all the details. Generating your personalized plan now...' });
        await session.save();

        const generatedPlan = await generateDietPlan(session.intakeData);

        const dietPlan = new DietPlan({
          userId: req.user._id,
          ...session.intakeData,
          generatedPlan
        });
        await dietPlan.save();

        // Also save biometrics to User on the backend
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, {
          $set: session.intakeData
        });

        session.messages.push({
          sender: 'bot',
          text: formatPlanMessage(generatedPlan)
        });
        session.currentStep = BOT_QUESTIONS.length;
        await session.save();

        return res.json({ success: true, session, dietPlan, provider });
      }
    }
  } catch (error) {
    console.error('Send Chat Message Error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing chat message' });
  }
};

// @desc    Reset chat session to start over
// @route   POST /api/diet/chat/reset
// @access  Private
const resetChatSession = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id.toString();
    const provider = getProviderName();
    const welcomeMsg = BOT_QUESTIONS[0].replace("Personal AI Diet Coach", `Personal ${provider} AI Diet Coach`);

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const session = {
        userId,
        currentStep: 0,
        messages: [{ _id: 'msg_0', sender: 'bot', text: welcomeMsg, createdAt: new Date() }],
        intakeData: {}
      };
      mockSessions[userId] = session;
      saveData('sessions.json', mockSessions);
      return res.json({ success: true, session, provider });
    }

    // --- MONGOOSE / MONGODB PATH ---
    let session = await ChatHistory.findOne({ userId: req.user._id });
    if (session) {
      session.currentStep = 0;
      session.messages = [{ sender: 'bot', text: welcomeMsg }];
      session.intakeData = {};
      await session.save();
    } else {
      session = new ChatHistory({
        userId: req.user._id,
        currentStep: 0,
        messages: [{ sender: 'bot', text: welcomeMsg }],
        intakeData: {}
      });
      await session.save();
    }
    return res.json({ success: true, session, provider });
  } catch (error) {
    console.error('Reset Chat Session Error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting chat session' });
  }
};

// @desc    Get diet plan history
// @route   GET /api/diet/history
// @access  Private
const getDietHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id.toString();

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const history = mockDietPlans
        .filter(p => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, history });
    }

    // --- MONGOOSE / MONGODB PATH ---
    const history = await DietPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, history });
  } catch (error) {
    console.error('Get Diet History Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching history' });
  }
};

// @desc    Get single diet plan
// @route   GET /api/diet/:id
// @access  Private
const getDietPlan = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id.toString();

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const plan = mockDietPlans.find(p => p._id === req.params.id && p.userId === userId);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Diet plan not found' });
      }
      return res.json({ success: true, plan });
    }

    // --- MONGOOSE / MONGODB PATH ---
    const plan = await DietPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }
    return res.json({ success: true, plan });
  } catch (error) {
    console.error('Get Diet Plan Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching diet plan' });
  }
};

// @desc    Delete diet plan
// @route   DELETE /api/diet/:id
// @access  Private
const deleteDietPlan = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id.toString();

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const index = mockDietPlans.findIndex(p => p._id === req.params.id && p.userId === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Diet plan not found' });
      }
      mockDietPlans.splice(index, 1);
      saveData('dietPlans.json', mockDietPlans);
      return res.json({ success: true, message: 'Diet plan deleted successfully' });
    }

    // --- MONGOOSE / MONGODB PATH ---
    const plan = await DietPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }
    return res.json({ success: true, message: 'Diet plan deleted successfully' });
  } catch (error) {
    console.error('Delete Diet Plan Error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting diet plan' });
  }
};

// @desc    Direct diet plan generation (bypassing chat)
// @route   POST /api/diet/generate
// @access  Private
const generateDirect = async (req, res) => {
  try {
    const { age, gender, height, weight, targetWeight, goal, activityLevel, preference, allergies, medicalRestrictions } = req.body;

    if (!age || !gender || !height || !weight || !goal || !activityLevel || !preference) {
      return res.status(400).json({ success: false, message: 'Please provide all required biometric metrics' });
    }

    const userId = req.user.id || req.user._id.toString();
    const inputData = {
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      goal,
      activityLevel,
      preference,
      allergies: allergies || 'None',
      medicalRestrictions: medicalRestrictions || 'None'
    };

    const generatedPlan = await generateDietPlan(inputData);

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const dietPlan = {
        _id: 'mock_plan_' + Math.random().toString(36).substr(2, 9),
        userId,
        ...inputData,
        generatedPlan,
        createdAt: new Date()
      };
      mockDietPlans.push(dietPlan);
      saveData('dietPlans.json', mockDietPlans);
      return res.status(201).json({ success: true, plan: dietPlan });
    }

    // --- MONGOOSE / MONGODB PATH ---
    const dietPlan = new DietPlan({
      userId: req.user._id,
      ...inputData,
      generatedPlan
    });

    await dietPlan.save();
    return res.status(201).json({ success: true, plan: dietPlan });
  } catch (error) {
    console.error('Direct Generate Error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating plan' });
  }
};

// @desc    Regenerate diet plan from existing parameters
// @route   POST /api/diet/:id/regenerate
// @access  Private
const regenerateDietPlan = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id.toString();
    let oldPlan;

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      oldPlan = mockDietPlans.find(p => p._id === req.params.id && p.userId === userId);
    } else {
      oldPlan = await DietPlan.findOne({ _id: req.params.id, userId: req.user._id });
    }

    if (!oldPlan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }

    const inputData = {
      age: oldPlan.age,
      gender: oldPlan.gender,
      height: oldPlan.height,
      weight: oldPlan.weight,
      targetWeight: oldPlan.targetWeight,
      goal: oldPlan.goal,
      activityLevel: oldPlan.activityLevel,
      preference: oldPlan.preference,
      allergies: oldPlan.allergies,
      medicalRestrictions: oldPlan.medicalRestrictions
    };

    const generatedPlan = await generateDietPlan(inputData);

    // Save as a brand new plan
    if (process.env.USE_MEMORY_DB === 'true') {
      const newPlan = {
        _id: 'mock_plan_' + Math.random().toString(36).substr(2, 9),
        userId,
        ...inputData,
        generatedPlan,
        createdAt: new Date()
      };
      mockDietPlans.push(newPlan);
      saveData('dietPlans.json', mockDietPlans);
      return res.status(201).json({ success: true, plan: newPlan });
    }

    const newPlan = new DietPlan({
      userId: req.user._id,
      ...inputData,
      generatedPlan
    });

    await newPlan.save();
    return res.status(201).json({ success: true, plan: newPlan });
  } catch (error) {
    console.error('Regenerate Diet Plan Error:', error);
    return res.status(500).json({ success: false, message: 'Server error regenerating diet plan' });
  }
};

// @desc    Quick Q&A without intake session
// @route   POST /api/diet/quick-qa
// @access  Private
const quickQA = async (req, res) => {
  try {
    const { text, history } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide message text' });
    }

    const userId = req.user.id || req.user._id.toString();
    const isMemory = process.env.USE_MEMORY_DB === 'true';

    // Fetch user's latest plan to provide context if available
    let latestPlan = null;
    if (isMemory) {
      latestPlan = mockDietPlans
        .filter(p => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    } else {
      latestPlan = await DietPlan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    const { askGeneralQuestion } = require('../services/aiService');
    const formattedHistory = (history || []).map(h => ({
      role: h.sender === 'bot' ? 'model' : 'user',
      text: h.text
    }));

    const botResponse = await askGeneralQuestion(text, formattedHistory, latestPlan);
    return res.json({ success: true, answer: botResponse });
  } catch (error) {
    console.error('Quick QA Error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing Q&A' });
  }
};

module.exports = {
  getChatSession,
  sendChatMessage,
  resetChatSession,
  getDietHistory,
  getDietPlan,
  deleteDietPlan,
  generateDirect,
  regenerateDietPlan,
  quickQA
};
