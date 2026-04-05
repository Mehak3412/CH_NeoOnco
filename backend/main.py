from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import shutil

# Ensure sys.path knows about modules inside our structure
import sys
import json
from datetime import datetime
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

HISTORY_FILE = "history_db.json"

def save_to_history(record_type, prediction, confidence, report, files, additional_data=None):
    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)
        except Exception:
            history = []
            
    record = {
        "id": str(datetime.now().timestamp()),
        "timestamp": datetime.now().isoformat(),
        "type": record_type,
        "prediction": prediction,
        "confidence": confidence,
        "report": report,
        "files": files,
        "additional_data": additional_data or {}
    }
    history.insert(0, record) # Insert at beginning
    
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)
    return record


# Brain Tumor Pipeline
import ml_pipeline

# Breast Cancer Pipeline
from modules.breast_cancer.mammogram_pipeline import process_mammogram
from modules.breast_cancer.breast_mri_pipeline import process_mri
from modules.breast_cancer.ensemble_engine import get_combined_prediction

# Responsible AI modules
from responsible_ai.safety import evaluate_safety
from responsible_ai.privacy import anonymize_and_cleanup

from llm_service import generate_diagnostic_report

app = FastAPI(title="Multi-Disease Responsible AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)

app.mount("/static", StaticFiles(directory="results"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/upload")
async def upload_mri(files: List[UploadFile] = File(...)):
    """Brain Tumor MRI Pipeline."""
    files_to_cleanup = []
    try:
        results = []
        for file in files:
            file_path = f"uploads/{file.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            files_to_cleanup.append(file_path)
            
            ml_results = ml_pipeline.process_mri_scan(file_path)
            results.append(ml_results)
            
        if not results:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No files provided."})
            
        aggregated_pred = max(results, key=lambda x: x['confidence'])
        
        safety_data = evaluate_safety(aggregated_pred, disease_type="brain_tumor")
        llm_report = generate_diagnostic_report(aggregated_pred)
        
        # Save to backend history
        saved_record = save_to_history(
            record_type="brain_tumor",
            prediction=aggregated_pred['prediction'],
            confidence=aggregated_pred['confidence'],
            report=llm_report,
            files=files_to_cleanup,
            additional_data={"ml_results": results, "responsible_ai": safety_data}
        )
        
        # Note: We are no longer calling anonymize_and_cleanup here 
        # so that files are retained per user request.
        # anonymize_and_cleanup(files_to_cleanup)
        
        return JSONResponse(content={
            "status": "success",
            "data": {
                "ml_results": results,
                "aggregated_prediction": aggregated_pred['prediction'],
                "aggregated_confidence": aggregated_pred['confidence'],
                "report": llm_report,
                "responsible_ai": safety_data,
                "history_id": saved_record["id"]
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


@app.post("/predict/breast-cancer")
async def predict_breast_cancer(
    mammogram_file: Optional[UploadFile] = File(None)
):
    """Breast Cancer Pipeline (Mammogram Image Data)"""
    files_to_cleanup = []
    try:
        if not mammogram_file:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Please upload a Mammogram image."})

        mammo_result = None
        
        # 1. Process Mammogram
        mammo_path = f"uploads/{mammogram_file.filename}"
        with open(mammo_path, "wb") as buffer:
            shutil.copyfileobj(mammogram_file.file, buffer)
        files_to_cleanup.append(mammo_path)
        mammo_result = process_mammogram(mammo_path)
            
        # 2. Responsible AI: Safety Assessment
        safety_data = evaluate_safety(mammo_result, disease_type="breast_cancer")

        # Generate LLM Report
        llm_report = generate_diagnostic_report(mammo_result, disease_type="breast_cancer")

        # Save to backend history instead of cleanup
        saved_record = save_to_history(
            record_type="breast_cancer",
            prediction=mammo_result["prediction"],
            confidence=mammo_result["confidence"],
            report=llm_report,
            files=files_to_cleanup,
            additional_data={"mammogram": mammo_result, "responsible_ai": safety_data}
        )

        return JSONResponse(content={
            "status": "success",
            "data": {
                "combined_prediction": mammo_result["prediction"],
                "confidence": mammo_result["confidence"],
                "mammogram_analysis": mammo_result,
                "report": llm_report,
                "responsible_ai": {
                    "safety": safety_data
                },
                "history_id": saved_record["id"]
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

class ChatRequest(BaseModel):
    message: str
    hasImage: bool = False

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        from llm_service import chat_with_patient
        response = chat_with_patient(req.message, req.hasImage)
        return {"status": "success", "reply": response}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/history")
async def get_history():
    """Retrieve saved scans and history."""
    try:
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)
            return JSONResponse(content={"status": "success", "data": history})
        return JSONResponse(content={"status": "success", "data": []})
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
