from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from typing import List, Union, Dict, Any
import os
import uuid
import yaml

from controller import plan as planController
from models import plan as planModel

app = FastAPI()

@app.post("/plan")
async def generatePlan(payload: planModel.Plan):
    return planController.generatePlan(payload)