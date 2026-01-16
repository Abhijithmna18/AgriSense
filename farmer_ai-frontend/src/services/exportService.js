/**
 * Export Service
 * Handles PDF and JSON export generation
 * Programmatic generation - no screenshots
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate PDF report for a zone
 * @param {Object} zone - Zone data
 * @param {Object} allData - All zone-related data (responsibilities, lifecycle, diary, harvest)
 * @returns {void} Downloads PDF file
 */
export const generatePDF = (zone, allData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Helper to add new page if needed
    const checkPageBreak = (neededSpace = 20) => {
        if (yPosition + neededSpace > 280) {
            doc.addPage();
            yPosition = 20;
            return true;
        }
        return false;
    };

    // ===== TITLE PAGE =====
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Farm Management Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // ===== ZONE DETAILS =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Zone Information', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const zoneInfo = [
        ['Zone Name', zone.name],
        ['Crop', zone.crop_name || 'N/A'],
        ['Area', `${zone.area_acres} acres`],
        ['Type', zone.type],
        ['Status', zone.status]
    ];

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: zoneInfo,
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 'auto' }
        }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
    checkPageBreak();

    // ===== CROP LIFECYCLE =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Crop Lifecycle Timeline', 14, yPosition);
    yPosition += 10;

    if (allData.lifecycle && allData.lifecycle.length > 0) {
        const lifecycleData = allData.lifecycle.map(stage => [
            stage.stage,
            stage.date ? new Date(stage.date).toLocaleDateString() : 'Not started',
            stage.isActive ? '✓ Active' : '',
            stage.notes || 'No notes'
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Stage', 'Date', 'Status', 'Notes']],
            body: lifecycleData,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [46, 125, 50] }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.text('No lifecycle data available', 14, yPosition);
        yPosition += 15;
    }

    checkPageBreak();

    // ===== RESPONSIBILITIES =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Responsibilities & Tasks', 14, yPosition);
    yPosition += 10;

    if (allData.responsibilities && allData.responsibilities.length > 0) {
        const responsibilitiesData = allData.responsibilities.map(task => [
            task.taskName,
            task.assignedTo,
            new Date(task.dueDate).toLocaleDateString(),
            task.status === 'completed' ? '✓ Done' : 'Pending'
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Task', 'Assigned To', 'Due Date', 'Status']],
            body: responsibilitiesData,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [46, 125, 50] }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.text('No responsibilities logged', 14, yPosition);
        yPosition += 15;
    }

    checkPageBreak();

    // ===== DIARY ENTRIES =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Field Diary (Last 10 Entries)', 14, yPosition);
    yPosition += 10;

    if (allData.diary && allData.diary.length > 0) {
        const diaryData = allData.diary.slice(0, 10).map(entry => [
            new Date(entry.date).toLocaleDateString(),
            entry.type.toUpperCase(),
            entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : ''),
            entry.imageUrl ? 'Yes' : 'No'
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Date', 'Type', 'Content', 'Image']],
            body: diaryData,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [46, 125, 50] },
            columnStyles: {
                2: { cellWidth: 100 }
            }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.text('No diary entries', 14, yPosition);
        yPosition += 15;
    }

    checkPageBreak();

    // ===== HARVEST SUMMARY =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Harvest Summary', 14, yPosition);
    yPosition += 10;

    if (allData.harvest && allData.harvest.length > 0) {
        const harvestData = allData.harvest.map(log => [
            new Date(log.harvestDate).toLocaleDateString(),
            `${log.expectedYield} kg`,
            `${log.actualYield} kg`,
            `${log.deviation > 0 ? '+' : ''}${log.deviation}%`,
            log.qualityGrade || 'N/A'
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Date', 'Expected', 'Actual', 'Deviation', 'Quality']],
            body: harvestData,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [46, 125, 50] }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.text('No harvest data logged', 14, yPosition);
        yPosition += 15;
    }

    checkPageBreak(30);

    // ===== AI ADVISORIES =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('AI Recommendations (Advisory Only)', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Note: AI recommendations are advisory only and should be verified by agricultural experts.', 14, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;

    // Add AI advisories from lifecycle stages
    if (allData.lifecycle && allData.lifecycle.length > 0) {
        const aiAdvisories = allData.lifecycle
            .filter(stage => stage.aiAdvisory)
            .map(stage => [
                stage.stage,
                stage.aiAdvisory
            ]);

        if (aiAdvisories.length > 0) {
            autoTable(doc, {
                startY: yPosition,
                head: [['Stage', 'AI Advisory']],
                body: aiAdvisories,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [76, 175, 80] },
                columnStyles: {
                    1: { cellWidth: 120 }
                }
            });
            yPosition = doc.lastAutoTable.finalY + 10;
        } else {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text('No AI advisories generated yet', 14, yPosition);
        }
    }

    // ===== FOOTER =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} | AgriSense Farm Management System`,
            pageWidth / 2,
            290,
            { align: 'center' }
        );
    }

    // Save the PDF
    const filename = `${zone.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
};

/**
 * Generate JSON export for a zone
 * @param {Object} zone - Zone data
 * @param {Object} allData - All zone-related data
 * @returns {void} Downloads JSON file
 */
export const generateJSON = (zone, allData) => {
    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0',
            source: 'AgriSense Farm Management System'
        },
        zone: {
            id: zone._id,
            name: zone.name,
            crop: zone.crop_name,
            area_acres: zone.area_acres,
            type: zone.type,
            status: zone.status,
            sensors: zone.current_sensors
        },
        responsibilities: allData.responsibilities || [],
        lifecycle: allData.lifecycle || [],
        diary: allData.diary || [],
        harvest: allData.harvest || []
    };

    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zone.name.replace(/\s+/g, '_')}_Data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default {
    generatePDF,
    generateJSON
};
