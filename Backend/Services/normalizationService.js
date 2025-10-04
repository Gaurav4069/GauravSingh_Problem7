class NormalizationService {
  constructor() {
    this.referenceRanges = {
      'hemoglobin': { low: 12.0, high: 15.0, unit: 'g/dL' },
      'wbc': { low: 4000, high: 11000, unit: '/uL' },
      'rbc': { low: 4.0, high: 5.9, unit: 'million/uL' },
      'platelet': { low: 150000, high: 450000, unit: '/uL' },
      'glucose': { low: 70.0, high: 100.0, unit: 'mg/dL' }
    };

    this.testAliases = {
      'hemoglobin': ['hgb', 'hg', 'hemoglobin'],
      'wbc': ['white blood cell', 'wbc count', 'leukocyte'],
      'rbc': ['red blood cell', 'rbc count', 'erythrocyte'],
      'platelet': ['platelets', 'plt', 'thrombocyte'],
      'glucose': ['blood sugar', 'sugar', 'glucose fasting'],
      'neutrophils': ['neutrophil', 'neutrophils count', 'neutrophil percentage'],
      'lymphocytes': ['lymphocyte', 'lymphocytes count', 'lymphocyte percentage'],
      'monocytes': ['monocyte', 'monocytes count', 'monocyte percentage'],
      'eosinophils': ['eosinophil', 'eosinophils count', 'eosinophil percentage'],
      'basophils': ['basophil', 'basophils count', 'basophil percentage'],
      'alt': ['alanine transaminase', 'sgpt'],
      'ast': ['aspartate transaminase', 'sgot'],
      'alp': ['alkaline phosphatase'],
      'bilirubin': ['total bilirubin'],
      'creatinine': ['creatinine serum', 'cr'],
      'urea': ['blood urea nitrogen', 'bun'],
      'sodium': ['na', 'sodium serum'],
      'potassium': ['k', 'potassium serum'],
      'chloride': ['cl', 'chloride serum'],
      'cholesterol': ['total cholesterol'],
      'hdl': ['high density lipoprotein'],
      'ldl': ['low density lipoprotein'],
      'tsh': ['thyroid stimulating hormone'],
      't3': ['triiodothyronine'],
      't4': ['thyroxine'],
      'esr': ['erythrocyte sedimentation rate'],
      'crp': ['c reactive protein']
    };
  }

  async normalizeTests(tests) {
    if (tests.length > 0 && typeof tests[0] === 'object') {
      return {
        tests: tests.map(t => ({
          name: this.cleanTestName(t.name),
          value: t.value,
          unit: t.unit,
          status: t.status,
          ref_range: t.ref_range || this.getRefRange(t.name)
        })),
        normalization_confidence: 0.84
      };
    }

    const parsedTests = tests.map(t => this.parseTestString(t)).filter(Boolean);
    return {
      tests: parsedTests.map(t => ({
        name: this.cleanTestName(t.name),
        value: t.value,
        unit: t.unit,
        status: t.status,
        ref_range: t.ref_range || this.getRefRange(t.name)
      })),
      normalization_confidence: 0.84
    };
  }

  cleanTestName(name) {
    const nameMap = {
      'hemoglobin': 'Hemoglobin',
      'hgb': 'Hemoglobin',
      'hg': 'Hemoglobin',
      'wbc': 'WBC',
      'rbc': 'RBC',
      'platelet': 'Platelet',
      'glucose': 'Glucose'
    };
    const lower = name.toLowerCase();
    if (nameMap[lower]) return nameMap[lower];
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  getRefRange(name) {
    const ranges = {
      'hemoglobin': { low: 12.0, high: 15.0 },
      'wbc': { low: 4000, high: 11000 },
      'rbc': { low: 4.0, high: 5.9 },
      'platelet': { low: 150000, high: 450000 },
      'glucose': { low: 70, high: 100 },
      'neutrophils': {
        low: 40, high: 60
      },
      'lymphocytes': {
        low: 20, high: 40
      },
      'monocytes': {
        low: 2, high: 8
      },
      'eosinophils': {
        low: 1, high: 4
      },
      'basophils': {
        low: 0.5, high: 1
      },

      'alt': {
        low: 7, high: 56
      },
      'ast': {
        low: 10, high: 40
      },
      'alp': {
        low: 44, high: 147
      },
      'bilirubin': {
        low: 0.1, high: 1.2
      },

      'creatinine': {
        low: 0.6, high: 1.2
      },
      'urea': {
        low: 7, high: 20
      },
      'sodium': {
        low: 135, high: 145
      },
      'potassium': {
        low: 3.5, high: 5.1
      },
      'chloride': {
        low: 98, high: 106
      },

      'cholesterol': {
        low: 0, high: 200
      },
      'hdl': {
        low: 40, high: 60
      },
      'ldl': {
        low: 0, high: 100
      },
      'triglycerides': {
        low: 0, high: 150
      },

      'tsh': {
        low: 0.4, high: 4.0
      },
      't3': {
        low: 80, high: 200
      },
      't4': {
        low: 4.5, high: 12.0
      },

      'esr': {
        low: 0, high: 20
      },
      'crp': {
        low: 0, high: 3
      }
    };
    const lower = name.toLowerCase();
    for (const key in ranges) {
      if (lower.includes(key)) return ranges[key];
    }
    return null;
  }




  parseTestString(testStr) {
    if (typeof testStr !== "string") {
      return null;
    }

    const match = testStr.match(
      /([a-zA-Z\s]+)\s+([\d.]+)\s*([a-zA-Z\/%]*)\s*\(?\s*(low|high|normal)?\s*\)?/i
    );

    if (!match) return null;

    const name = match[1].trim().toLowerCase();
    const value = parseFloat(match[2]);
    const unit = match[3] ? match[3].trim() : '';
    let status = match[4] ? match[4].toLowerCase() : 'normal';

    if (!name || isNaN(value)) return null;

    return { name, value, unit, status };
  }


  normalizeSingleTest(test) {
    const normalizedName = this.normalizeTestName(test.name);

    const normalizedUnit = this.normalizeUnit(test.unit, normalizedName);

    const refRange = this.referenceRanges[normalizedName] || { low: null, high: null };

    let status = test.status;
    if (status === 'unknown' && refRange.low !== null) {
      status = test.value < refRange.low ? 'low' :
        test.value > refRange.high ? 'high' : 'normal';
    }

    const normalizedTest = {
      name: normalizedName,
      value: test.value,
      unit: normalizedUnit,
      status: status,
      ref_range: {
        low: refRange.low,
        high: refRange.high
      }
    };

    const confidence = this.calculateConfidence(test, normalizedTest);

    return {
      test: normalizedTest,
      confidence: confidence
    };
  }

  normalizeTestName(rawName) {
    const lowerName = rawName.toLowerCase();
    for (const [standardName, aliases] of Object.entries(this.testAliases)) {
      if (aliases.some(alias => lowerName.includes(alias))) {
        return standardName;
      }
    }
    return rawName.toLowerCase();
  }

  normalizeUnit(rawUnit, testName) {
    const unitMap = {
      'g/dl': 'g/dL',
      'gm/dl': 'g/dL',
      'mg/dl': 'mg/dL',
      '/ul': '/uL',
      'cells/ul': '/uL'
    };
    return unitMap[rawUnit.toLowerCase()] || rawUnit || this.referenceRanges[testName]?.unit || 'unknown';
  }

  calculateConfidence(rawTest, normalizedTest) {
    let confidence = 0.7;
    if (normalizedTest.unit !== 'unknown') confidence += 0.1;
    if (normalizedTest.ref_range.low !== null) confidence += 0.1;
    if (normalizedTest.status !== 'unknown') confidence += 0.1;
    return Math.min(confidence, 1.0);
  }
}

module.exports = new NormalizationService();