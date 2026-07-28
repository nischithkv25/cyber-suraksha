import PDFDocument from 'pdfkit';

/**
 * Generates an official-looking PDF report of the cyber complaint.
 * Resolves to a binary Buffer that can be stored in MongoDB.
 */
export const generateComplaintPDF = (complaint: any, userName: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Styling Tokens
    const primaryColor = '#0f172a'; // Slate 900
    const accentColor = '#0ea5e9'; // Sky 500
    const textColor = '#334155'; // Slate 700
    const labelColor = '#64748b'; // Slate 500
    const integrityColor = '#059669'; // Emerald 600

    // Visual Accent: left-side cyber bar
    doc.rect(0, 0, 15, doc.page.height).fill(accentColor);

    // Title / Nodal Header
    doc.fillColor(primaryColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('CYBER SURAKSHA', 50, 50);

    doc.fontSize(9)
       .fillColor(labelColor)
       .font('Helvetica-Oblique')
       .text('AI-Powered Cybercrime Command Center & Emergency Intervention System', 50, 75);

    // Divider Line
    doc.strokeColor('#cbd5e1')
       .lineWidth(1)
       .moveTo(50, 92)
       .lineTo(550, 92)
       .stroke();

    // Document Title
    doc.moveDown(2);
    doc.fontSize(13)
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text('NATIONAL CYBER CRIME COMPLAINT DOSSIER', 50, 110);

    let y = 140;
    const leftCol = 50;
    const rightCol = 300;

    const drawRow = (label1: string, val1: string, label2?: string, val2?: string) => {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text(label1.toUpperCase(), leftCol, y);
      doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(val1 || 'N/A', leftCol, y + 12);
      
      if (label2 && val2) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text(label2.toUpperCase(), rightCol, y);
        doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(val2 || 'N/A', rightCol, y + 12);
      }
      y += 35;
    };

    // Draw metadata table
    drawRow('Complaint ID', complaint._id ? complaint._id.toString() : 'GEN-PENDING', 'Filing Timestamp', new Date(complaint.createdAt || new Date()).toLocaleString());
    drawRow('Incident Classification', complaint.incidentType, 'Date of Occurrence', new Date(complaint.dateOfIncident).toLocaleDateString());
    drawRow('Platform / Medium', complaint.platform || 'Not Specified', 'Financial Damage (INR)', `INR ${Number(complaint.financialLoss || 0).toLocaleString('en-IN')}`);
    drawRow('Suspect Coordinates', complaint.suspectDetails || 'No direct coordinates registered', 'Complainant Nodal Identity', userName);

    // Blockchain integrity signature block
    if (complaint.blockchainHash) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text('BLOCKCHAIN EVIDENCE INTEGRITY HASH (SHA-256)', leftCol, y);
      doc.fontSize(8.5).font('Courier-Bold').fillColor(integrityColor).text(complaint.blockchainHash, leftCol, y + 12);
      y += 40;
    }

    // Divider Line
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, y)
       .lineTo(550, y)
       .stroke();
    y += 15;

    // Statement of complaint
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('INCIDENT DESCRIPTION AND CITIZEN STATEMENT', leftCol, y);
    y += 20;

    doc.fontSize(9.5)
       .font('Helvetica')
       .fillColor(textColor)
       .text(complaint.description, leftCol, y, { width: 500, align: 'justify', lineGap: 4 });

    // Official Footer Section
    const footerY = doc.page.height - 90;
    doc.strokeColor('#cbd5e1')
       .lineWidth(1)
       .moveTo(50, footerY)
       .lineTo(550, footerY)
       .stroke();

    doc.fontSize(7.5)
       .fillColor(labelColor)
       .font('Helvetica')
       .text('CONFIDENTIALITY NOTICE: This is an official digital record compiled via Cyber Suraksha Command Grid.', 50, footerY + 12);
       
    doc.text('Evidence hashes are immutably signed to ensure security compliance and legal admissibility under the IT Act.', 50, footerY + 24);

    doc.end();
  });
};
