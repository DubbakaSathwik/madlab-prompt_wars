import { Patient, InconsistencyConflict } from '../types/medical';

export class ConflictService {
  /**
   * Scans a patient's records for cross-document inconsistencies dynamically
   */
  static detectConflicts(patient: Patient): InconsistencyConflict[] {
    const conflicts: InconsistencyConflict[] = [];
    if (!patient || !patient.reports) return conflicts;

    // 1. Medication / Allergy Documentation Contradiction
    // Checks if any prescribed active medication matches a documented substance allergy
    patient.allergies.forEach(alg => {
      const algName = alg.substance.toLowerCase();
      const contraMed = patient.medications.find(med => {
        const medName = med.name.toLowerCase();
        return medName.includes(algName) || (algName.includes('penicillin') && medName.includes('amoxicillin')) || (algName.includes('sulfa') && medName.includes('trimethoprim'));
      });

      if (contraMed) {
        conflicts.push({
          id: `cnf-med-alg-${alg.id}`,
          patientId: patient.id,
          conflictType: 'ALLERGY',
          title: `Documented Allergy vs. Active Medication (${contraMed.name})`,
          description: `Patient context records an allergy to ${alg.substance} (${alg.severity || 'Documented'}), but the active medication list includes ${contraMed.name} (${contraMed.dosage}).`,
          valueA: `Allergy: ${alg.substance} (${alg.reaction || 'Hypersensitivity'})`,
          sourceA: 'Patient Medical Profile',
          dateA: alg.dateNoted,
          valueB: `Prescription: ${contraMed.name} ${contraMed.dosage}`,
          sourceB: contraMed.prescribingDoctor ? `Prescribed by ${contraMed.prescribingDoctor}` : 'Active Medication Orders',
          dateB: contraMed.startDate,
          isResolved: false
        });
      }
    });

    // 2. Same test with differing values on same date across multiple reports
    const testMap = new Map<string, { value: number | string; doc: string; testName: string; unit: string }>();
    patient.reports.forEach(rep => {
      rep.tests.forEach(test => {
        const key = `${test.testName.toLowerCase()}_${rep.date}`;
        if (testMap.has(key)) {
          const existing = testMap.get(key)!;
          if (String(existing.value) !== String(test.value)) {
            conflicts.push({
              id: `cnf-test-${test.id}-${existing.value}`,
              patientId: patient.id,
              conflictType: 'TEST_VALUE',
              title: `Conflicting Measurements for ${test.testName} on ${rep.date}`,
              description: `Multiple documents recorded on ${rep.date} report divergent results for ${test.testName} (${existing.value} vs ${test.value}).`,
              valueA: `${existing.value} ${existing.unit}`,
              sourceA: existing.doc,
              dateA: rep.date,
              valueB: `${test.value} ${test.unit}`,
              sourceB: rep.sourceDocument,
              dateB: rep.date,
              isResolved: false
            });
          }
        } else {
          testMap.set(key, { value: test.value, doc: rep.sourceDocument, testName: test.testName, unit: test.unit });
        }
      });
    });

    return conflicts;
  }
}
