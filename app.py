from PIL import Image
from gtts import gTTS
from pytesseract import image_to_string
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


def image_to_sound(path_to_image):
    """
    Function for converting an  image to sound
    """
    try:
        loaded_image = Image.open(path_to_image)
        decoded_text = image_to_string(loaded_image)
        cleaned_text = " ".join(decoded_text.split("\n")).strip()
        if not cleaned_text:
            raise ValueError("No text found in the image")
        print("Extracted text:", cleaned_text)
        
        output_file = "sound.mp3"
        sound = gTTS(cleaned_text, lang="en")
        sound.save(output_file)
        return output_file
    except Exception as bug:
        print("Error during processing:\n", bug)
        raise bug


if __name__ == "__main__":
    image_to_sound("image.jpg")
    input()