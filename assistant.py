import os
import sys
import requests
from dotenv import load_dotenv

# Ensure console output supports UTF-8 (particularly on Windows)
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Load environment variables
load_dotenv(override=True)

print("🤖 My AI Assistant")
print("Ask me anything! Type 'exit' to stop.")

# Check for API key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_FREE_GEMINI_API_KEY":
    print("\n⚠️  Warning: GEMINI_API_KEY is not set or is still the default placeholder in your .env file.")
    print("Please set your Gemini API key in the .env file to talk to the AI.")

while True:
    question = input("\nYou: ")

    if question.lower() == "exit":
        print("AI: Goodbye!")
        break

    if not question.strip():
        continue

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_FREE_GEMINI_API_KEY":
        print("AI: Error: GEMINI_API_KEY not configured. Please add your key to the .env file.")
        continue

    # Call Gemini API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [{"text": question}]
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            res_json = response.json()
            try:
                answer = res_json["candidates"][0]["content"]["parts"][0]["text"]
                print(f"AI: {answer}")
            except (KeyError, IndexError):
                print("AI: Error: Received empty or invalid structure from Gemini API.")
        else:
            print(f"AI: Error from Gemini API ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"AI: Error connecting to Gemini API: {str(e)}")