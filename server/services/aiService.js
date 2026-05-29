const { GoogleGenerativeAI } = require('@google/generative-ai');

// Calculate BMR, TDEE, and macros programmatically as a fallback
const calculateFallbackPlan = (data) => {
  const { age, gender, height, weight, goal, activityLevel, preference, allergies, medicalRestrictions } = data;
  
  // 1. Calculate BMR (Mifflin-St Jeor Equation)
  let bmr = 0;
  if (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Calculate TDEE based on activity level
  let activityMultiplier = 1.2;
  switch (activityLevel) {
    case 'Sedentary': activityMultiplier = 1.2; break;
    case 'Lightly Active': activityMultiplier = 1.375; break;
    case 'Moderately Active': activityMultiplier = 1.55; break;
    case 'Very Active': activityMultiplier = 1.725; break;
  }
  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Adjust calories based on goal
  let targetCalories = tdee;
  if (goal === 'Weight Loss') {
    targetCalories = Math.max(1200, tdee - 500); // Prevent going below safe minimum
  } else if (goal === 'Weight Gain') {
    targetCalories = tdee + 500;
  } else if (goal === 'Muscle Building') {
    targetCalories = tdee + 250;
  }

  // 4. Calculate Macro split (Protein, Fat, Carbs)
  // Protein: 2.0g per kg for muscle building/weight loss, 1.6g for maintenance/gain
  let proteinPerKg = 1.6;
  if (goal === 'Muscle Building' || goal === 'Weight Loss') {
    proteinPerKg = 2.0;
  }
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% of total calories
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: Remaining calories
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbGrams = Math.max(50, Math.round(carbCalories / 4));

  // 5. Water Intake: roughly 35ml per kg of body weight
  const waterLiters = parseFloat(((weight * 35) / 1000).toFixed(1));

  // 6. Meal templates based on dietary preference
  let meals = {
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: ''
  };

  const isVeg = preference === 'Vegetarian';
  const isVegan = preference === 'Vegan';

  if (isVegan) {
    meals.breakfast = 'Oatmeal topped with sliced bananas, chia seeds, chopped walnuts, and a splash of almond milk.';
    meals.lunch = 'Quinoa bowl with mixed greens, black beans, cherry tomatoes, sliced cucumber, and a tahini lemon dressing.';
    meals.dinner = 'Stir-fried tofu with broccoli, bell peppers, snap peas, and carrots over brown rice with a low-sodium soy sauce.';
    meals.snack = 'Apple slices paired with 2 tablespoons of natural peanut butter.';
  } else if (isVeg) {
    meals.breakfast = 'Scrambled egg whites (or tofu stir-fry) with spinach, tomatoes, and mushrooms served with whole-grain toast.';
    meals.lunch = 'Lentil soup served with a side salad of mixed greens, feta cheese, cucumber, olives, and a light vinaigrette.';
    meals.dinner = 'Paneer (or tofu) and vegetable skewers grilled with bell peppers and onions, served over quinoa and steamed spinach.';
    meals.snack = 'Greek yogurt topped with fresh blueberries and a drizzle of honey.';
  } else {
    meals.breakfast = 'Three egg omelette cooked with baby spinach, onions, and feta cheese, served with one slice of sourdough.';
    meals.lunch = 'Grilled chicken salad with romaine lettuce, cherry tomatoes, grilled asparagus, and a dressing of olive oil and lemon.';
    meals.dinner = 'Baked salmon fillet served with roasted sweet potato wedges and steamed green beans drizzled with sesame oil.';
    meals.snack = 'Mixed berries and a scoop of whey protein shaken with water or skim milk.';
  }

  // Adjust for allergies
  if (allergies && allergies.trim() !== '' && allergies.toLowerCase() !== 'none') {
    const allergenList = allergies.toLowerCase();
    const adjustMeal = (mealText) => {
      let text = mealText;
      if (allergenList.includes('peanut') || allergenList.includes('nut')) {
        text = text.replace(/peanut butter/gi, 'sunflower seed butter')
                   .replace(/walnuts/gi, 'pumpkin seeds')
                   .replace(/almonds/gi, 'sunflower seeds');
      }
      if (allergenList.includes('egg')) {
        text = text.replace(/egg whites/gi, 'tofu scramble')
                   .replace(/egg omelette/gi, 'chickpea flour omelette')
                   .replace(/three egg/gi, 'tofu scramble');
      }
      if (allergenList.includes('dairy') || allergenList.includes('milk') || allergenList.includes('lactose')) {
        text = text.replace(/feta cheese/gi, 'avocado slices')
                   .replace(/skim milk/gi, 'oat milk')
                   .replace(/Greek yogurt/gi, 'Coconut yogurt')
                   .replace(/whey protein/gi, 'pea protein');
      }
      if (allergenList.includes('gluten') || allergenList.includes('wheat')) {
        text = text.replace(/whole-grain toast/gi, 'gluten-free toast')
                   .replace(/sourdough/gi, 'gluten-free bread');
      }
      return text;
    };
    meals.breakfast = adjustMeal(meals.breakfast);
    meals.lunch = adjustMeal(meals.lunch);
    meals.dinner = adjustMeal(meals.dinner);
    meals.snack = adjustMeal(meals.snack);
  }

  // Exercise recommendations based on goal
  let exercises = [];
  if (goal === 'Weight Loss') {
    exercises = [
      '30-45 minutes of moderate-intensity steady-state cardio (brisk walking, cycling) 3-4 times a week.',
      'Full-body strength training circuit (squats, pushups, rows) 3 times a week to preserve muscle mass.',
      'Daily activity: Target at least 8,000 to 10,000 steps per day.'
    ];
  } else if (goal === 'Muscle Building' || goal === 'Weight Gain') {
    exercises = [
      'Progressive overload resistance training (weights or calisthenics) 4 times a week, focusing on major compounds.',
      'Limit high-intensity cardio to 1-2 sessions of 15-20 minutes to avoid burning excess calories.',
      'Rest: Prioritize 7-8 hours of quality sleep for muscle recovery.'
    ];
  } else {
    exercises = [
      'Balanced routine combining resistance training 3 times a week and cardio 2 times a week.',
      'Mobility and stretching sessions (yoga, dynamic drills) 1-2 times a week for joint health.',
      'Daily activity: Target 7,000 to 8,000 steps per day.'
    ];
  }

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
    waterIntake: waterLiters,
    meals,
    exerciseRecommendations: exercises,
    isFallback: true
  };
};

// General conversational chat with Gemini or Groq
const askGeneralQuestion = async (userQuestion, chatHistory, dietPlan) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 1. Try Groq API
  if (groqApiKey && groqApiKey.trim() !== '') {
    try {
      console.log('Using Groq API for general chat...');
      let contextStr = 'No active diet plan configured yet.';
      if (dietPlan) {
        contextStr = `
          User Profile & Goals:
          - Age: ${dietPlan.age} years old
          - Gender: ${dietPlan.gender}
          - Height: ${dietPlan.height} cm
          - Weight: ${dietPlan.weight} kg
          - Goal: ${dietPlan.goal}
          - Activity Level: ${dietPlan.activityLevel}
          - Dietary Preference: ${dietPlan.preference}
          - Allergies: ${dietPlan.allergies || 'None'}
          - Medical Restrictions: ${dietPlan.medicalRestrictions || 'None'}
          - Daily Target Calories: ${dietPlan.generatedPlan.calories} kcal
          - Macros: Protein ${dietPlan.generatedPlan.protein}g, Carbs ${dietPlan.generatedPlan.carbs}g, Fat ${dietPlan.generatedPlan.fat}g
        `;
      }

      const messages = [
        {
          role: 'system',
          content: `You are an expert AI Dietitian and Fitness Coach named NutriGemini Coach.
          Answer the user's health, nutrition, or workout questions.
          Always tailor your advice specifically to the user's diet plan, preferences, allergies, and medical restrictions listed below.
          If their request is unrelated to nutrition, dieting, cooking, exercise, or health, politely redirect them back to their fitness journey.
          
          CRITICAL: Your response must be extremely short, concise, on-point, and written in very simple, easily readable language. 
          Avoid long paragraphs or verbose explanations. Use short bullet points where possible. 
          Do not write more than 4-5 sentences in total. Format in clean markdown.

          User Diet Plan Context:
          ${contextStr}`
        }
      ];

      // Format conversation history
      chatHistory.slice(-6).forEach(h => {
        messages.push({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.text
        });
      });

      // Add current user question
      messages.push({ role: 'user', content: userQuestion });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API responded with status ${response.status}`);
      }

      const resData = await response.json();
      return resData.choices[0].message.content.trim();

    } catch (error) {
      console.error('Groq General Chat Error:', error.message);
      // Fall through to Gemini
    }
  }

  // 2. Try Gemini API
  if (geminiApiKey && geminiApiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      let contextStr = 'No active diet plan configured yet.';
      if (dietPlan) {
        contextStr = `
          User Profile & Goals:
          - Age: ${dietPlan.age} years old
          - Gender: ${dietPlan.gender}
          - Height: ${dietPlan.height} cm
          - Weight: ${dietPlan.weight} kg
          - Goal: ${dietPlan.goal}
          - Activity Level: ${dietPlan.activityLevel}
          - Dietary Preference: ${dietPlan.preference}
          - Allergies: ${dietPlan.allergies || 'None'}
          - Medical Restrictions: ${dietPlan.medicalRestrictions || 'None'}
          - Daily Target Calories: ${dietPlan.generatedPlan.calories} kcal
          - Macros: Protein ${dietPlan.generatedPlan.protein}g, Carbs ${dietPlan.generatedPlan.carbs}g, Fat ${dietPlan.generatedPlan.fat}g
        `;
      }

      const formattedHistory = chatHistory
        .slice(-6)
        .map(m => `${m.role === 'model' ? 'Coach' : 'User'}: ${m.text}`)
        .join('\n');

      const prompt = `
        You are an expert AI Dietitian and Fitness Coach named NutriGemini Coach.
        The user is asking a general health, nutrition, or workout question.
        Answer the question in a supportive, professional, and scientifically-backed manner.
        Tailor your advice specifically to the user's diet plan, preferences, allergies, and medical restrictions listed below.
        If their request is unrelated to nutrition, dieting, cooking, exercise, or health, politely redirect them back to their fitness journey.
        
        CRITICAL: Your response must be extremely short, concise, on-point, and written in very simple, easily readable language. 
        Avoid long paragraphs or verbose explanations. Use short bullet points where possible. 
        Do not write more than 4-5 sentences in total. Format in clean markdown.

        User Diet Plan Context:
        ${contextStr}

        Recent Conversation History:
        ${formattedHistory}

        User's Question:
        ${userQuestion}

        Coach Response:
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();

    } catch (error) {
      console.error('Gemini General Chat Error:', error.message);
    }
  }

  // 3. Programmatic Fallback Response
  return `⚠️ **AI API Keys are not configured in \`server/.env\`**\n\nI am currently running in offline mock mode. Here is a general recommendation:\n- For your goal (**${dietPlan ? dietPlan.goal : 'health'}**), ensure you eat whole foods, prioritize lean protein, and stay hydrated.\n- You asked: *"${userQuestion}"*\n- To unlock real-time AI dietitian advice, please supply a **\`GROQ_API_KEY\`** or **\`GEMINI_API_KEY\`** in the server \`.env\` file.`;
};

// Main function to generate a diet plan using Groq, Gemini, or fallback
const generateDietPlan = async (data) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 1. Try Groq API
  if (groqApiKey && groqApiKey.trim() !== '') {
    try {
      console.log('Using Groq API for diet plan generation...');
      
      const systemPrompt = `
        You are an expert AI Dietitian and Fitness Coach. 
        Generate a customized diet and workout recommendation based on the user's biometrics and goals.
        Return the output as a valid JSON object matching the schema below.
        Output raw JSON only, do not wrap in markdown code blocks.
        IMPORTANT: Keep descriptions of meals and training extremely short, concise, and in simple language.

        JSON Output Schema:
        {
          "calories": number (Daily requirement in kcal),
          "protein": number (Daily protein target in grams),
          "carbs": number (Daily carbohydrate target in grams),
          "fat": number (Daily fat target in grams),
          "waterIntake": number (Daily water recommendation in Liters, e.g. 3.2),
          "meals": {
            "breakfast": "string (Meal list: keep it extremely short, concise, and easy to read)",
            "lunch": "string (Meal list: keep it extremely short, concise, and easy to read)",
            "dinner": "string (Meal list: keep it extremely short, concise, and easy to read)",
            "snack": "string (Meal list: keep it extremely short, concise, and easy to read)"
          },
          "exerciseRecommendations": [
            "string (recommendation 1, keep it short and on-point)",
            "string (recommendation 2, keep it short and on-point)",
            "string (recommendation 3, keep it short and on-point)"
          ]
        }
      `;

      const userPrompt = `
        User parameters:
        - Age: ${data.age} years
        - Gender: ${data.gender}
        - Height: ${data.height} cm
        - Weight: ${data.weight} kg
        - Target Weight: ${data.targetWeight ? data.targetWeight + ' kg' : 'N/A'}
        - Goal: ${data.goal}
        - Activity Level: ${data.activityLevel}
        - Dietary Preference: ${data.preference}
        - Allergies: ${data.allergies || 'None'}
        - Medical Restrictions: ${data.medicalRestrictions || 'None'}
      `;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API responded with status ${response.status}`);
      }

      const resData = await response.json();
      const textResponse = resData.choices[0].message.content;
      const parsedData = JSON.parse(textResponse.trim());
      parsedData.isFallback = false;
      return parsedData;
    } catch (error) {
      console.error('Groq Generation Error:', error.message);
      // Fall through to Gemini
    }
  }

  // 2. Try Gemini API
  if (geminiApiKey && geminiApiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const systemPrompt = `
        You are an expert AI Dietitian and Fitness Coach. 
        Generate a customized diet and workout recommendation based on the user's biometrics and goals.
        Return the output as a valid JSON object matching the schema below.
        Do not include any markdown format tags like \`\`\`json or explanation text. Output raw JSON only.
        IMPORTANT: Keep descriptions of meals and training extremely short, concise, and in simple language.

        User parameters:
        - Age: ${data.age} years
        - Gender: ${data.gender}
        - Height: ${data.height} cm
        - Weight: ${data.weight} kg
        - Target Weight: ${data.targetWeight ? data.targetWeight + ' kg' : 'N/A'}
        - Goal: ${data.goal}
        - Activity Level: ${data.activityLevel}
        - Dietary Preference: ${data.preference}
        - Allergies: ${data.allergies || 'None'}
        - Medical Restrictions: ${data.medicalRestrictions || 'None'}

        JSON Output Schema:
        {
          "calories": number (Daily requirement in kcal),
          "protein": number (Daily protein target in grams),
          "carbs": number (Daily carbohydrate target in grams),
          "fat": number (Daily fat target in grams),
          "waterIntake": number (Daily water recommendation in Liters, e.g. 3.2),
          "meals": {
            "breakfast": "string (Meal list: keep it extremely short, concise, and easy to read)",
            "lunch": "string (Meal list: keep it extremely short, concise, and easy to read)",
            "dinner": "string (Meal list: keep it extremely short, concise, and easy to read)",
            "snack": "string (Meal list: keep it extremely short, concise, and easy to read)"
          },
          "exerciseRecommendations": [
            "string (exercise recommendation 1, keep it short and on-point)",
            "string (exercise recommendation 2, keep it short and on-point)",
            "string (exercise recommendation 3, keep it short and on-point)"
          ]
        }
      `;

      const result = await model.generateContent(systemPrompt);
      const textResponse = result.response.text();
      
      const parsedData = JSON.parse(textResponse.trim());
      parsedData.isFallback = false;
      return parsedData;

    } catch (error) {
      console.error('Gemini Generation Error:', error.message);
    }
  }

  // 3. Programmatic Fallback Plan
  console.log('No AI keys succeeded. Running fallback programmatic calculation...');
  return calculateFallbackPlan(data);
};

module.exports = { generateDietPlan, askGeneralQuestion };
