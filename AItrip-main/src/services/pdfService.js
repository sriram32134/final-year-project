import { jsPDF } from 'jspdf';

/**
 * AITrip PDF Export Service
 * Generates an official, beautifully styled, multi-page vector travel itinerary PDF.
 * Eliminates text overlap through dynamic sequential Y-coordinate tracking and
 * uses pure ASCII characters to prevent font glyph corruption.
 */
export const pdfService = {
  downloadTripPDF(trip, filename = 'plan.pdf') {
    if (!trip) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    // Helper to sanitize text from unsupported Unicode symbols
    const cleanText = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/₹/g, 'INR ')
        .replace(/[✓✔]/g, '[OK]')
        .replace(/[✈]/g, '->')
        .replace(/[•●]/g, '-')
        .replace(/–/g, '-')
        .replace(/—/g, '-');
    };

    // Helper for page break checks
    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 22;
        // Mini running header on continuation pages
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 150, 165);
        const headerDest = cleanText(trip.destinationName || 'Trip Plan');
        doc.text(`AITrip Itinerary  |  ${headerDest}  |  Official Confirmation`, margin, 12);
        doc.setDrawColor(220, 225, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, 14, pageWidth - margin, 14);
      }
    };

    // ==========================================
    // 1. TOP HERO HEADER BLOCK (Navy Banner)
    // ==========================================
    doc.setFillColor(10, 15, 30); // Dark Slate #0a0f1e
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Cyan Accent Strip
    doc.setFillColor(6, 182, 212); // Cyan #06b6d4
    doc.rect(0, 41, pageWidth, 1.2, 'F');

    // Brand Tagline
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 182, 212);
    doc.text('AITRIP  |  AUTONOMOUS AGENTIC TRAVEL PLANNER', margin, 12);

    // Main Trip Title
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const rawTitle = trip.title || `Expedition to ${trip.destinationName || 'Destination'}`;
    const cleanTitle = cleanText(rawTitle).toUpperCase();
    const titleLines = doc.splitTextToSize(cleanTitle, contentWidth - 10);
    doc.text(titleLines[0] || cleanTitle, margin, 22);

    // Sub-header details strip (Dates, Duration, Travelers, Status)
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 225);
    const datesText = `${cleanText(trip.startDate || '2026-10-10')} to ${cleanText(trip.endDate || '2026-10-14')}`;
    const durationText = `${trip.durationDays || trip.days?.length || 4} Days`;
    const travelersText = `${trip.travelers || 2} Travelers`;
    doc.text(`${datesText}   |   ${durationText}   |   ${travelersText}   |   AI Autonomous Confirmation`, margin, 32);

    y = 49;

    // ==========================================
    // 2. BOOKING STATUS CONFIRMATION BADGE
    // ==========================================
    checkPageBreak(20);
    doc.setFillColor(240, 253, 250); // Emerald tint
    doc.setDrawColor(52, 211, 153);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('CONFIRMED: Flight & Hotel reservations finalized by AI Agent pipeline.', margin + 4, y + 5.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Official Trip Reference: ${cleanText(trip.id || 'TRIP-DEMO')}   |   All booking vouchers synchronized below.`, margin + 4, y + 10.5);

    y += 19;

    // ==========================================
    // 3. FLIGHT RESERVATION CARD
    // ==========================================
    const flight = trip.transport?.flight;
    if (flight) {
      checkPageBreak(38);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

      // Airline header (left) with length constraint to prevent overlap
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      let airlineRaw = flight.airline || 'Commercial Airline';
      if (airlineRaw.includes('(')) {
        airlineRaw = airlineRaw.split('(')[0].trim();
      }
      const flightHeader = `FLIGHT: ${cleanText(airlineRaw)}  |  ${cleanText(flight.flightNumber || 'FLIGHT')}`;
      const headerLines = doc.splitTextToSize(flightHeader, contentWidth - 55);
      doc.text(headerLines[0] || flightHeader, margin + 4, y + 6);

      // PNR (right-aligned to guarantee zero collision)
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 182, 212);
      const pnrStr = `PNR: ${cleanText(flight.pnr || 'DEMO-PNR')}`;
      doc.text(pnrStr, pageWidth - margin - 4, y + 6, { align: 'right' });

      // Clean ASCII route corridor
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const origCode = (flight.departureAirportCode || flight.origin || 'HYD').slice(0, 3).toUpperCase();
      const destCode = (flight.arrivalAirportCode || flight.destination || 'DST').slice(0, 3).toUpperCase();
      doc.text(`${origCode}   ------------->   ${destCode}`, margin + 4, y + 15);

      // Origin & Destination timestamps
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${cleanText(flight.origin || 'Origin')} (${flight.departureTime || '06:30'})`, margin + 4, y + 20);
      doc.text(`${cleanText(flight.destination || 'Destination')} (${flight.arrivalTime || '18:45'})`, margin + 65, y + 20);

      // Flight Specs bar
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      const flightMeta = `Duration: ${flight.duration || '2h 15m'}   |   Aircraft: ${cleanText(flight.aircraft || 'Commercial Jet')}   |   Seat: ${flight.seat || '12A'}   |   Terminal: ${flight.terminal || 'T1'}`;
      const metaLines = doc.splitTextToSize(flightMeta, contentWidth - 8);
      doc.text(metaLines[0], margin + 4, y + 27);

      y += 39;
    }

    // ==========================================
    // 4. HOTEL RESERVATION CARD
    // ==========================================
    const hotel = trip.hotel;
    if (hotel) {
      checkPageBreak(34);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 31, 2, 2, 'FD');

      // Hotel Name (left)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      const hotelTitle = `HOTEL: ${cleanText(hotel.name || 'Curated Accommodation')}`;
      const hotelTitleLines = doc.splitTextToSize(hotelTitle, contentWidth - 55);
      doc.text(hotelTitleLines[0] || hotelTitle, margin + 4, y + 6);

      // Hotel Reference (right-aligned)
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      const hotelRefStr = `REF: ${cleanText(hotel.bookingReference || hotel.id || 'HT-CONFIRMED')}`;
      doc.text(hotelRefStr, pageWidth - margin - 4, y + 6, { align: 'right' });

      // Address
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const addressText = `Address: ${cleanText(hotel.address || hotel.location || trip.destinationName || 'City Center')}`;
      const addressLines = doc.splitTextToSize(addressText, contentWidth - 8);
      doc.text(addressLines[0], margin + 4, y + 12);

      // Room & Policies
      doc.text(`Room: ${cleanText(hotel.roomType || 'Deluxe Suite')}   |   Check-in: 14:00   |   Check-out: 11:00`, margin + 4, y + 17);

      // Amenities
      const amenitiesStr = Array.isArray(hotel.amenities)
        ? hotel.amenities.slice(0, 4).map(cleanText).join('  |  ')
        : 'Wi-Fi Included  |  Breakfast Included';
      doc.setTextColor(71, 85, 105);
      const amenLines = doc.splitTextToSize(`Amenities: ${amenitiesStr}`, contentWidth - 8);
      doc.text(amenLines[0], margin + 4, y + 23);

      y += 36;
    }

    // ==========================================
    // 5. DAILY ITINERARY & SIGHTSEEING SCHEDULE
    // ==========================================
    checkPageBreak(18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('DAILY ITINERARY & SIGHTSEEING SCHEDULE', margin, y);
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 45, y + 2);
    y += 8;

    const days = trip.days || [];
    days.forEach((day) => {
      // Day Header Pill
      checkPageBreak(16);
      doc.setFillColor(224, 242, 254);
      doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(2, 132, 199);
      const dayLabel = `DAY ${day.dayNumber || day.day || 1}: ${cleanText(day.title || 'Regional Exploration')}`;
      const dayLines = doc.splitTextToSize(dayLabel, contentWidth - 6);
      doc.text(dayLines[0], margin + 3, y + 4.8);
      y += 10;

      const activities = day.activities || [];
      activities.forEach((act) => {
        // Prepare wrapped lines for activity fields
        const timeStr = cleanText(act.time || '09:00');
        const titleStr = cleanText(act.title || 'Curated Exploration Node');
        const actTitleFull = `[${timeStr}] ${titleStr}`;
        const actTitleLines = doc.splitTextToSize(actTitleFull, contentWidth - 8);

        const locStr = cleanText(act.location || 'Local Landmark');
        const durStr = cleanText(act.duration || '2 hours');
        const costVal = act.cost ? `Est. Cost: INR ${act.cost}` : 'Complimentary';
        const metaFull = `${locStr}   |   Duration: ${durStr}   |   ${costVal}`;
        const metaLines = doc.splitTextToSize(metaFull, contentWidth - 10);

        let descLines = [];
        if (act.description) {
          descLines = doc.splitTextToSize(cleanText(act.description), contentWidth - 10).slice(0, 2);
        }

        // Calculate dynamic height required for this activity
        const actHeight = (actTitleLines.length * 4.2) + (metaLines.length * 3.8) + (descLines.length * 3.6) + 4;
        checkPageBreak(actHeight);

        // 1. Title
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(actTitleLines, margin + 3, y);
        y += actTitleLines.length * 4.2;

        // 2. Metadata (Location | Duration | Cost)
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(metaLines, margin + 6, y);
        y += metaLines.length * 3.8;

        // 3. Description (if available)
        if (descLines.length > 0) {
          doc.setTextColor(71, 85, 105);
          doc.text(descLines, margin + 6, y);
          y += descLines.length * 3.6;
        }

        // 4. Separation buffer before next activity
        y += 3;
      });

      // Separation buffer between days
      y += 2;
    });

    // ==========================================
    // 6. BUDGET SUMMARY TABLE
    // ==========================================
    if (trip.budget) {
      checkPageBreak(28);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('BUDGET BREAKDOWN', margin, y);
      y += 5;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

      const b = trip.budget.breakdown || trip.budget;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      const col1 = margin + 4;
      const col2 = margin + 44;
      const col3 = margin + 88;
      const col4 = margin + 130;

      const cleanVal = (val, def) => cleanText(val || def);
      doc.text(`Stay: ${cleanVal(b.accommodation, 'INR 18,000')}`, col1, y + 5.5);
      doc.text(`Transit: ${cleanVal(b.transport, 'INR 12,000')}`, col2, y + 5.5);
      doc.text(`Dining: ${cleanVal(b.foodAndDining, 'INR 8,500')}`, col3, y + 5.5);
      doc.text(`Activities: ${cleanVal(b.activitiesAndEntry, 'INR 4,500')}`, col4, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      let totalBudgetStr = 'INR 43,000';
      if (trip.budget.total) {
        totalBudgetStr = `INR ${Number(trip.budget.total).toLocaleString()}`;
      } else if (typeof trip.budget === 'number') {
        totalBudgetStr = `INR ${trip.budget.toLocaleString()}`;
      }
      doc.text(`TOTAL ESTIMATED TRIP BUDGET: ${totalBudgetStr}`, col1, y + 13);

      y += 24;
    }

    // ==========================================
    // 7. MULTI-PAGE FOOTER
    // ==========================================
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by AITrip  |  Agentic AI Travel Planner (LangGraph Multi-Agent Architecture)', margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 14, pageHeight - 8);
    }

    // Save and trigger native browser download as 'plan.pdf'
    doc.save(filename);
  }
};
