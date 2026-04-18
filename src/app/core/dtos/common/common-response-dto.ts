export interface CommonResponseDTO<T> {
    success: boolean;
    data: T;
    message: string;
    errorCode?: string;
}