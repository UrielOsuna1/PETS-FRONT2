export interface LoginRequestDTO {
    // email del usuario 
    // obligatorio | formato de email
    email: string;

    // contraseña del usuario 
    // obligatorio | minimo 8 caracteres  
    // maximo 25 caracteres | no contener espacios
    // al menos una letra mayuscula, letra minuscula, numero y caracter especial
    password: string;
}