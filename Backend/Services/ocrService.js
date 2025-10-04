const { GoogleGenerativeAI } = require('@google/generative-ai');

class OCRService {
 constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyDux08r9Iefui0rEVYyTROTmQpXIyR2RDc');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash"}); 
}

  async processImage(imageBase64) {
    try {
      
      const prompt = `
      Analyze this medical report image and extract all medical tests with their values, units, and status. 
      Return ONLY a JSON array in this exact format:
      
      [
        {
          "name": "test name",
          "value": numerical_value,
          "unit": "unit", 
          "status": "low/normal/high"
        }
      ]
      
      Important:
      - Fix common medical typos (hemglobin → hemoglobin, hgh → high, etc.)
      - Convert all values to numbers
      - Standardize units (g/dl → g/dL, /ul → /uL, etc.)
      - If status not mentioned, infer from normal ranges
      - Return empty array if no tests found
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const testsData = JSON.parse(jsonMatch[0]);
        
        const tests_raw = testsData.map(test => 
          `${test.name} ${test.value} ${test.unit} (${test.status.toLowerCase()})`
        );

        return {
          tests_raw: tests_raw,
          confidence: 0.95
        };
      } else {
        return await this.processText(text, 0.90);
      }

    } catch (error) {
      const tests_raw = ['Image processing failed. Please try text input.'];
      return {
        tests_raw: tests_raw,
        confidence: 0.50
      };
    }
  }

  async processText(text, inputConfidence = null) {
    try {
      
      const prompt = `
      Extract medical tests from this text and return ONLY a JSON array in this exact format:
      
      [
        {
          "name": "test name", 
          "value": numerical_value,
          "unit": "unit",
          "status": "low/normal/high"
        }
      ]
      
      Medical Report Text:
      "${text}"
      
      Instructions:
      - Fix medical term typos (hemglobin → hemoglobin, hgh → high, lo → low)
      - Convert values to numbers (remove commas)
      - Standardize units
      - Infer status if not provided using common medical ranges
      - Return empty array if no medical tests found
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const testsData = JSON.parse(jsonMatch[0]);
        
        const tests_raw = testsData.map(test => 
          `${test.name} ${test.value} ${test.unit} (${test.status.toLowerCase()})`
        );

        return {
          tests_raw: tests_raw,
          confidence: 0.95
        };
      } else {
        return this.fallbackTextProcessing(text, inputConfidence);
      }

    } catch (error) {
      return this.fallbackTextProcessing(text, inputConfidence);
    }
  }

  fallbackTextProcessing(text, inputConfidence = null) {
    try {
      const tests_raw = this.extractTestsFromText(text);

      return {
        tests_raw: tests_raw,
        confidence: inputConfidence !== null ? inputConfidence : 0.80
      };
    } catch (error) {
      throw new Error(`Text processing failed: ${error.message}`);
    }
  }

  extractTestsFromText(text) {
    const tests = new Set();


    const correctedText = text
      .replace(/hemoglowbin|hemoglowin|hemoglow|hemogloin|hemoglo|hemglobin|hmoglobin|hgb|hg/gi, 'Hemoglobin')
      .replace(/wbc count/gi, 'WBC')
      .replace(/rbc count/gi, 'RBC')
      .replace(/platlet|plt/gi, 'Platelet')
      .replace(/glocuse|blood sugar|sugar/gi, 'Glucose')
      .replace(/hgh/gi, 'High') 
      .replace(/lo/gi, 'Low') 
      .replace(/low/gi, 'Low') 
      .replace(/high/gi, 'High') 
      .replace(/normal/gi, 'Normal')
      .replace(/,/g, ''); 


    const patterns = [
      /(\b[a-zA-Z]+\b)\s+([\d.]+)\s*([a-zA-Z\/%]*)\s*\(?\s*(low|high|normal)?\s*\)?/gi,
      /(\b[a-zA-Z]+\b):?\s*([\d.]+)\s*([a-zA-Z\/%]*)\s*\(?\s*(low|high|normal)?\s*\)?/gi
    ];

    for (const pattern of patterns) {
      const matches = correctedText.matchAll(pattern);

      for (const match of matches) {
        let [, name, value, unit, status] = match;

        if (name && value && !isNaN(parseFloat(value))) {
          const cleanName = this.cleanTestName(name.trim());
          const cleanValue = parseFloat(value);
          const cleanUnit = unit ? unit.trim() : this.inferUnit(cleanName);

          let cleanStatus = status
            ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
            : (() => {
                const s = this.inferStatus(cleanName, cleanValue);
                return s.charAt(0).toUpperCase() + s.slice(1);
              })();

          const testEntry = `${cleanName} ${cleanValue} ${cleanUnit} (${cleanStatus})`;
          tests.add(testEntry);
        }
      }
    }

    const result = Array.from(tests);

    return result.length > 0 ? result : ['No tests detected'];
  }

  cleanTestName(name) {
    const nameMap = {
      'hemoglowbin': 'Hemoglobin', 'hemoglowin': 'Hemoglobin', 'hemoglow': 'Hemoglobin', 'hemogloin': 'Hemoglobin', 'hemoglo': 'Hemoglobin', 'hemglobin': 'Hemoglobin', 'hmoglobin': 'Hemoglobin', 'hgb': 'Hemoglobin', 'hg': 'Hemoglobin', 'wbc': 'WBC', 'white blood cell': 'WBC', 'white blood cells': 'WBC', 'rbc': 'RBC', 'red blood cell': 'RBC', 'red blood cells': 'RBC', 'platlet': 'Platelet', 'platelets': 'Platelet', 'plt': 'Platelet', 'glocuse': 'Glucose', 'blood sugar': 'Glucose', 'sugar': 'Glucose'
    };

    const lowerName = name.toLowerCase().trim();
    if (nameMap[lowerName]) return nameMap[lowerName];

    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  inferUnit(testName) {
    const unitMap = {
      'hemoglobin': 'g/dL',
      'wbc': '/uL',
      'rbc': 'million/uL',
      'platelet': '/uL',
      'glucose': 'mg/dL'
    };

    const lowerName = testName.toLowerCase();
    for (const [test, unit] of Object.entries(unitMap)) {
      if (lowerName.includes(test)) return unit;
    }
    return '';
  }

  inferStatus(testName, value) {
    const rangeMap = {
      'hemoglobin': { low: 12.0, high: 16.0 },
      'wbc': { low: 4000, high: 11000 },
      'rbc': { low: 4.0, high: 5.9 },
      'platelet': { low: 150000, high: 450000 },
      'glucose': { low: 70, high: 100 }
    };

    const lowerName = testName.toLowerCase();
    for (const [test, range] of Object.entries(rangeMap)) {
      if (lowerName.includes(test)) {
        if (value < range.low) return 'Low';
        if (value > range.high) return 'High';
        return 'Normal';
      }
    }

    return 'Normal';
  }
}

module.exports = new OCRService();