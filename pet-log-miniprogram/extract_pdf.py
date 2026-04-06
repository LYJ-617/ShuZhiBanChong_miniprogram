from pdfminer.high_level import extract_text

pdf_path = "功能，1.19.pdf"
text = extract_text(pdf_path)

with open("function_requirements.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("PDF文本提取完成，已保存到function_requirements.txt")