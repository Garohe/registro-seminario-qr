# Deploy en PythonAnywhere

## 1. Crear cuenta
- Ve a https://www.pythonanywhere.com
- Crea cuenta GRATUITA (Beginner)
- Tu URL sera: `tu-usuario.pythonanywhere.com`

## 2. Desde la consola Bash (4 comandos)
Ve a **Consoles** > **Bash** y ejecuta:

```bash
cd ~
git clone https://github.com/Garohe/registro-seminario-qr.git registros
cd registros
pip3 install --user flask openpyxl qrcode reportlab Pillow
```

Listo, el codigo ya esta.

## 3. Configurar la Web App
- Ve a **Web** > **Add a new web app**
- Click **Next** > **Manual configuration** > **Python 3.10**

### En la pagina de configuracion:

**Source code:**
```
/home/tu-usuario/registros
```

**WSGI configuration file** (click en el link, borra todo y pon esto):
```python
import sys
import os

project_home = '/home/tu-usuario/registros'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

from app import app as application
```

**Static files** (en la seccion de abajo):
| URL | Directory |
|---|---|
| `/static/` | `/home/tu-usuario/registros/static` |

## 4. Reload
- Click en el boton verde **Reload**
- Abre `tu-usuario.pythonanywhere.com`

## 5. Cargar invitados
- Ve a `tu-usuario.pythonanywhere.com/importar`
- Sube el CSV con los 500 nombres

---

## URLs para compartir el dia del evento

| Que | URL |
|---|---|
| Escanear QR | `tu-usuario.pythonanywhere.com/escanear` |
| Dashboard | `tu-usuario.pythonanywhere.com/dashboard` |
| Exportar Excel | `tu-usuario.pythonanywhere.com/exportar` |

## Si necesitas actualizar el codigo
Desde la consola Bash:
```bash
cd ~/registros
git pull
```
Luego ve a **Web** > **Reload**

## IMPORTANTE
- Reemplaza `tu-usuario` por tu nombre de usuario de PythonAnywhere en TODOS los pasos
- La cuenta gratuita NO se duerme
- Si algo falla, revisa el **Error log** en la seccion Web
