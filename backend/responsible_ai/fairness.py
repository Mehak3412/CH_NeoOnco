def assess_fairness(features: dict) -> dict:
    """
    Fairness-aware layer to intercept demographic groupings and 
    determine if there's missing context or potential bias warnings.
    """
    warnings = []
    
    if features:
        # Example: check for age bias
        age = features.get("age", None)
        if age is not None:
            try:
                age_val = float(age)
                if age_val < 30 or age_val > 80:
                    warnings.append(
                        f"Fairness Warning: Patient age ({age_val}) is in an under-represented demographic in the training data. Confidence may be affected."
                    )
            except ValueError:
                pass
                
    return {
        "fairness_checked": True,
        "demographic_warnings": warnings
    }
