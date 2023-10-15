export function splitTextIntoParagraphs(text: string): string[] {
    const paragraphs: string[] = [];
    const lines = text.split(/\s*(?=\d+\.\s)/);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line) {
            line = lines[i].replace(/^[0-2]\. /, '');
            console.log("---line", line)
            paragraphs.push(line);
        }
    }
    return paragraphs;
}


export function removePrefixFromParagraphs(text: string): string[] {
    // Split the text into paragraphs based on the "X. " pattern.
    const paragraphs = text.split(/\d+\.\s/).filter(Boolean);

    // Join the paragraphs with newlines to reconstruct the text.
    return paragraphs
}

export function cleanText(text: string): string[] {
    const cleanedParagraphs: string[] = [];
    const paragraphs = text.split(/\n(?=\d+\.\s)/);

    for (const paragraph of paragraphs) {
        let cleanedParagraph = paragraph.replace(/^\d+\.\s/, '').trim();
        cleanedParagraph = cleanedParagraph.replace(/\\/g, '')
        cleanedParagraph = cleanedParagraph.replace(/ \\/g, '')
        cleanedParagraph = cleanedParagraph.replace(/\n/g, '')
        cleanedParagraph = cleanedParagraph.replace(/\.\n\n/g, ' ')
        cleanedParagraphs.push(cleanedParagraph);
    }

    return cleanedParagraphs.filter(str => str !== "");
}
