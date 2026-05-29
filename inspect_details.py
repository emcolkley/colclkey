from PIL import Image

def inspect_file(name, path):
    img = Image.open(path)
    width, height = img.size
    img_rgba = img.convert("RGBA")
    pixels = img_rgba.load()
    
    # 1. Check transparent pixels
    trans = []
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a < 255:
                trans.append((x, y))
                
    # 2. Check grey checkerboard pixels
    grey = []
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            is_grey = (195 <= r <= 215) and (195 <= g <= 215) and (195 <= b <= 215)
            if is_grey and a == 255:
                grey.append((x, y))
                
    print(f"\n=== {name} ===")
    print(f"Dimensiones: {width}x{height}")
    if trans:
        txs = [p[0] for p in trans]
        tys = [p[1] for p in trans]
        print(f"Píxeles transparentes ({len(trans)}): X de {min(txs)} a {max(txs)}, Y de {min(tys)} a {max(tys)}")
    else:
        print("Sin píxeles transparentes.")
        
    if grey:
        gxs = [p[0] for p in grey]
        gys = [p[1] for p in grey]
        print(f"Píxeles grises de tablero ({len(grey)}): X de {min(gxs)} a {max(gxs)}, Y de {min(gys)} a {max(gys)}")
    else:
        print("Sin píxeles grises de tablero.")

inspect_file("cuadro1.PNG", "/Users/andresivercaceresrojas/Desktop/cosas fran/tienda cuadros/catalogo_de_cuadros/cuadro1.PNG")
inspect_file("cuadro2.PNG", "/Users/andresivercaceresrojas/Desktop/cosas fran/tienda cuadros/catalogo_de_cuadros/cuadro2.PNG")
inspect_file("cuadro1_processed.png", "/Users/andresivercaceresrojas/Desktop/cosas fran/tienda cuadros/cuadro1_processed.png")
inspect_file("cuadro2_processed.png", "/Users/andresivercaceresrojas/Desktop/cosas fran/tienda cuadros/cuadro2_processed.png")
