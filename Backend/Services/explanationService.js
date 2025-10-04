class ExplanationService {
  constructor() {
    this.explanations = {
      'hemoglobin': {
        low: "Low hemoglobin may relate to anemia.",
        high: "High hemoglobin can occur in lung disease or dehydration.",
        normal: "Hemoglobin level is normal."
      },
      'wbc': {
        low: "Low white blood cell count may increase infection risk.",
        high: "High white blood cell count can occur with infections.",
        normal: "White blood cell count is normal."
      },
      'rbc': {
        low: "Low red blood cell count may suggest anemia.",
        high: "High red blood cell count may be seen in dehydration.",
        normal: "Red blood cell count is normal."
      },
      'platelet': {
        low: "Low platelet count may affect blood clotting.",
        high: "High platelet count may increase clotting risk.", 
        normal: "Platelet count is normal."
      },
      'glucose': {
        low: "Low blood sugar may cause dizziness.",
        high: "High blood sugar may relate to diabetes.",
        normal: "Blood sugar level is normal."
      }
    };
  }

  generatePatientFriendlyOutput(originalTests, normalizedResult) {
    const tests = normalizedResult.tests;
    
    const hallucinationCheck = this.checkHallucinations(originalTests, tests);
    if (hallucinationCheck) return hallucinationCheck;

    const summary = this.generateSummary(tests);
    const explanations = this.generateExplanations(tests);

    return {
      summary: summary,
      explanations: explanations,
      status:"ok"
    };
  }

generateSummary(tests) {
  const abnormal = tests.filter(t => t.status === 'low' || t.status === 'high');
  if (abnormal.length === 0) return "All test results are normal.";

  const descriptions = abnormal.map(t => {
    const displayName = this.getFullTestName(t.name); 
    return `${t.status.toLowerCase()} ${displayName}`;
  });

  let summaryText;
  if (descriptions.length === 1) summaryText = descriptions[0] + '.';
  else if (descriptions.length === 2) summaryText = descriptions[0] + ' and ' + descriptions[1] + '.';
  else summaryText = descriptions.slice(0, -1).join(', ') + ', and ' + descriptions[descriptions.length - 1] + '.';

  return summaryText.charAt(0).toUpperCase() + summaryText.slice(1);
}


getFullTestName(shortName) {
  const map = {
    'hemoglobin': 'hemoglobin',
    'wbc': 'white blood cell count',
    'rbc': 'red blood cell count',
    'platelet': 'platelet count',
    'glucose': 'blood sugar'
  };
  return map[shortName.toLowerCase()] || shortName;
}



generateExplanations(tests) {
  const shortNameMap = {
    'hemoglobin': 'Hemoglobin',
    'wbc': 'WBC',
    'rbc': 'RBC',
    'platelet': 'Platelet',
    'glucose': 'Glucose'
  };

  return tests.map(test => {
    const template = this.explanations[test.name.toLowerCase()];
    const shortName = shortNameMap[test.name.toLowerCase()] || test.name;
    if (template && template[test.status]) {
      return template[test.status].replace(
        new RegExp(this.getFullTestName(test.name), 'i'),
        shortName
      );
    } else {
      const statusCapitalized = test.status.charAt(0).toUpperCase() + test.status.slice(1);
      return `${statusCapitalized} ${shortName}.`;
    }
  });
}




  checkHallucinations(originalTests, normalizedTests) {
    const originalNames = originalTests.map(t => t.name.toLowerCase());
    const hallucinated = normalizedTests.filter(nt => 
      !originalNames.some(on => nt.name.toLowerCase().includes(on) || on.includes(nt.name.toLowerCase()))
    );

    if (hallucinated.length > 0) {
      return {
        status: "unprocessed",
        reason: "hallucinated tests not present in input"
      };
    }
    return null;
  }
}

module.exports = new ExplanationService();