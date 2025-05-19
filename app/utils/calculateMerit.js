// No fetching inside this function anymore!
export function calculateMerit(student, weights, programType = "engineering") {
    // console.log("Calculating merit for student:", student);
    // console.log("Using weights:", weights);
    // console.log("Program type:", programType);
    const type = programType.toLowerCase();
  
    // Extract weights for the specific program type
    const programWeights = weights.find((w) => w.program_type === type);
    if (!programWeights) {
      console.error(`No weightages found for program type: ${type}`);
      return null;
    }
  
    const { ssc_weight: sscWeight, inter_weight: interWeight, test_weight: testWeight } = programWeights;
  
    // Marks data from the student object
    const sscMarks = (student.ssc_obtain / student.ssc_total) * 100;
    // console.log("SSC Marks:", sscMarks);
    const interMarks = (student.intermediate_obtain / student.intermediate_total) * 100;
    // console.log("Intermediate Marks:", interMarks);
    const testMarks = (student.etea_obtain / student.etea_total) * 100;
    // console.log("Test Marks:", testMarks);
  
    // Calculate merit score
    const meritScore =
      (sscMarks * sscWeight) / 100 +
      (interMarks * interWeight) / 100 +
      (testMarks * testWeight) / 100;
  
    return parseFloat(meritScore.toFixed(2)); 
  }
  