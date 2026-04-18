export interface RegisterClientRequestDTO {
    // nombre del usuario
    // obligatorio | maximo 100 caracteres
    // solo letras
    firstName: string;

    // apellido del usuario
    // obligatorio | maximo 100 caracteres
    // solo letras
    lastName: string;

    // email del usuario
    // obligatorio | maximo 100 caracteres
    // formato de email valido
    email: string;

    // contraseña del usuario
    // obligatorio | minimo 8 caracteres  
    // maximo 25 caracteres | no contener espacios
    // al menos una letra mayuscula, letra minuscula, numero y caracter especial
    password: string;

    // obligatorio | minimo 8 caracteres  
    // maximo 25 caracteres | no contener espacios
    // al menos una letra mayuscula, letra minuscula, numero y caracter especial
    // debe ser igual a password
    confirmPassword: string;

    // numero de telefono del usuario
    // opcional | formato de telefono valido (10 digitos)
    phone: string;
}
