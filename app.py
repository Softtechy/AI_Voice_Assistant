from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    question = request.json.get("question", "")
    if not question:
        return jsonify({"answer": "Please ask a question."}), 400

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_FREE_GEMINI_API_KEY":
        return jsonify({
            "answer": "Error: GEMINI_API_KEY is not set. Please set your API key in the .env file in the project directory."
        })

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
            except (KeyError, IndexError):
                answer = "Error: Received empty or invalid structure from Gemini API."
        else:
            answer = f"Error from Gemini API ({response.status_code}): {response.text}"
    except Exception as e:
        answer = f"Error connecting to Gemini API: {str(e)}"

    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(debug=True)