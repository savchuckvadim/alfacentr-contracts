import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';

export const getValidateEmail = async (email: string) => {
    try {
        const validate = await backAPI.service<{ errors?: string[] }>(
            EBACK_ENDPOINT.VALIDATE_CHECK_EMAIL,
            API_METHOD.POST,
            {
                email,
            },
        );

        return validate.errors?.[0] || '';
    } catch (error) {
        return '';
    }
};
