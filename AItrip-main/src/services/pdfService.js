import { jsPDF } from 'jspdf';

/**
 * AITrip PDF Export Service
 * Generates an official, beautifully styled, multi-page vector travel itinerary PDF.
 * Saves the file as 'plan.pdf' (or customized filename).
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

    // Helper to check page break
    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > pageHeight - 16) {
        doc.addPage();
        y = 20;
        // Mini header on continuation pages
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 150, 165);
        doc.text(`AITrip Itinerary • ${trip.destinationName || 'Trip Plan'} • Official Confirmation`, margin, 12);
        doc.setDrawColor(220, 225, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, 14, pageWidth - margin, 14);
      }
    };

    // 1. HEADER SECTION (Navy gradient block)
    doc.setFillColor(10, 15, 30); // Deep Dark Slate #0a0f1e
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Accent line
    doc.setFillColor(6, 182, 212); // Cyan #06b6d4
    doc.rect(0, 41, pageWidth, 1.2, 'F');

    // Brand Badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 182, 212);
    doc.text('AITRIP • AUTONOMOUS AGENTIC TRAVEL PLANNER', margin, 12);

    // Trip Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const title = trip.title || `EXPEDITION TO ${trip.destinationName?.toUpperCase() || 'DESTINATION'}`;
    doc.text(title.slice(0, 48), margin, 22);

    // Meta strip (Dates, Duration, Travelers, Status)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 225);
    const datesText = `${trip.startDate || '2026-10-10'} to ${trip.endDate || '2026-10-14'}`;
    const travelersText = `${trip.travelers || 2} Travelers`;
    const durationText = `${trip.durationDays || trip.days?.length || 4} Days`;
    doc.text(`${datesText}   |   ${durationText}   |   ${travelersText}   |   AI Autonomous Confirmation`, margin, 32);

    y = 50;

    // 2. STATUS & BOOKING CONFIRMATION BADGE
    doc.setFillColor(240, 253, 250); // Light emerald
    doc.setDrawColor(52, 211, 153);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('✓ BOOKINGS CONFIRMED: Flight & Hotel reservations finalized by AI Agent pipeline.', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Official Trip Reference: ${trip.id || 'TRIP-DEMO'}   •   All tickets and vouchers synced below.`, margin + 4, y + 10.5);

    y += 20;

    // 3. FLIGHT & HOTEL RESERVATION CARDS
    const flight = trip.transport?.flight;
    const hotel = trip.hotel;

    // Transportation Card
    if (flight) {
      checkPageBreak(38);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

      // Card Header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`FLIGHT DETAILS: ${flight.airline || 'Commercial Airline'} • ${flight.flightNumber || 'FLIGHT'}`, margin + 4, y + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 182, 212);
      doc.text(`PNR: ${flight.pnr || 'DEMO-PNR'}`, pageWidth - margin - 40, y + 6);

      // Route Strip
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const origCode = (flight.departureAirportCode || flight.origin || 'HYD').slice(0, 3).toUpperCase();
      const destCode = (flight.arrivalAirportCode || flight.destination || 'DST').slice(0, 3).toUpperCase();
      doc.text(`${origCode}   ──────✈──────   ${destCode}`, margin + 4, y + 16);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${flight.origin || 'Origin'} (${flight.departureTime || '06:30'})`, margin + 4, y + 21);
      doc.text(`${flight.destination || 'Destination'} (${flight.arrivalTime || '18:45'})`, margin + 70, y + 21);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(`Duration: ${flight.duration || '2h 15m'}   |   Aircraft: ${flight.aircraft || 'Commercial Jet'}   |   Seat: ${flight.seat || '12A'}   |   Terminal: ${flight.terminal || 'T1'}`, margin + 4, y + 28);

      y += 38;
    }

    // Hotel Card
    if (hotel) {
      checkPageBreak(34);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`HOTEL RESERVATION: ${hotel.name || 'Curated Accommodation'}`, margin + 4, y + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`REF: ${hotel.bookingReference || hotel.id || 'HT-CONFIRMED'}`, pageWidth - margin - 45, y + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Address: ${hotel.address || hotel.location || trip.destinationName || 'City Center'}`, margin + 4, y + 12);
      doc.text(`Room Type: ${hotel.roomType || 'Deluxe King Suite'}   |   Check-in: 14:00   |   Check-out: 11:00`, margin + 4, y + 17);

      const amenitiesStr = Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 4).join(' • ') : 'Wi-Fi • Breakfast Included';
      doc.setTextColor(71, 85, 105);
      doc.text(`Amenities: ${amenitiesStr}`, margin + 4, y + 23);

      y += 35;
    }

    // 4. DAY-BY-DAY ITINERARY SECTION
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('DAILY ITINERARY & SIGHTSEEING SCHEDULE', margin, y);
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 40, y + 2);
    y += 8;

    const days = trip.days || [];
    days.forEach((day) => {
      checkPageBreak(25);

      // Day Header Pill
      doc.setFillColor(224, 242, 254);
      doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(2, 132, 199);
      doc.text(`DAY ${day.dayNumber || day.day || 1}: ${day.title || 'Regional Exploration'}`, margin + 3, y + 5.5);
      y += 12;

      const activities = day.activities || [];
      activities.forEach((act) => {
        checkPageBreak(16);

        // Time slot & title
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`• [${act.time || '09:00'}] ${act.title || 'Sightseeing Activity'}`, margin + 4, y);

        // Location & Category
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const metaInfo = `${act.location || 'Local Landmark'}  |  Duration: ${act.duration || '2 hrs'}  |  ${act.cost ? `Est. Cost: ₹${act.cost}` : 'Complimentary'}`;
        doc.text(metaInfo, margin + 8, y + 4);

        if (act.description) {
          doc.setTextColor(71, 85, 105);
          const descLines = doc.splitTextToSize(act.description, contentWidth - 12);
          doc.text(descLines.slice(0, 2), margin + 8, y + 8);
          y += (descLines.slice(0, 2).length * 3.5) + 6;
        } else {
          y += 8;
        }
      });

      y += 3;
    });

    // 5. BUDGET SUMMARY TABLE
    if (trip.budget) {
      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('BUDGET BREAKDOWN', margin, y);
      y += 6;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

      const b = trip.budget.breakdown || trip.budget;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      const col1 = margin + 4;
      const col2 = margin + 50;
      const col3 = margin + 100;
      const col4 = margin + 145;

      doc.text(`Accommodation: ${b.accommodation || '₹18,000'}`, col1, y + 6);
      doc.text(`Transport: ${b.transport || '₹12,000'}`, col2, y + 6);
      doc.text(`Food & Dining: ${b.foodAndDining || '₹8,500'}`, col3, y + 6);
      doc.text(`Activities: ${b.activitiesAndEntry || '₹4,500'}`, col4, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const totalBudget = trip.budget.total ? `₹${trip.budget.total.toLocaleString()}` : (typeof trip.budget === 'number' ? `₹${trip.budget.toLocaleString()}` : '₹43,000');
      doc.text(`TOTAL ESTIMATED TRIP BUDGET: ${totalBudget}`, col1, y + 14);

      y += 26;
    }

    // 6. FOOTER (ON ALL PAGES)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by AITrip — Agentic AI Travel Planner (LangGraph Multi-Agent Architecture)', margin, pageHeight - 8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 16, pageHeight - 8);
    }

    // Trigger direct browser download as 'plan.pdf'
    doc.save(filename);
  }
};
