import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { SLIDES_DATA } from '../src/lib/presentation/slides-data';

// Create presentation instance
const pptx = new pptxgen();

// Set metadata
pptx.title = 'AI Protector — Master Technology & Architecture Pitch';
pptx.author = 'Lead Engineering Team';
pptx.company = 'AI Protector Security Systems';
pptx.layout = 'LAYOUT_16x9'; // 16:9 widescreen layout

// Color Palette Constants matching Master Prompt Design System
const C = {
  bgMain: '07080D',
  bgCard: '10121E',
  bgElevated: '15182A',
  accentPurple: '8B5CF6',
  accentLavender: 'A78BFA',
  accentIndigo: '6366F1',
  textMain: 'F5F5FA',
  textMuted: '9295AA',
  textDim: '687687',
  emerald: '10B981',
  amber: 'F59E0B',
  rose: 'EF4444',
  border: '2D2845',
};

// Helper to add standard slide header
function addSlideHeader(slide: any, title: string, category: string) {
  // Background
  slide.background = { color: C.bgMain };

  // Top Category Tag
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.45,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C.accentLavender,
    bold: true,
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.75,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    color: C.textMain,
    bold: true,
  });

  // Header Divider Line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.4,
    w: 11.7,
    h: 0.02,
    fill: { color: C.border },
    line: { color: C.border },
  });

  // Footer Tag
  slide.addText('AI PROTECTOR • ENTERPRISE ZERO-TRUST ARCHITECTURE • HTTPS://AI-PROTECTOR.VERCEL.APP', {
    x: 0.8,
    y: 7.1,
    w: 11.5,
    h: 0.25,
    fontSize: 8,
    fontFace: 'Arial',
    color: C.textDim,
  });
}

// Generate the 12 slides from SLIDES_DATA
SLIDES_DATA.forEach((slideData) => {
  const s = pptx.addSlide();
  s.background = { color: C.bgMain };

  // Format rich speaker notes
  const notes = [
    `=== SLIDE ${slideData.id}: ${slideData.title.toUpperCase()} ===`,
    ``,
    `[EXECUTIVE BOTTOM LINE]`,
    slideData.speakerNotes.bottomLine,
    ``,
    `[WORD-FOR-WORD PITCH SCRIPT (30-45 SECONDS)]`,
    slideData.speakerNotes.script,
    ``,
    `[LAYMAN ANALOGY (EASY TO EXPLAIN)]`,
    slideData.speakerNotes.analogy,
    ``,
    `[DEEP TECHNICAL BREAKDOWN]`,
    slideData.speakerNotes.deepTech,
    ``,
    `[ANTICIPATED EVALUATOR Q&A]`,
    `Q: ${slideData.speakerNotes.evaluatorQA.q}`,
    `A: ${slideData.speakerNotes.evaluatorQA.a}`,
  ].join('\n');

  s.addNotes(notes);

  if (slideData.id === 1) {
    // SLIDE 1: Hero Pitch layout
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.2,
      w: 4.2,
      h: 0.4,
      rectRadius: 0.2,
      fill: { color: '1A152E' },
      line: { color: C.accentPurple, width: 1 },
    });
    s.addText('ZERO-TRUST THREAT DEFENSE PLATFORM', {
      x: 0.8,
      y: 1.2,
      w: 4.2,
      h: 0.4,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: C.accentLavender,
      bold: true,
      align: 'center',
    });

    s.addText('AI Protector', {
      x: 0.8,
      y: 1.8,
      w: 11.5,
      h: 1.0,
      fontSize: 44,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(slideData.subtitle, {
      x: 0.8,
      y: 2.8,
      w: 11.0,
      h: 0.8,
      fontSize: 17,
      fontFace: 'Arial',
      color: C.accentLavender,
    });

    s.addText(slideData.summary, {
      x: 0.8,
      y: 3.7,
      w: 11.5,
      h: 1.1,
      fontSize: 12,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 18,
    });

    // 4 Key Capability Pills
    slideData.cards.forEach((p, idx) => {
      const xPos = 0.8 + idx * 2.92;
      s.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 5.1,
        w: 2.75,
        h: 1.7,
        rectRadius: 0.12,
        fill: { color: C.bgCard },
        line: { color: C.border, width: 1 },
      });

      s.addText(p.title, {
        x: xPos + 0.18,
        y: 5.25,
        w: 2.4,
        h: 0.35,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.textMain,
        bold: true,
      });

      s.addText(p.subtitle || '', {
        x: xPos + 0.18,
        y: 5.58,
        w: 2.4,
        h: 0.25,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C.accentLavender,
        bold: true,
      });

      s.addText(p.desc, {
        x: xPos + 0.18,
        y: 5.85,
        w: 2.4,
        h: 0.85,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C.textMuted,
        lineSpacing: 12,
      });
    });
  } else {
    // Standard Slides
    addSlideHeader(s, slideData.title, slideData.category);

    // Optional top metrics bar if present
    let startY = 1.65;
    if (slideData.metrics && slideData.metrics.length > 0) {
      const metricW = 11.7 / slideData.metrics.length;
      slideData.metrics.forEach((m, idx) => {
        const xPos = 0.8 + idx * metricW;
        s.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: 1.6,
          w: metricW - 0.2,
          h: 1.3,
          rectRadius: 0.12,
          fill: { color: C.bgCard },
          line: { color: C.accentPurple, width: 1 },
        });

        s.addText(m.value, {
          x: xPos + 0.1,
          y: 1.75,
          w: metricW - 0.4,
          h: 0.45,
          fontSize: 20,
          fontFace: 'Arial',
          color: C.accentLavender,
          bold: true,
          align: 'center',
        });

        s.addText(m.label, {
          x: xPos + 0.1,
          y: 2.2,
          w: metricW - 0.4,
          h: 0.25,
          fontSize: 9.5,
          fontFace: 'Arial',
          color: C.textMain,
          bold: true,
          align: 'center',
        });

        s.addText(m.sub, {
          x: xPos + 0.1,
          y: 2.45,
          w: metricW - 0.4,
          h: 0.35,
          fontSize: 7.5,
          fontFace: 'Arial',
          color: C.textMuted,
          align: 'center',
        });
      });
      startY = 3.1;
    }

    // Render Cards in responsive grid
    const cards = slideData.cards;
    const count = cards.length;

    if (count === 3) {
      // 3 cards side-by-side
      cards.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: startY,
          w: 3.75,
          h: 6.9 - startY,
          rectRadius: 0.15,
          fill: { color: C.bgCard },
          line: { color: c.color ? c.color.replace('#', '') : C.border, width: 1.2 },
        });

        s.addText((c.icon || '•') + '  ' + (c.badge || '').toUpperCase(), {
          x: xPos + 0.25,
          y: startY + 0.25,
          w: 3.25,
          h: 0.3,
          fontSize: 9.5,
          fontFace: 'Arial',
          color: c.color ? c.color.replace('#', '') : C.accentLavender,
          bold: true,
        });

        s.addText(c.title, {
          x: xPos + 0.25,
          y: startY + 0.6,
          w: 3.25,
          h: 0.65,
          fontSize: 14,
          fontFace: 'Arial',
          color: C.textMain,
          bold: true,
        });

        if (c.subtitle) {
          s.addText(c.subtitle, {
            x: xPos + 0.25,
            y: startY + 1.2,
            w: 3.25,
            h: 0.3,
            fontSize: 9,
            fontFace: 'Arial',
            color: C.accentLavender,
          });
        }

        s.addText(c.desc, {
          x: xPos + 0.25,
          y: startY + 1.55,
          w: 3.25,
          h: 1.6,
          fontSize: 9.5,
          fontFace: 'Arial',
          color: C.textMuted,
          lineSpacing: 14,
        });

        if (c.techDetails && c.techDetails.length > 0) {
          s.addText(c.techDetails.map((td) => `✔  ${td}`).join('\n'), {
            x: xPos + 0.25,
            y: startY + 3.25,
            w: 3.25,
            h: 1.5,
            fontSize: 8.5,
            fontFace: 'Arial',
            color: C.emerald,
            lineSpacing: 13,
          });
        }
      });
    } else if (count === 4 || count === 6) {
      // 2x2 or 2x3 grid
      const cols = count === 6 ? 3 : 2;
      const cardW = count === 6 ? 3.75 : 5.75;
      const cardH = (6.9 - startY - 0.3) / 2;

      cards.forEach((c, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const xPos = 0.8 + col * (cardW + 0.2);
        const yPos = startY + row * (cardH + 0.25);

        s.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: yPos,
          w: cardW,
          h: cardH,
          rectRadius: 0.12,
          fill: { color: C.bgCard },
          line: { color: C.border, width: 1 },
        });

        s.addText((c.icon || '•') + '  ' + (c.badge || '').toUpperCase(), {
          x: xPos + 0.2,
          y: yPos + 0.15,
          w: cardW - 0.4,
          h: 0.25,
          fontSize: 8.5,
          fontFace: 'Arial',
          color: c.color ? c.color.replace('#', '') : C.accentLavender,
          bold: true,
        });

        s.addText(c.title, {
          x: xPos + 0.2,
          y: yPos + 0.42,
          w: cardW - 0.4,
          h: 0.38,
          fontSize: 12,
          fontFace: 'Arial',
          color: C.textMain,
          bold: true,
        });

        s.addText(c.desc, {
          x: xPos + 0.2,
          y: yPos + 0.82,
          w: cardW - 0.4,
          h: cardH - 0.95,
          fontSize: 9,
          fontFace: 'Arial',
          color: C.textMuted,
          lineSpacing: 13,
        });
      });
    } else if (count === 5) {
      // 5 columns (for pipeline lifecycle)
      const colW = 2.25;
      cards.forEach((c, idx) => {
        const xPos = 0.8 + idx * 2.37;
        s.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: startY,
          w: colW,
          h: 6.9 - startY,
          rectRadius: 0.12,
          fill: { color: C.bgCard },
          line: { color: idx === 4 ? C.accentPurple : C.border, width: 1.2 },
        });

        s.addText(c.badge || `STEP ${idx + 1}`, {
          x: xPos + 0.15,
          y: startY + 0.2,
          w: colW - 0.3,
          h: 0.25,
          fontSize: 9,
          fontFace: 'Arial',
          color: C.accentLavender,
          bold: true,
        });

        s.addText(c.title, {
          x: xPos + 0.15,
          y: startY + 0.5,
          w: colW - 0.3,
          h: 0.55,
          fontSize: 12,
          fontFace: 'Arial',
          color: C.textMain,
          bold: true,
        });

        s.addText(c.desc, {
          x: xPos + 0.15,
          y: startY + 1.1,
          w: colW - 0.3,
          h: 2.3,
          fontSize: 8.5,
          fontFace: 'Arial',
          color: C.textMuted,
          lineSpacing: 12,
        });

        if (c.techDetails && c.techDetails.length > 0) {
          s.addText(c.techDetails.map((td) => `• ${td}`).join('\n'), {
            x: xPos + 0.15,
            y: startY + 3.5,
            w: colW - 0.3,
            h: 1.5,
            fontSize: 7.5,
            fontFace: 'Arial',
            color: C.emerald,
            lineSpacing: 11,
          });
        }
      });
    }
  }
});

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write file
const outputPath = path.join(publicDir, 'AI_Protector_Executive_Tech_Deck.pptx');
pptx
  .writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`Successfully generated master executive presentation at: ${fileName}`);
  })
  .catch((err) => {
    console.error('Failed to generate presentation:', err);
    process.exit(1);
  });
