import { ClinicalReport, Patient, LabResult } from '../types/medical';

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  meta: {
    lastUpdated: string;
    profile: string[];
  };
  type: 'collection';
  entry: Array<{
    fullUrl: string;
    resource: FHIRResource;
  }>;
}

export class FHIRService {
  /**
   * Converts a MedLens ClinicalReport and Patient into an HL7 FHIR R4 Bundle
   * containing Patient, DiagnosticReport, and Observation resources.
   */
  static exportToFHIR(report: ClinicalReport, patient: Patient): FHIRBundle {
    const timestamp = new Date().toISOString();
    const bundleId = `bundle-${report.id}`;
    const patientRef = `Patient/${patient.id}`;
    const reportRef = `DiagnosticReport/${report.id}`;

    // 1. FHIR Patient Resource
    const fhirPatient: FHIRResource = {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        {
          use: 'usual',
          system: 'urn:oid:medlens:patients',
          value: patient.patientId || patient.id
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          text: patient.name
        }
      ],
      gender: patient.sex ? patient.sex.toLowerCase() : 'unknown',
      birthDate: patient.dateOfBirth
    };

    // 2. Observations for each LabResult
    const observationEntries = report.tests.map((test: LabResult, idx: number) => {
      const obsId = `obs-${report.id}-${test.id || idx}`;
      
      let interpretationCode: string | undefined;
      let interpretationDisplay: string | undefined;
      if (test.status === 'HIGH' || test.status === 'CRITICAL_HIGH') {
        interpretationCode = test.status === 'CRITICAL_HIGH' ? 'HH' : 'H';
        interpretationDisplay = test.status === 'CRITICAL_HIGH' ? 'Critical High' : 'High';
      } else if (test.status === 'LOW' || test.status === 'CRITICAL_LOW') {
        interpretationCode = test.status === 'CRITICAL_LOW' ? 'LL' : 'L';
        interpretationDisplay = test.status === 'CRITICAL_LOW' ? 'Critical Low' : 'Low';
      } else if (test.status === 'NORMAL') {
        interpretationCode = 'N';
        interpretationDisplay = 'Normal';
      }

      const observation: FHIRResource = {
        resourceType: 'Observation',
        id: obsId,
        status: test.verification?.status === 'VERIFIED' ? 'final' : 'preliminary',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'Laboratory'
              }
            ]
          }
        ],
        code: {
          text: test.testName,
          coding: test.canonicalCode
            ? [
                {
                  system: 'http://loinc.org',
                  code: test.canonicalCode,
                  display: test.testName
                }
              ]
            : undefined
        },
        subject: {
          reference: patientRef,
          display: patient.name
        },
        effectiveDateTime: test.date || report.date,
        issued: timestamp,
        performer: [
          {
            display: report.facility?.name || 'Clinical Pathology Laboratory'
          }
        ]
      };

      // Quantitative vs Qualitative
      if (test.numericValue !== undefined && !isNaN(test.numericValue)) {
        observation.valueQuantity = {
          value: test.numericValue,
          unit: test.unit || '',
          system: 'http://unitsofmeasure.org'
        };
      } else {
        observation.valueString = String(test.value);
      }

      // Interpretation
      if (interpretationCode) {
        observation.interpretation = [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: interpretationCode,
                display: interpretationDisplay
              }
            ],
            text: interpretationDisplay
          }
        ];
      }

      // Reference Range
      if (test.referenceRange && test.referenceRange.isAvailable) {
        observation.referenceRange = [
          {
            low: test.referenceRange.low !== undefined ? { value: test.referenceRange.low, unit: test.unit } : undefined,
            high: test.referenceRange.high !== undefined ? { value: test.referenceRange.high, unit: test.unit } : undefined,
            text: test.referenceRange.rawText
          }
        ];
      }

      // Provenance extension
      observation.note = [
        {
          text: `Provenance: Extracted from ${test.provenance?.sourceDocument || report.sourceDocument} (Page ${test.provenance?.page || 1}). Confidence: ${test.provenance?.confidence || 95}%.`
        }
      ];

      return {
        fullUrl: `urn:uuid:${obsId}`,
        resource: observation
      };
    });

    // 3. FHIR DiagnosticReport Resource
    const fhirReport: FHIRResource = {
      resourceType: 'DiagnosticReport',
      id: report.id,
      identifier: [
        {
          use: 'official',
          system: 'urn:oid:medlens:reports',
          value: report.id
        }
      ],
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'LAB',
              display: 'Laboratory'
            }
          ]
        }
      ],
      code: {
        text: report.reportName
      },
      subject: {
        reference: patientRef,
        display: patient.name
      },
      effectiveDateTime: report.date,
      issued: timestamp,
      performer: [
        {
          display: report.facility?.name || 'Diagnostic Laboratory'
        }
      ],
      result: observationEntries.map(e => ({
        reference: `Observation/${e.resource.id}`,
        display: e.resource.code?.text
      })),
      conclusion: report.observations?.join('; ') || 'Clinical report structured via MedLens AI.'
    };

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        lastUpdated: timestamp,
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle']
      },
      type: 'collection',
      entry: [
        {
          fullUrl: `urn:uuid:${patient.id}`,
          resource: fhirPatient
        },
        {
          fullUrl: `urn:uuid:${report.id}`,
          resource: fhirReport
        },
        ...observationEntries
      ]
    };
  }

  /**
   * Converts a normalized MedicalJSONRoot object into an HL7 FHIR R4 Bundle
   */
  static exportRootToFHIR(root: any): FHIRBundle {
    const timestamp = new Date().toISOString();
    const patientId = root.patient?.patient_id || 'patient-unknown';
    const patientRef = `Patient/${patientId}`;

    const fhirPatient: FHIRResource = {
      resourceType: 'Patient',
      id: patientId,
      identifier: [
        {
          system: 'urn:oid:medlens:patients',
          value: patientId
        }
      ],
      active: true,
      name: [{ text: root.patient?.name || 'Anonymous Patient' }],
      gender: root.patient?.sex ? String(root.patient.sex).toLowerCase() : 'unknown'
    };

    const entries: Array<{ fullUrl: string; resource: FHIRResource }> = [
      {
        fullUrl: `urn:uuid:${patientId}`,
        resource: fhirPatient
      }
    ];

    if (Array.isArray(root.reports)) {
      root.reports.forEach((rep: any) => {
        const reportId = rep.report_id || `rep-${Date.now()}`;
        const obsRefs: Array<{ reference: string; display: string }> = [];

        if (Array.isArray(rep.tests)) {
          rep.tests.forEach((t: any, idx: number) => {
            const obsId = `obs-${reportId}-${t.test_id || idx}`;
            obsRefs.push({ reference: `Observation/${obsId}`, display: t.name });

            const obs: FHIRResource = {
              resourceType: 'Observation',
              id: obsId,
              status: 'final',
              category: [
                {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                      code: 'laboratory'
                    }
                  ]
                }
              ],
              code: { text: t.name },
              subject: { reference: patientRef, display: root.patient?.name },
              effectiveDateTime: rep.date
            };

            if (t.numeric_value !== null && t.numeric_value !== undefined && !isNaN(t.numeric_value)) {
              obs.valueQuantity = {
                value: t.numeric_value,
                unit: t.unit || '',
                system: 'http://unitsofmeasure.org'
              };
            } else {
              obs.valueString = String(t.value);
            }

            if (t.status) {
              obs.interpretation = [
                {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                      code: t.status === 'HIGH' ? 'H' : t.status === 'LOW' ? 'L' : 'N'
                    }
                  ],
                  text: t.status
                }
              ];
            }

            if (t.reference_range) {
              obs.referenceRange = [{ text: t.reference_range }];
            }

            entries.push({ fullUrl: `urn:uuid:${obsId}`, resource: obs });
          });
        }

        const fhirReport: FHIRResource = {
          resourceType: 'DiagnosticReport',
          id: reportId,
          status: 'final',
          code: { text: rep.report_name || 'Laboratory Diagnostic Report' },
          subject: { reference: patientRef },
          effectiveDateTime: rep.date,
          result: obsRefs
        };

        entries.push({ fullUrl: `urn:uuid:${reportId}`, resource: fhirReport });
      });
    }

    return {
      resourceType: 'Bundle',
      id: `bundle-export-${Date.now()}`,
      meta: {
        lastUpdated: timestamp,
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle']
      },
      type: 'collection',
      entry: entries
    };
  }

  /**
   * Helper to trigger client-side download of the FHIR JSON file
   */
  static downloadFHIR(report: ClinicalReport, patient: Patient): void {
    const fhirBundle = this.exportToFHIR(report, patient);
    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], {
      type: 'application/fhir+json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FHIR_R4_${report.reportName.replace(/\s+/g, '_')}_${report.date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
