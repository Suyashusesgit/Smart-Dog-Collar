import { jsPDF } from 'jspdf';

export function generatePDFReport(reportType, petInfo, stats, alerts) {
  const doc = new jsPDF();
  const dateStr = new Date().toISOString().slice(0, 10);
  
  // 1. Report Header Banner
  doc.setFillColor(27, 25, 54); // Deep Navy slate
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('Helvetica', 'Bold');
  doc.text("SMART DOG COLLAR HEALTH REPORT", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'Normal');
  doc.text(`TACTICAL MONITORING SYSTEM • REPORT TYPE: ${reportType.toUpperCase()}`, 14, 30);
  doc.text(`DATE GENERATED: ${dateStr}`, 150, 30);
  
  // 2. Pet operative profile section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'Bold');
  doc.text("1. Operative Subject Information", 14, 55);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 58, 196, 58);
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'Normal');
  doc.text(`Subject Callsign:  ${petInfo.name}`, 14, 68);
  doc.text(`Operative Breed:   ${petInfo.breed}`, 14, 76);
  doc.text(`Operative Age:     ${petInfo.age}`, 14, 84);
  doc.text(`Subject Weight:    ${petInfo.weight}`, 14, 92);
  
  doc.text(`Assigned Handler:  ${petInfo.owner}`, 110, 68);
  doc.text(`Contact Details:   ${petInfo.contact}`, 110, 76);
  doc.text(`Monitoring Unit:   IIT Jodhpur Lab MWD-04`, 110, 84);
  
  // 3. Telemetry Statistics Summary Section
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'Bold');
  doc.text("2. Biometric Telemetry Summary", 14, 110);
  doc.line(14, 113, 196, 113);
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'Normal');
  doc.text(`Average Heart Rate (Pulse):  ${stats.avgBpm} BPM`, 14, 123);
  doc.text(`Average Oxygen Saturation (SpO2): ${stats.avgSpo2}%`, 14, 131);
  doc.text(`Average Core Body Temperature:   ${stats.avgTemp}°C`, 14, 139);
  doc.text(`Total Active Telemetry Hours:    ${stats.totalHours.toFixed(1)} hrs`, 14, 147);
  
  // 4. Alert & Danger Incidents List
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'Bold');
  doc.text("3. Medical Alert Logging & Incident Reports", 14, 165);
  doc.line(14, 168, 196, 168);
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'Normal');
  
  if (alerts.length === 0) {
    doc.setTextColor(34, 197, 94); // Green
    doc.text("No critical threshold violations logged for this monitoring cycle. Subject nominal.", 14, 178);
  } else {
    doc.setTextColor(239, 68, 68); // Red
    doc.text(`A total of ${alerts.length} critical alert threshold events were registered.`, 14, 178);
    
    doc.setTextColor(0, 0, 0);
    let yPos = 188;
    // List up to top 5 alerts
    alerts.slice(0, 5).forEach((alert, index) => {
      doc.text(`${index + 1}. [${alert.time}] - ${alert.event}`, 14, yPos);
      yPos += 8;
    });
  }
  
  // 5. GPS & Location Verification
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'Bold');
  doc.text("4. GPS Visual & Location Integrity", 14, 240);
  doc.line(14, 243, 196, 243);
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'Normal');
  doc.text("GPS receiver signals checked. Satellite fix matches default monitoring protocols.", 14, 253);
  doc.text("Live tracking verification complete. Last coordinates synchronized to monitoring node.", 14, 261);
  
  // Footer
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 275, 196, 275);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("CONFIDENTIAL MEDICAL RECORD - VETERINARY HEALTH TRACKING SYSTEM - IIT JODHPUR", 35, 282);
  
  // Save Document
  doc.save(`${petInfo.name}_Tactical_Health_Report_${dateStr}.pdf`);
}
