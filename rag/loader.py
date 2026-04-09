from PyPDF2 import PdfReader
 
def load_documents(path="policy_docs.pdf"):
    text = ""
 
    try:
        reader = PdfReader(path, strict=False)   # 🔥 important fix
 
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
 
        if len(text.strip()) == 0:
            return "No readable content found in PDF."
 
        return text
 
    except Exception as e:
        print("PDF ERROR:", e)
        return "Error reading PDF. Please check file."
