# GauravSingh_Problem7

## Setup & Installation

### Backend

cd Backend
npm install
npm run dev

### Frontend
cd Frontend
npm install
npm run dev

### Architecture
[ Client / Frontend ] ->  HTTP / REST / JSON ->[ Backend / Server (Node/Express) ]
       

### Api usage Example
1) POST -> http://localhost:5000/api/extract-text
 input -> {
  "text": "CBC: Hemglobin 10.2 g/dL (Low) WBC 11200 /uL (Hgh)"
}

Output -> {"tests_raw":["Hemoglobin 10.2 g/dL (low)","WBC 11200 /uL (high)"],"confidence":0.95}

 2) POST -> http://localhost:5000/api/normalize-tests
 input ->{
  "tests_raw": [
    "Hemoglobin 10.2 g/dL (low)",
    "WBC 11200 /uL (high)"
  ]
}

Output -> {"tests":[{"name":"Hemoglobin","value":10.2,"unit":"g/dL","status":"low","ref_range":{"low":12,"high":15}},{"name":"WBC","value":11200,"unit":"/uL","status":"high","ref_range":{"low":4000,"high":11000}}],"normalization_confidence":0.84}

3) POST -> http://localhost:5000/api/generate-summary
 input ->{
  "tests": [
    {
      "name": "hemoglobin",
      "value": 10.2,
      "unit": "g/dL",
      "status": "low",
      "ref_range": {"low": 12.0, "high": 15.0}
    },
    {
      "name": "wbc",
      "value": 11200,
      "unit": "/uL", 
      "status": "high",
      "ref_range": {"low": 4000, "high": 11000}
    }
  ]
}

Output -> {"summary":"Low hemoglobin and high white blood cell count.","explanations":["Low Hemoglobin may relate to anemia.","High WBC can occur with infections."]}

4)  POST -> http://localhost:5000/api/process-complete
 input -> {
  "text": "CBC: Hemglobin 10.2 g/dL (Low) WBC 11200 /uL (Hgh)"
}

Output ->{"tests":[{"name":"Hemoglobin","value":10.2,"unit":"g/dL","status":"low","ref_range":{"low":12,"high":15}},{"name":"WBC","value":11200,"unit":"/uL","status":"high","ref_range":{"low":4000,"high":11000}}],"summary":"Low hemoglobin and high white blood cell count.","status":"ok"}
