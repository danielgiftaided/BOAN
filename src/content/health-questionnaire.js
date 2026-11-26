// Clinical wording transcribed from the supplied 2025 PAR-Q+; source date 01-11-2024.
export const healthQuestionnaire = {
  "title": "PAR-Q+ — The Physical Activity Readiness Questionnaire for Everyone",
  "general": [
    {
      "id": "G1",
      "text": "Has your doctor ever said that you have a heart condition OR high blood pressure?",
      "note": "",
      "detail": {
        "id": "G1-details",
        "text": "Heart condition OR high blood pressure — indicate the condition(s).",
        "type": "multiple",
        "options": [
          "Heart condition",
          "High blood pressure"
        ]
      }
    },
    {
      "id": "G2",
      "text": "Do you feel pain in your chest at rest, during your daily activities of living, OR when you do physical activity?",
      "note": ""
    },
    {
      "id": "G3",
      "text": "Do you lose balance because of dizziness OR have you lost consciousness in the last 12 months?",
      "note": "Please answer NO if your dizziness was associated with over-breathing (including during vigorous exercise)."
    },
    {
      "id": "G4",
      "text": "Have you ever been diagnosed with another chronic medical condition (other than heart disease or high blood pressure)?",
      "note": "",
      "detail": {
        "id": "G4-details",
        "text": "PLEASE LIST CONDITION(S) HERE:",
        "type": "text",
        "options": []
      }
    },
    {
      "id": "G5",
      "text": "Are you currently taking prescribed medications for a chronic medical condition?",
      "note": "",
      "detail": {
        "id": "G5-details",
        "text": "PLEASE LIST CONDITION(S) AND MEDICATIONS HERE:",
        "type": "text",
        "options": []
      }
    },
    {
      "id": "G6",
      "text": "Do you currently have (or have had within the past 12 months) a bone, joint, or soft tissue (muscle, ligament, or tendon) problem that could be made worse by becoming more physically active?",
      "note": "Please answer NO if you had a problem in the past, but it does not limit your current ability to be physically active.",
      "detail": {
        "id": "G6-details",
        "text": "PLEASE LIST CONDITION(S) HERE:",
        "type": "text",
        "options": []
      }
    },
    {
      "id": "G7",
      "text": "Has your doctor ever said that you should only do medically supervised physical activity?",
      "note": ""
    }
  ],
  "conditions": [
    {
      "id": "F1",
      "title": "Arthritis, Osteoporosis, or Back Problems",
      "gate": {
        "id": "F1",
        "text": "Do you have Arthritis, Osteoporosis, or Back Problems?",
        "note": ""
      },
      "questions": [
        {
          "id": "F1a",
          "text": "Do you have difficulty controlling your condition with medications or other physician-prescribed therapies?",
          "note": "(Answer NO if you are not currently taking medications or other treatments)"
        },
        {
          "id": "F1b",
          "text": "Do you have joint problems causing pain, a recent fracture or fracture caused by osteoporosis or cancer, displaced vertebra (e.g., spondylolisthesis), and/or spondylolysis/pars defect (a crack in the bony ring on the back of the spinal column)?",
          "note": ""
        },
        {
          "id": "F1c",
          "text": "Have you had steroid injections or taken steroid tablets regularly for more than 3 months?",
          "note": ""
        }
      ]
    },
    {
      "id": "F2",
      "title": "Cancer",
      "gate": {
        "id": "F2",
        "text": "Do you currently have Cancer of any kind?",
        "note": ""
      },
      "questions": [
        {
          "id": "F2a",
          "text": "Does your cancer diagnosis include any of the following types: lung/bronchogenic, multiple myeloma (cancer of plasma cells), head, and/or neck?",
          "note": ""
        },
        {
          "id": "F2b",
          "text": "Are you currently receiving cancer therapy (such as chemotheraphy or radiotherapy)?",
          "note": ""
        }
      ]
    },
    {
      "id": "F3",
      "title": "Heart or Cardiovascular Condition",
      "gate": {
        "id": "F3",
        "text": "Do you have a Heart or Cardiovascular Condition? This includes Coronary Artery Disease, Heart Failure, Diagnosed Abnormality of Heart Rhythm",
        "note": ""
      },
      "questions": [
        {
          "id": "F3a",
          "text": "Do you have difficulty controlling your condition with medications or other physician-prescribed therapies?",
          "note": "(Answer NO if you are not currently taking medications or other treatments)"
        },
        {
          "id": "F3b",
          "text": "Do you have an irregular heart beat that requires medical management?",
          "note": "(e.g., atrial fibrillation, premature ventricular contraction)"
        },
        {
          "id": "F3c",
          "text": "Do you have chronic heart failure?",
          "note": ""
        },
        {
          "id": "F3d",
          "text": "Do you have diagnosed coronary artery (cardiovascular) disease and have not participated in regular physical activity in the last 2 months?",
          "note": ""
        }
      ]
    },
    {
      "id": "F4",
      "title": "High Blood Pressure",
      "gate": {
        "id": "F4",
        "text": "Do you currently have High Blood Pressure?",
        "note": ""
      },
      "questions": [
        {
          "id": "F4a",
          "text": "Do you have difficulty controlling your condition with medications or other physician-prescribed therapies?",
          "note": "(Answer NO if you are not currently taking medications or other treatments)"
        },
        {
          "id": "F4b",
          "text": "Do you have a resting blood pressure equal to or greater than 160/90 mmHg with or without medication?",
          "note": "(Answer YES if you do not know your resting blood pressure)"
        }
      ]
    },
    {
      "id": "F5",
      "title": "Metabolic Conditions",
      "gate": {
        "id": "F5",
        "text": "Do you have any Metabolic Conditions? This includes Type 1 Diabetes, Type 2 Diabetes, Pre-Diabetes",
        "note": ""
      },
      "questions": [
        {
          "id": "F5a",
          "text": "Do you often have difficulty controlling your blood sugar levels with foods, medications, or other physician-prescribed therapies?",
          "note": ""
        },
        {
          "id": "F5b",
          "text": "Do you often suffer from signs and symptoms of low blood sugar (hypoglycemia) following exercise and/or during activities of daily living? Signs of hypoglycemia may include shakiness, nervousness, unusual irritability, abnormal sweating, dizziness or light-headedness, mental confusion, difficulty speaking, weakness, or sleepiness.",
          "note": ""
        },
        {
          "id": "F5c",
          "text": "Do you have any signs or symptoms of diabetes complications such as heart or vascular disease and/or complications affecting your eyes, kidneys, OR the sensation in your toes and feet?",
          "note": ""
        },
        {
          "id": "F5d",
          "text": "Do you have other metabolic conditions (such as current pregnancy-related diabetes, chronic kidney disease, or liver problems)?",
          "note": ""
        },
        {
          "id": "F5e",
          "text": "Are you planning to engage in what for you is unusually high (or vigorous) intensity exercise in the near future?",
          "note": ""
        }
      ]
    },
    {
      "id": "F6",
      "title": "Mental Health Problems or Learning Difficulties",
      "gate": {
        "id": "F6",
        "text": "Do you have any Mental Health Problems or Learning Difficulties? This includes Alzheimer’s, Dementia, Depression, Anxiety Disorder, Eating Disorder, Psychotic Disorder, Intellectual Disability, Down Syndrome",
        "note": ""
      },
      "questions": [
        {
          "id": "F6a",
          "text": "Do you have difficulty controlling your condition with medications or other physician-prescribed therapies?",
          "note": "(Answer NO if you are not currently taking medications or other treatments)"
        },
        {
          "id": "F6b",
          "text": "Do you have Down Syndrome AND back problems affecting nerves or muscles?",
          "note": ""
        }
      ]
    },
    {
      "id": "F7",
      "title": "Respiratory Disease",
      "gate": {
        "id": "F7",
        "text": "Do you have a Respiratory Disease? This includes Chronic Obstructive Pulmonary Disease, Asthma, Pulmonary High Blood Pressure",
        "note": ""
      },
      "questions": [
        {
          "id": "F7a",
          "text": "Do you have difficulty controlling your condition with medications or other physician-prescribed therapies?",
          "note": "(Answer NO if you are not currently taking medications or other treatments)"
        },
        {
          "id": "F7b",
          "text": "Has your doctor ever said your blood oxygen level is low at rest or during exercise and/or that you require supplemental oxygen therapy?",
          "note": ""
        },
        {
          "id": "F7c",
          "text": "If asthmatic, do you currently have symptoms of chest tightness, wheezing, laboured breathing, consistent cough (more than 2 days/week), or have you used your rescue medication more than twice in the last week?",
          "note": ""
        },
        {
          "id": "F7d",
          "text": "Has your doctor ever said you have high blood pressure in the blood vessels of your lungs?",
          "note": ""
        }
      ]
    },
    {
      "id": "F8",
      "title": "Spinal Cord Injury",
      "gate": {
        "id": "F8",
        "text": "Do you have a Spinal Cord Injury? This includes Tetraplegia and Paraplegia",
        "note": ""
      },
      "questions": [
        {
          "id": "F8a",
          "text": "Do you have difficulty controlling your condition with medications or other physician-prescribed therapies?",
          "note": "(Answer NO if you are not currently taking medications or other treatments)"
        },
        {
          "id": "F8b",
          "text": "Do you commonly exhibit low resting blood pressure significant enough to cause dizziness, light-headedness, and/or fainting?",
          "note": ""
        },
        {
          "id": "F8c",
          "text": "Has your physician indicated that you exhibit sudden bouts of high blood pressure (known as Autonomic Dysreflexia)?",
          "note": ""
        }
      ]
    },
    {
      "id": "F9",
      "title": "Stroke",
      "gate": {
        "id": "F9",
        "text": "Have you had a Stroke? This includes Transient Ischemic Attack (TIA) or Cerebrovascular Event",
        "note": ""
      },
      "questions": [
        {
          "id": "F9a",
          "text": "Do you have difficulty controlling your condition with medications or other physician-prescribed therapies?",
          "note": "(Answer NO if you are not currently taking medications or other treatments)"
        },
        {
          "id": "F9b",
          "text": "Do you have any impairment in walking or mobility?",
          "note": ""
        },
        {
          "id": "F9c",
          "text": "Have you experienced a stroke or impairment in nerves or muscles in the past 6 months?",
          "note": ""
        }
      ]
    },
    {
      "id": "F10",
      "title": "Other Medical Conditions",
      "gate": {
        "id": "F10",
        "text": "Do you have any other medical condition not listed above or do you have two or more medical conditions?",
        "note": ""
      },
      "questions": [
        {
          "id": "F10a",
          "text": "Have you experienced a blackout, fainted, or lost consciousness as a result of a head injury within the last 12 months OR have you had a diagnosed concussion within the last 12 months?",
          "note": ""
        },
        {
          "id": "F10b",
          "text": "Do you have a medical condition that is not listed (such as epilepsy, neurological conditions, kidney problems)?",
          "note": ""
        },
        {
          "id": "F10c",
          "text": "Do you currently live with two or more medical conditions?",
          "note": ""
        }
      ],
      "detail": {
        "id": "F10-details",
        "text": "PLEASE LIST YOUR MEDICAL CONDITION(S) AND ANY RELATED MEDICATIONS HERE:",
        "type": "text",
        "options": []
      }
    }
  ],
  "generalAdvice": [
    "If you answered NO to all of the questions above, you are cleared for physical activity. Please sign the PARTICIPANT DECLARATION. You do not need to complete Pages 2 and 3.",
    "Start becoming much more physically active – start slowly and build up gradually.",
    "Follow Global Physical Activity Guidelines for your age (https://www.who.int/publications/i/item/9789240015128).",
    "You may take part in a health and fitness appraisal.",
    "If you are over the age of 45 yr and NOT accustomed to regular vigorous to maximal effort exercise, consult a qualified exercise professional before engaging in this intensity of exercise.",
    "If you have any further questions, contact a qualified exercise professional.",
    "Delay becoming more active if:",
    "You are currently experiencing a temporary illness, such as a cold or fever. It is best to wait until you feel better.",
    "You are pregnant. In this case, talk with your health care practitioner, physician, qualified exercise professional, and/or complete the ePARmed-X+ at www.eparmedx.com before becoming more physically active.",
    "Your health changes. Answer the questions on Pages 2 and 3 of this document and/or talk to your health care practitioner, physician, or qualified exercise professional before proceeding with any physical activity program."
  ],
  "followupAdviceNo": [
    "If you answered NO to all of the FOLLOW-UP questions (pgs. 2-3) about your medical condition, you are ready to become more physically active - sign the PARTICIPANT DECLARATION below:",
    "It is advised that you consult a qualified exercise professional to help you develop a safe and effective physical activity plan to meet your health needs.",
    "You are encouraged to start slowly and build up gradually - 20 to 60 minutes of low to moderate intensity exercise, 3-5 days per week including aerobic and muscle strengthening exercises.",
    "As you progress, you should aim to accumulate 150 minutes or more of moderate intensity physical activity per week.",
    "If you are over the age of 45 yr and NOT accustomed to regular vigorous to maximal effort exercise, consult a qualified exercise professional before engaging in this intensity of exercise."
  ],
  "followupAdviceYes": [
    "If you answered YES to one or more of the follow-up questions about your medical condition:",
    "You should seek further information before becoming more physically active or engaging in a fitness appraisal. You should complete the specially designed online screening and exercise recommendations program - the ePARmed-X+ at www.eparmedx.com and/or visit a qualified exercise professional to work through the ePARmed-X+ and for further information."
  ],
  "followupDelayAdvice": [
    "Delay becoming more active if:",
    "You are currently experiencing a temporary illness, such as a cold or fever. It is best to wait until you feel better.",
    "You are pregnant. In this case, talk to your health care practitioner, physician, qualified exercise professional, and/or complete the ePARmed-X+ at www.eparmedx.com before becoming more physically active.",
    "Your health changes. Talk to your health care practitioner, physician, or qualified exercise professional before continuing with any physical activity program."
  ],
  "declarations": {
    "general": "I, the undersigned, have read, understood to my full satisfaction and completed this questionnaire. I acknowledge that this physical activity clearance is valid for a maximum of 12 months from the date it is completed and becomes invalid if my condition changes. I also acknowledge that the community/fitness center may retain a copy of this form for its records. In these instances, it will maintain the confidentiality of the same, complying with applicable law.",
    "followup": "I, the undersigned, have read, understood to my full satisfaction and completed this questionnaire. I acknowledge that this physical activity clearance is valid for a maximum of 12 months from the date it is completed and becomes invalid if my condition changes. I also acknowledge that the community/fitness center may retain a copy of this form for records. In these instances, it will maintain the confidentiality of the same, complying with applicable law."
  },
  "guardianNote": "If you are less than the legal age required for consent or require the assent of a care provider, your parent, guardian or care provider must also sign this form.",
  "sourceNotices": [
    "You are encouraged to photocopy the PAR-Q+. You must use the entire questionnaire and NO changes are permitted.",
    "The authors, the PAR-Q+ Collaboration, partner organizations, and their agents assume no liability for persons who undertake physical activity and/or make use of the PAR-Q+ or ePARmed-X+. If in doubt after completing the questionnaire, consult your doctor prior to physical activity."
  ],
  "references": [
    "For more information, please contact www.eparmedx.com. Email: eparmedx@gmail.com",
    "Citation for PAR-Q+",
    "Warburton DER, Jamnik VK, Bredin SSD, and Gledhill N on behalf of the PAR-Q+ Collaboration. The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+) and Electronic Physical Activity Readiness Medical Examination (ePARmed-X+). Health & Fitness Journal of Canada 4(2):3-23, 2011.",
    "The PAR-Q+ was created using the evidence-based AGREE process (1) by the PAR-Q+ Collaboration chaired by Dr. Darren E. R. Warburton with Dr. Norman Gledhill, Dr. Veronica Jamnik, and Dr. Donald C. McKenzie (2). Production of this document has been made possible through financial contributions from the Public Health Agency of Canada and the BC Ministry of Health Services. The views expressed herein do not necessarily represent the views of the Public Health Agency of Canada or the BC Ministry of Health Services.",
    "Key References",
    "1. Jamnik VK, Warburton DER, Makarski J, McKenzie DC, Shephard RJ, Stone J, and Gledhill N. Enhancing the effectiveness of clearance for physical activity participation; background and overall process. APNM 36(S1):S3-S13, 2011.",
    "2. Warburton DER, Gledhill N, Jamnik VK, Bredin SSD, McKenzie DC, Stone J, Charlesworth S, and Shephard RJ. Evidence-based risk assessment and recommendations for physical activity clearance; Consensus Document. APNM 36(S1):S266-S298, 2011.",
    "3. Chisholm DM, Collis ML, Kulak LL, Davenport W, and Gruber N. Physical activity readiness. British Columbia Medical Journal. 1975;17:375-378.",
    "4. Thomas S, Reading J, and Shephard RJ. Revision of the Physical Activity Readiness Questionnaire (PAR-Q). Canadian Journal of Sport Science 1992;17:4 338-345.",
    "Copyright © 2025 PAR-Q+ Collaboration. Source version date: 01-11-2024."
  ],
  "sourceDate": "01-11-2024",
  "intro": "The health benefits of regular physical activity are clear; more people should engage in physical activity every day of the week. Participating in physical activity is very safe for MOST people. This questionnaire will tell you whether it is necessary for you to seek further advice from your doctor OR a qualified exercise professional before becoming more physically active."
};
