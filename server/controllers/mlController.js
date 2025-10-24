// server/controllers/mlController.js
const { spawn } = require('child_process');
const path = require('path');

const pythonPath = 'python'; // or 'python3' depending on your system

// Train the ML model
exports.train = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../ml/trainModel.py');
    const pyProcess = spawn(pythonPath, [scriptPath]);

    pyProcess.stdout.on('data', (data) => {
      console.log('Train output:', data.toString());
    });

    pyProcess.stderr.on('data', (err) => {
      console.error('Python error:', err.toString());
    });

    pyProcess.on('close', (code) => {
      if (code === 0) res.status(200).json({ message: 'Model trained successfully' });
      else res.status(500).json({ message: 'Training failed' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error running training script' });
  }
};

// Predict achievement dynamically
exports.predict = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../ml/predict.py');
    const inputData = JSON.stringify(req.body); // Expecting { totalRegistrations, totalAttended, totalFeedback }

    const pyProcess = spawn(pythonPath, [scriptPath]);

    let output = '';
    let errorOutput = '';

    // Send JSON input to Python via stdin
    pyProcess.stdin.write(inputData);
    pyProcess.stdin.end();

    // Collect Python stdout
    pyProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Collect Python stderr
    pyProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const prediction = JSON.parse(output);
          res.json(prediction); // Return JSON directly
        } catch (err) {
          console.error('Failed to parse Python output:', output, err);
          res.status(500).json({ message: 'Prediction parse failed' });
        }
      } else {
        console.error('Python error:', errorOutput);
        res.status(500).json({ message: 'Prediction script failed' });
      }
    });

  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ message: 'Prediction failed' });
  }
};
