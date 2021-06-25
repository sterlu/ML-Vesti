cyrilic_chars = (u"абвгдђежзијклмнопрстћуфхцчшАБВГДЂЕЖЗИЈКЛМНОПРСТЋУФХЦЧШ",
                 u"abvgdđežzijklmnoprstćufhcčšABVGDĐEŽZIJKLMNOPRSTĆUFHCČŠ")
cyrilic_map = {ord(a): ord(b) for a, b in zip(*cyrilic_chars)}

cyrilic_diaph = (u"љњџЉЊЏ",
                 ["nj", "lj", "dž", "Lj", "Nj", "Dž"])
cyrilic_diaph_map = {ord(a): ord(b) for a, b in zip(*cyrilic_chars)}


def konvertuj_cirilicu(text):
    return text.translate(cyrilic_diaph_map).translate(cyrilic_map)
