import os
import httpx


async def analyze_with_qwen(content: str, input_type: str) -> dict:
    """
    Analyzes content using the Qwen AI model via the DashScope API.

    Args:
        content: The text content (URL, message, or email) to analyze.
        input_type: The type of input ('url', 'message', 'email').

    Returns:
        A dictionary containing 'ai_risk_delta' (int) and 'ai_explanation' (str).
        If the request fails, returns a default response indicating AI unavailability.
    """
    api_key = os.environ.get('QWEN_API_KEY')
    model = os.environ.get('QWEN_MODEL')

    if not api_key or not model:
        # Log a warning or error here if logging is configured
        print("Error: QWEN_API_KEY or QWEN_MODEL environment variables not set.")
        return {"ai_risk_delta": 0, "ai_explanation": "AI unavailable"}

    url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable"  # Consider removing if sync call is preferred
    }

    system_prompt = (
        "You are an expert cybersecurity analyst specializing in phishing and scam detection. "
        "Analyze the provided content for signs of phishing, spam, scams, social engineering, "
        "credential theft, or other malicious intent. Focus on linguistic cues, urgency, "
        "requests for personal information, suspicious links, impersonation, and common "
        "scam patterns. Respond ONLY with a raw JSON object containing exactly two keys: "
        "'ai_risk_delta' as an integer between -20 and 20 (where negative values indicate "
        "likely safe content and positive values indicate increasing risk), and "
        "'ai_explanation' as a short string summarizing the key factors in your assessment. "
        "Do not wrap the JSON in markdown code blocks."
    )

    payload = {
        "model": model,
        "input": {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Content Type: {input_type}\n\nContent:\n{content}"}
            ]
        },
        "parameters": {}
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:  # 30-second timeout
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

            # Attempt to parse the JSON response
            response_data = response.json()

            # The structure of response_data depends on the DashScope API response format.
            # Assuming the core JSON from the AI is in response_data['output']['text']
            # You might need to adjust this path based on the actual API response structure.
            # For now, let's assume the direct response contains the desired JSON string
            # within a standard wrapper like {'output': {'text': '{...json...}'}}
            # Or perhaps the model responds with the raw JSON as the text content.
            # The prompt asks for raw JSON, so DashScope might return it directly or wrapped.
            # Let's parse the likely path.
            # Example assumed structure: {"output": {"text": "{\n  \"ai_risk_delta\": 15,\n  \"ai_explanation\": \"Urgent language and request for credentials detected.\"\n}\n"}}
            raw_text_output = response_data.get('output', {}).get('text', '')
            ai_response_json = raw_text_output.strip()
            
            # If the AI responded with the raw JSON string inside the 'text' field,
            # we need to load it again.
            import json
            parsed_ai_response = json.loads(ai_response_json)
            
            # Validate the structure of the parsed response
            if "ai_risk_delta" in parsed_ai_response and "ai_explanation" in parsed_ai_response:
                # Optionally validate types and value ranges here if needed
                # e.g., isinstance(parsed_ai_response['ai_risk_delta'], int) and -20 <= ... <= 20
                return parsed_ai_response
            else:
                # If the returned JSON doesn't match the expected schema
                print(f"Warning: AI returned unexpected JSON structure: {parsed_ai_response}")
                return {"ai_risk_delta": 0, "ai_explanation": "AI response format invalid"}

    except httpx.TimeoutException:
        print("Error: Request to Qwen API timed out.")
        return {"ai_risk_delta": 0, "ai_explanation": "AI unavailable"}
    except httpx.HTTPStatusError as e:
        print(f"Error: Qwen API request failed with status {e.response.status_code}: {e.response.text}")
        return {"ai_risk_delta": 0, "ai_explanation": "AI unavailable"}
    except httpx.RequestError as e:
        # Catches network errors, DNS issues, etc.
        print(f"Error: An error occurred while requesting from Qwen API: {e}")
        return {"ai_risk_delta": 0, "ai_explanation": "AI unavailable"}
    except (KeyError, TypeError, ValueError) as e:
        # Catches issues with parsing the response JSON or accessing its parts
        print(f"Error: Failed to parse or validate Qwen API response: {e}. Raw response: {response_data}")
        return {"ai_risk_delta": 0, "ai_explanation": "AI unavailable"}
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error during Qwen API call: {e}")
        return {"ai_risk_delta": 0, "ai_explanation": "AI unavailable"}
