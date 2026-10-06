import { jwtDecode } from "jwt-decode";

export function saveRefreshToken(refreshToken: string){
    try {
        if (!refreshToken) {
            console.warn("No hay refresh token para guardar");
            return;
        }

        // Decodificar el JWT para obtener el payload
        const decoded = jwtDecode(refreshToken);

        // Si el refresh-token no tiene tiempo de expiración, se asume un tiempo de vida de 7 días  
        const exp = (!decoded.exp) ? (7 * 24 * 60 * 60) : decoded.exp;

        // Tiempo actual en segundos
        const now = Math.floor(Date.now() / 1000);

        // Tiempo restante hasta que expire el token (en segundos)
        const ttl = exp - now;

        if (ttl <= 0) {
            console.error("El refresh token ya está vencido");
            deleteRefreshToken();
            return;
        }

        // Determinar si estamos en desarrollo (sin HTTPS) o producción
        const isSecure = window.location.protocol === 'https:';
        
        // Construir la cookie con seguridad adaptada al ambiente
        let cookieString = `refresh_token=${refreshToken}; path=/; max-age=${ttl}`;
        
        if (isSecure) {
            // En producción (HTTPS), usar flags de seguridad
            cookieString += '; secure; samesite=strict';
        } else {
            // En desarrollo (HTTP), usar samesite=lax para compatibilidad
            cookieString += '; samesite=lax';
        }
        
        document.cookie = cookieString;

        console.log(`Refresh token guardado en cookie (TTL: ${ttl}s, Secure: ${isSecure})`);
    } catch (err) {
        console.error("Error al decodificar el refresh token:", err);
    }
}

export function getRefreshTokenFromCookie(){
    try {
        const value = `; ${document.cookie}`;
        const parts: string[] = value.split(`; refresh_token=`);
        if (parts.length === 2) {
            const token: string | undefined = parts.pop()?.split(";").shift();
            if (token) {
                console.log("Refresh token recuperado de la cookie");
                return token;
            }
        }
        console.warn("No hay refresh token disponible en la cookie");
        return null;
    } catch (err) {
        console.error("Error al recuperar el refresh token de la cookie:", err);
        return null;
    }
}

export function deleteRefreshToken() {
    try {
        document.cookie = "refresh_token=; path=/; max-age=0";
        console.log("Refresh token eliminado de la cookie");
    } catch (err) {
        console.error("Error al eliminar el refresh token:", err);
    }
}
