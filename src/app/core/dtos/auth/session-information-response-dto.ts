export interface SessionInformationResponseDTO {
    // nombre del usuario (texto plano)
    firstName: string;

    // apellido del usuario (texto plano)
    lastName: string;

    // email del usuario (encriptado)
    email: string;

    // teléfono del usuario (encriptado)
    phone: string;

    // fecha de creación del usuario (encriptada)
    createdAt: string;
}
