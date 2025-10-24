# ML folder setup

This folder contains Python ML scripts (`trainModel.py`, `predict.py`) used by the Node server.

Follow these steps to create a clean Python environment and install the required packages so VS Code / Pylance can find them.

1) Create and activate a virtual environment (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If you use Command Prompt:

```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
```

2) Install required packages:

```powershell
pip install -r requirements.txt
```

3) Verify imports in the activated environment:

```powershell
python -c "import numpy, sklearn, joblib; print('OK')"
```

4) In VS Code: select the same Python interpreter

- Press `Ctrl+Shift+P` → `Python: Select Interpreter` → choose the interpreter from `.venv` (path will include `.venv`).
- Reload the window if Pylance still shows errors (`Ctrl+Shift+P` → `Reload Window`).

Optional: if you want to run the ML service as a FastAPI endpoint, uncomment `fastapi` and `uvicorn` in `requirements.txt`, then add a small `app.py` and run:

```powershell
uvicorn app:app --reload --port 8000
```

That will enable a Python-based API at `http://localhost:8000` which the frontend can call directly.

If you want, I can also create a minimal `app.py` FastAPI example and wiring so your React front-end can call the Python predictions directly.
