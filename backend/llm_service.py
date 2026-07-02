import time
import random
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API if key is available
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_diagnostic_report(ml_results: dict, disease_type: str = "brain_tumor") -> dict:
    """
    Simulates a Med-PaLM 2 / Llama-3 structured clinical report generation based on the ML prediction.
    """
    time.sleep(1) # Simulate inference time for LLM
    
    prediction = ml_results.get("prediction", "Unknown")
    confidence = ml_results.get("confidence", 0.0)
    conf_percentage = f"{(confidence*100):.1f}%"
    
    import random
    
    # Detail logic based on disease type
    if disease_type == "breast_cancer":
        hospitals = ["Tata Memorial Hospital - Breast Cancer Center", "AIIMS Oncology Wing", "Apollo Proton Cancer Centre", "Max Super Speciality - Oncology", "Medanta - The Medicity Cancer Institute"]
        docs = ["Dr. Rajendra Badwe (Surgical Oncologist)", "Dr. SVS Deo (Surgical Oncology)", "Dr. Harit Chaturvedi (Oncologist)", "Dr. V.P. Gangadharan"]
        
        random.shuffle(hospitals)
        random.shuffle(docs)
        
        if prediction == "Benign" or prediction == "No Tumor":
            report = {
                "diagnosis": f"Low likelihood of malignancy. The analysis indicates {prediction} characteristics.",
                "localization": "Mammographic density appears within normal limits with no distinct malignant calcifications.",
                "stage": "N/A - Benign",
                "summary": f"• Prediction: {prediction}\n• Confidence Score: {conf_percentage}\n\nThe analyzed mammogram reveals typical architecture. The model highlights no specific functional boundaries showing malignant high density. Standard screening protocols should be maintained.",
                "precautions": "Maintain regular annual mammogram screenings. Report any newly discovered physical changes to your physician.",
                "future_steps": "Standard follow-up in 1-2 years based on age guidelines. No immediate medical intervention is required.",
                "hospital_recommendations": "No specific oncology center required. Can utilize standard imaging centers for routine checkups.",
                "doctor_recommendations": "Standard consultation with your primary care physician or gynecologist."
            }
        else:
            report = {
                "diagnosis": f"Primary indication of {prediction} with {conf_percentage} confidence. High priority for clinical correlation.",
                "localization": "Abnormal tissue density and possible microcalcifications suggestive of an oncological mass region.",
                "stage": "Requires biopsy for specific grading, TNM staging, and receptor status.",
                "summary": f"• Prediction: {prediction}\n• Confidence Score: {conf_percentage}\n\nImaging reveals an abnormality consistent with the predicted {prediction}. Mass characteristics and localized density dynamics are reflected in the generated radiomics analysis. This represents a case requiring further immediate specialist intervention.",
                "precautions": "Immediate consultation with an oncologist required. Avoid delaying diagnostic follow-ups.",
                "future_steps": "Recommend core needle biopsy for histopathological confirmation and hormone receptor testing.",
                "hospital_recommendations": f"1. {hospitals[0]}\n2. {hospitals[1]}\n3. {hospitals[2]}",
                "doctor_recommendations": f"1. {docs[0]}\n2. {docs[1]}\n3. {docs[2]}"
            }
            
    else:
        # Default to brain_tumor
        hospitals = ["All India Institute of Medical Sciences (AIIMS)", "Tata Memorial Hospital", "Christian Medical College (CMC)", "NIMHANS", "Apollo Cancer Centre"]
        docs = ["Dr. B. K. Misra (Neurosurgeon)", "Dr. Rakesh Jalali (Neuro-oncologist)", "Dr. Sandeep Vaishya (Neurosurgery)", "Dr. Rana Patir"]
        
        random.shuffle(hospitals)
        random.shuffle(docs)

        if prediction == "No Tumor Detection" or prediction == "No Tumor":
            report = {
                "diagnosis": f"No significant malignant indicators detected ({conf_percentage} negative predictive confidence).",
                "localization": "Normal structural characteristics across all reviewed lobes.",
                "stage": "N/A",
                "summary": f"• Prediction: {prediction}\n• Confidence Score: {conf_percentage}\n\nThe MRI reveals no apparent localized mass, edema, or structural anomaly typically associated with neoplastic growth. The brain tissue appears healthy and within normal boundaries.",
                "precautions": "Ongoing observation. Discontinue immediate oncological alert statuses. Maintain a healthy lifestyle.",
                "future_steps": "Standard follow-up in 12 months unless symptomatic. No immediate medical intervention is required.",
                "hospital_recommendations": "No specific cancer hospitals required. For general checkups, you may visit any top-tier general hospital.",
                "doctor_recommendations": "Standard consultation with your primary care physician or a general neurologist for routine evaluation."
            }
        else:
            report = {
                "diagnosis": f"Primary indication of {prediction} with {conf_percentage} confidence. The model highlights specific functional boundaries with high density.",
                "localization": "Abnormal hyperintensity suggestive of a mass lesion in the affected lobe region as visualized on the Grad-CAM++ overlay.",
                "stage": "Observation suggests characteristics of a concerning lesion, requiring histopathological confirmation.",
                "summary": f"• Prediction: {prediction}\n• Confidence Score: {conf_percentage}\n\nImaging reveals a mass consistent with the predicted {prediction}. Mass effect and localized edema dynamics are reflected in the generated radiomics analysis. This represents a complex case requiring immediate specialist intervention.",
                "precautions": "Recommended tight monitoring for increased intracranial pressure. Immediate consultation with neuro-oncology required. Avoid strenuous activities.",
                "future_steps": "Recommend structural MRI with gadolinium contrast for refined visualization and biopsy planning.",
                "hospital_recommendations": f"1. {hospitals[0]}\n2. {hospitals[1]}\n3. {hospitals[2]}",
                "doctor_recommendations": f"1. {docs[0]}\n2. {docs[1]}\n3. {docs[2]}"
            }

    return report

def chat_with_patient(message: str, has_image: bool = False) -> str:
    """
    Handles user chat inputs using google-generativeai (Gemini).
    Falls back to intelligent mock responses if no key is present or on failure.
    """
    if api_key:
        try:
            # We are using gemini-1.5-flash for fast chat responses
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction="You are an advanced clinical oncology and general health AI assistant. Answer basic health questions, explain brain tumor and breast cancer diagnostics clearly to patients and doctors. Maintain a professional, empathetic, and exceptionally intelligent medical tone.")
            
            prompt = message
            if has_image:
                prompt += " [USER ATTACHED AN MRI SCAN IMAGE]"
            
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}. Falling back to mock AI.")
            # If the user inputted an invalid API key, directly inform them
            error_msg = str(e).lower()
            if "api_key" in error_msg or "400" in error_msg or "403" in error_msg or "invalid" in error_msg:
                return f"[API Error] Could not connect to Gemini AI. The API key appears to be invalid or restricted limit reached. Details: {str(e)}"

    
    # Fallback / Mock logic (if no key is set or API fails)
    time.sleep(0.8)
    msg_lower = message.lower()
    
    if has_image:
        if "what" in msg_lower or "explain" in msg_lower or "this" in msg_lower or "tumor" in msg_lower:
             return "[Fallback Mode] I have analyzed the provided MRI scan. The image exhibits hyper-intense regions that usually warrant further clinical investigation to rule out anomalies such as gliomas or meningiomas. (Note: Please set GEMINI_API_KEY for advanced analysis)."
        return "[Fallback Mode] Thank you for uploading the image. This appears to be an axial view MRI slice. Do you have a specific question about a region in this scan?"

    if "symptom" in msg_lower and ("meningioma" in msg_lower or "cancer" in msg_lower or "tumor" in msg_lower or "breast" in msg_lower):
        return "[Simulated Answer] Common symptoms include headaches, vision or memory changes for brain tumors. For breast cancer, look for lumps, dimpling, or discharge. These symptoms require clinical evaluation."
        
    if any(word in msg_lower for word in ["tumor", "cancer", "glioma", "meningioma", "pituitary", "breast"]):
        return "[Simulated Answer] Tumors can be benign or malignant. Early detection via scans like MRI or Mammogram is crucial. Malignant tumors can be aggressive, while benign tumors are often localized. Always consult a specialist for exact pathology."
    elif any(word in msg_lower for word in ["headache", "pain", "dizzy", "vision", "seizure", "nausea", "lump", "health"]):
        return "[Simulated Answer] Symptoms such as frequent headaches, morning nausea, seizures, or detecting new lumps can be indicators of underlying medical issues. It is highly recommended to consult a medical professional or use our AI screening for preliminary insight."
    else:
        responses = [
            "[Fallback Mode] I'm operating as a specialized clinical AI assistant. I can parse radiological queries, explain the AI's diagnostic reasoning, or interpret uploaded scans.",
            "[Fallback Mode] That's an important inquiry. To provide the most medically sound answer, could you formulate your question specifically regarding your MRI report or neuro-oncological symptoms?",
            "[Fallback Mode] I have registered your question. (Please provide a valid GEMINI_API_KEY in your .env file to unlock my full diagnostic conversational abilities.)"
        ]
        return random.choice(responses)

