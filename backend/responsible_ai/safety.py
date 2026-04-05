def evaluate_safety(prediction_result: dict, disease_type: str = "brain_tumor") -> dict:
    """
    Evaluates the safety and reliability of the model prediction.
    Implements a threshold-based rejection system.
    """
    confidence = prediction_result.get("confidence", 0.0)
    
    # Base thresholds
    WARNING_THRESHOLD = 0.70
    
    safety_flag = False
    safety_message = None
    
    if confidence < WARNING_THRESHOLD:
        safety_flag = True
        safety_message = "Requires Human Review - Low Confidence. Please consult professional medical personnel."
        
    # Breast cancer ensemble specific conflict check
    if disease_type == "breast_cancer" and prediction_result.get("has_conflict", False):
        safety_flag = True
        safety_message = "Requires Human Review - Conflicting Insights between Imaging and Clinical Data. Please consult a specialist."

    return {
        "safety_flag": safety_flag,
        "safety_message": safety_message,
        "disclaimer": "This system is an assistive clinical tool and NOT a replacement for professional medical diagnosis. All predictions should be verified by a qualified healthcare professional."
    }
