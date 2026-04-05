def get_combined_prediction(mammo_result: dict = None, mri_result: dict = None) -> dict:
    """
    Ensembles the Mammogram and Breast MRI predictions.
    Handles cases where either one or both modalities are provided.
    """
    probs = []
    
    if mammo_result:
        pred = mammo_result.get("prediction")
        conf = mammo_result.get("confidence", 0)
        probs.append({"type": "Mammogram", "pred": pred, "conf": conf, "prob": conf if pred == "Malignant" else (1.0 - conf)})
        
    if mri_result:
        pred = mri_result.get("prediction")
        conf = mri_result.get("confidence", 0)
        probs.append({"type": "MRI", "pred": pred, "conf": conf, "prob": conf if pred == "Malignant" else (1.0 - conf)})

    if not probs:
        return {"prediction": "Unknown", "confidence": 0.0, "has_conflict": False}

    if len(probs) == 1:
        # Only one modality provided
        single_modality = probs[0]
        return {
            "prediction": single_modality["pred"],
            "confidence": single_modality["conf"],
            "has_conflict": False,
            "mammogram_contribution_probability": single_modality["prob"] if single_modality["type"] == "Mammogram" else None,
            "mri_contribution_probability": single_modality["prob"] if single_modality["type"] == "MRI" else None
        }

    # Both provided
    mammo_prob = probs[0]["prob"]
    mri_prob = probs[1]["prob"]
    
    # Average 
    combined_prob_malignant = (mammo_prob + mri_prob) / 2.0

    final_prediction = "Malignant" if combined_prob_malignant >= 0.5 else "Benign"
    final_confidence = combined_prob_malignant if final_prediction == "Malignant" else (1.0 - combined_prob_malignant)

    # Detect conflicts (e.g. Mammo says malignant > 70%, MRI says benign & < 30% prob malignant)
    has_conflict = False
    if abs(mammo_prob - mri_prob) > 0.4:  # If probabilities diverge by more than 40%
        if probs[0]["conf"] > 0.7 and probs[1]["conf"] > 0.7:
            has_conflict = True

    return {
        "prediction": final_prediction,
        "confidence": round(final_confidence, 4),
        "has_conflict": has_conflict,
        "mammogram_contribution_probability": round(mammo_prob, 4),
        "mri_contribution_probability": round(mri_prob, 4)
    }
