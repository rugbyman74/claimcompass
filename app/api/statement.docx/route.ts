import { NextResponse } from "next/server";
import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer } from "docx";

export const runtime = "nodejs";

type Body = {
  title?: string;
  filename?: string;
  content: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body?.content || typeof body.content !== "string") {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const title = body.title ?? "STATEMENT IN SUPPORT OF CLAIM";
  const filename = body.filename ?? "ClaimCompass-Statement.docx";

  // Split content into paragraphs
  const lines = body.content.split("\n");
  
  const docParagraphs: Paragraph[] = [];

  // Add title
  docParagraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Add content paragraphs
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === "") {
      // Empty line for spacing
      docParagraphs.push(new Paragraph({ text: "" }));
    } else if (trimmed.startsWith("Condition:") || trimmed.startsWith("Name:") || trimmed.startsWith("Claim type")) {
      // Bold headings
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
    } else {
      // Regular text
      docParagraphs.push(
        new Paragraph({
          text: trimmed,
          spacing: { after: 100 },
        })
      );
    }
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
