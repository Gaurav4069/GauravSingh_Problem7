const OCRService = require('../Services/ocrService.js');
const NormalizationService = require('../Services/normalizationService.js');
const ExplanationService = require('../Services/explanationService.js');

class MedicalController {
  
  async extractText(req, res) {
    try {
      const { text, image } = req.body;
      
      let result;
      if (image) {
        result = await OCRService.processImage(image);
      } else if (text) {
        result = await OCRService.processText(text);
      } else {
        return res.status(400).json({ error: 'Either text or image required' });
      }

      res.json({
        tests_raw: result.tests_raw,
        confidence: result.confidence
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async normalizeTests(req, res) {
    try {
      const { tests_raw } = req.body;
      
      if (!tests_raw || !Array.isArray(tests_raw)) {
        return res.status(400).json({ error: 'tests_raw array is required' });
      }

      const result = await NormalizationService.normalizeTests(tests_raw);
      
      res.json({
        tests: result.tests,
        normalization_confidence: result.normalization_confidence
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateSummary(req, res) {
    try {
      const { tests } = req.body;
      
      if (!tests || !Array.isArray(tests)) {
        return res.status(400).json({ error: 'tests array is required' });
      }

      const result = ExplanationService.generatePatientFriendlyOutput(tests, { tests });
      
      if (result.status === 'unprocessed') {
        return res.json(result);
      }

      res.json({
        summary: result.summary,
        explanations: result.explanations
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async processComplete(req, res) {
    try {
      const { text, image } = req.body;

      let extractionResult;
      if (image) {
        extractionResult = await OCRService.processImage(image);
      } else if (text) {
        extractionResult = await OCRService.processText(text);
      } else {
        return res.status(400).json({ error: 'Either text or image required' });
      }

const rawTestObjects = extractionResult.tests_raw.map(test => {
  if (typeof test === 'string') {
    const match = test.match(
      /([a-zA-Z\s]+)\s+([\d.]+)\s*([a-zA-Z\/%]*)\s*\(?\s*(low|high|normal)?\s*\)?/i
    );
    if (!match) return null;
    return {
      name: match[1].trim().toLowerCase(),
      value: parseFloat(match[2]),
      unit: match[3] ? match[3].trim() : '',
      status: match[4] ? match[4].toLowerCase() : 'normal'
    };
  } else if (typeof test === 'object' && test.name && test.value !== undefined) {
    return {
      name: test.name.toLowerCase(),
      value: test.value,
      unit: test.unit || '',
      status: test.status || 'normal'
    };
  }
  return null;
}).filter(Boolean);


      const uniqueTestsMap = new Map();
      rawTestObjects.forEach(t => {
        const key = `${t.name}-${t.value}-${t.unit}`;
        if (!uniqueTestsMap.has(key)) {
          uniqueTestsMap.set(key, t);
        }
      });
      const uniqueTestObjects = Array.from(uniqueTestsMap.values());


      const normalizedResult = await NormalizationService.normalizeTests(uniqueTestObjects);

      const summaryResult = ExplanationService.generatePatientFriendlyOutput(
        uniqueTestObjects,
        normalizedResult
      );

      if (summaryResult.status === 'unprocessed') {
        return res.json(summaryResult);
      }
      res.json({
        tests: normalizedResult.tests,
        summary: summaryResult.summary,
       status: "ok"
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MedicalController();