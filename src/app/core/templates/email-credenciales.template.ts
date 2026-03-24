export const getCredencialesTemplate = (username: string, contrasena: string): string => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333333; }
        .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e0e0e0; }
        .header { background-color: #ffffff; padding: 25px 20px; text-align: center; border-bottom: 3px solid #087f38; }
        .header h1 { color: #087f38; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .content h2 { color: #333; font-size: 18px; margin-top: 0; }
        .content p { line-height: 1.6; font-size: 15px; margin-bottom: 20px; }
        .credentials-box { background-color: #edf2fb; border: 1px solid #d7e3f4; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: left; }
        .credentials-box p { margin: 8px 0; font-size: 16px; color: #333; }
        .credentials-box span { font-weight: bold; color: #000; }
        .btn-container { text-align: center; margin: 30px 0 10px 0; }
        .btn { background-color: #087f38; color: #ffffff !important; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; }
        .footer { background-color: #212529; color: #ffffff; text-align: center; padding: 15px; font-size: 13px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>UTEQ | SGTE</h1>
        </div>
        <div class="content">
            <h2>Estimado usuario,</h2>
            <p>Su cuenta ha sido creada exitosamente en el <strong>Sistema de Gestión de Trámites Estudiantiles</strong>.</p>

            <p>A continuación, le proporcionamos sus credenciales de acceso seguras:</p>

            <div class="credentials-box">
                <p>Usuario: <span>${username}</span></p>
                <p>Contraseña: <span>${contrasena}</span></p>
            </div>

            <p>Le recomendamos cambiar su contraseña al iniciar sesión por primera vez para garantizar la seguridad de su cuenta.</p>

            <div class="btn-container">
                <a href="http://localhost:4200" class="btn">Ir al inicio de sesión</a>
            </div>

            <p style="margin-top: 30px;">Atentamente,<br><strong>Equipo SGTE UTEQ</strong></p>
        </div>
        <div class="footer">
            Sistema de Gestión de Trámites Estudiantiles<br>
            Universidad Técnica Estatal de Quevedo
        </div>
    </div>
</body>
</html>`;
};
