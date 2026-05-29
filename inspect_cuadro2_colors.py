from PIL import Image

def main():
    img_path = "/Users/andresivercaceresrojas/Desktop/cosas fran/tienda cuadros/catalogo_de_cuadros/cuadro2.PNG"
    img = Image.open(img_path)
    width, height = img.size
    img_rgba = img.convert("RGBA")
    pixels = img_rgba.load()

    # Let's check transparency and color in different columns
    # Column 1: x = 200, Column 2: x = 400, Column 3: x = 600, Column 4: x = 800
    # Let's inspect at y = 400
    y = 400
    for x in range(0, width, 50):
        r, g, b, a = pixels[x, y]
        print(f"Pixel at ({x}, {y}): RGB=({r},{g},{b}), Alpha={a}")

if __name__ == "__main__":
    main()
