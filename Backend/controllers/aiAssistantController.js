const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// System context for the AI
const systemContext = `You are an AI assistant for the GoGreen360 waste management system. 
The system allows users to:
1. Report different types of waste (plastic, paper, glass, metal, organic, e-waste, hazardous, textile, construction, mixed waste)
2. Earn points for reporting waste and recycling activities
3. Track their waste reports and recycling activities
4. Redeem points for rewards
5. Participate in community events
6. Compete on a leaderboard

User roles include:
- Regular users: Can report waste, earn points, and redeem rewards
- Volunteers: Can participate in events and help with waste management
- Staff: Can manage reports, verify submissions, and handle rewards

Provide helpful, accurate, and natural responses to any questions about the system.`;

const askAI = async (req, res) => {
    try {
        console.log('API Key present:', !!process.env.OPENAI_API_KEY);
        console.log('API Key length:', process.env.OPENAI_API_KEY?.length);
        
        const { question } = req.body;
        console.log('Received question:', question);
        
        if (!question) {
            return res.status(400).json({ 
                success: false, 
                message: "Question is required" 
            });
        }

        // Verify API key is set
        if (!process.env.OPENAI_API_KEY) {
            console.log('API key is missing');
            return res.status(500).json({
                success: false,
                message: "OpenAI API key is not configured"
            });
        }

        console.log('Attempting to call OpenAI API...');
        
        // Get response from OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemContext },
                { role: "user", content: question }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        console.log('OpenAI API call successful');
        const answer = completion.choices[0].message.content;

        return res.json({
            success: true,
            answer
        });

    } catch (error) {
        console.error('Detailed error in AI assistant:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Handle specific error cases
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('OpenAI API responded with error:', error.response.data);
            return res.status(error.response.status).json({
                success: false,
                message: `OpenAI API Error: ${error.response.data.error?.message || 'Unknown error'}`
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received from OpenAI API');
            return res.status(503).json({
                success: false,
                message: "Unable to connect to OpenAI API. Please check your internet connection."
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error setting up request:', error.message);
            return res.status(500).json({
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }
};

module.exports = {
    askAI
}; 