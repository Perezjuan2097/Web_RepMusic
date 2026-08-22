# Pulse Music — Supabase Auth

Se agregó un sistema básico de registro e inicio de sesión usando Supabase Auth.

## 1. Configurar Supabase

En Supabase abre:

`Project Settings -> API`

Copia:

- Project URL
- Publishable key (o `anon key` en proyectos que todavía la muestran con ese nombre)

Abre `script.js` y reemplaza:

```js
const SUPABASE_URL = "https://yxkxdoorhagqexjqotpy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gaaezxjzPmXbLZskqBzWLA_AJmcp6zV";
```

No uses una `service_role` key ni una `secret key` en este archivo.

## 2. ¿Dónde se guardan los usuarios?

Este sistema usa **Supabase Authentication**.

Los usuarios creados aparecen en:

`Supabase -> Authentication -> Users`

No hace falta crear manualmente una tabla de contraseñas. Supabase gestiona las contraseñas y las sesiones.

El nombre introducido durante el registro se guarda como metadata del usuario (`full_name`).

## 3. Confirmación por correo

Si Supabase tiene activada la confirmación de correo, después de registrarse el usuario tendrá que confirmar su email antes de iniciar sesión.

Para una prueba local puedes revisar esa configuración en:

`Authentication -> Providers -> Email`

## 4. GitHub Pages

Después de colocar las credenciales:

1. Guarda `index.html`, `style.css` y `script.js`.
2. Haz commit y push a tu repositorio.
3. GitHub Pages publicará los cambios.
4. Abre tu página y pulsa **Iniciar sesión**.

El formulario permite:

- Crear cuenta.
- Iniciar sesión.
- Mantener la sesión al recargar.
- Cerrar sesión.
- Mostrar el nombre del usuario autenticado.

## 5. Seguridad

El frontend utiliza únicamente la clave pública de Supabase. No debes colocar en `script.js` ninguna clave secreta o `service_role`.

