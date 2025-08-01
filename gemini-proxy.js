// netlify/functions/gemini-proxy.js

// Ensure you've added "type": "module" to your package.json
// This allows you to use `import` syntax.
import fetch from 'node-fetch';

export async function handler(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Load API key from Netlify Environment Variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in Netlify environment variables!');
        return { statusCode: 500, body: 'Server configuration error: API Key missing.' };
    }

    try {
        const geminiPayload = JSON.parse(event.body); // Parse the request body
        
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geminiPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorData.error?.message || 'Error from Gemini API' })
            };
        }

        const data = await response.json();
        
        // Return Gemini's response to the client
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error processing request.' })
        };
    }
}