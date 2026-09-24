# Deploy en PythonAnywhere - Paso a Paso

## 1. Crear cuenta
- Ve a https://www.pythonanywhere.com
- Crea una cuenta GRATUITA (Beginner)
- Tu URL sera: `tu-usuario.pythonanywhere.com`

## 2. Subir archivos
- En el dashboard, ve a **Files**
- Crea una carpeta: `/home/tu-usuario/registros`
- Sube TODOS estos archivos dentro de esa carpeta:
  - `app.py`
  - `wsgi.py`
  - `requirements.txt`
  - `ejemplo_invitados.csv`
  - Carpeta `templates/` (con todos los .html)
  - Carpeta `static/` (con style.css y scanner.js)
  - `database.db` (si ya tiene datos cargados)

## 3. Instalar dependencias
- Ve a **Consoles** > **Bash console**
- Ejecuta:
```
pip3 install --user flask openpyxl qrcode reportlab Pillow
```

## 4. Configurar la Web App
- Ve a **Web** > **Add a new web app**
- Selecciona **Manual configuration**
- Selecciona **Python 3.10** (o la mas reciente)
- En la configuracion:

### Source code:
```
/home/tu-usuario/registros
```

### WSGI configuration file:
- Click en el link del archivo WSGI
- BORRA todo el contenido y pon:
```python
import sys
import os

project_home = '/home/tu-usuario/registros'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

from app import app as application
```
- Guarda el archivo

### Static files:
| URL | Directory |
|---|---|
| /static/ | /home/tu-usuario/registros/static |

## 5. Recargar
- Click en **Reload** (boton verde grande)
- Abre `tu-usuario.pythonanywhere.com` en el navegador

## 6. Cargar invitados
- Ve a `tu-usuario.pythonanywhere.com/importar`
- Sube el CSV con los 500 nombres

## Listo!
Comparte la URL con los encargados del evento:
- Escanear: `tu-usuario.pythonanywhere.com/escanear`
- Dashboard: `tu-usuario.pythonanywhere.com/dashboard`

## Notas
- La cuenta gratuita permite 1 web app
- NO se duerme (a diferencia de Render)
- Si necesitas reiniciar: ve a Web > Reload
- Los archivos y la BD persisten
- Reemplaza `tu-usuario` por tu nombre de usuario de PythonAnywhere
